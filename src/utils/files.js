import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { notify } from './alert';
import { sniffMime } from './mime';

export const MAX_FILES = 3;
export const MAX_BYTES = 1024 * 1024; // 1 MB per file (device storage is limited)

export const formatSize = (b) => (b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB');
const approxBytes = (d) => Math.round(((d.length - d.indexOf(',') - 1) * 3) / 4);

function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function assetToDataUri(asset, fallbackMime) {
  if (asset.base64) return `data:${sniffMime(asset.base64, asset.mimeType || fallbackMime)};base64,${asset.base64}`;
  if (asset.uri && asset.uri.startsWith('data:')) return asset.uri;
  if (asset.file) return blobToDataUri(asset.file);
  // Reads the picked file from the device itself (local file, not a network request)
  const blob = await (await fetch(asset.uri)).blob();
  return blobToDataUri(blob);
}

async function build(asset, type, fallbackMime) {
  const dataUri = await assetToDataUri(asset, fallbackMime);
  const size = approxBytes(dataUri);
  if (size > MAX_BYTES) {
    notify('File too large', `Maximum size is ${formatSize(MAX_BYTES)}. This file is ${formatSize(size)}.`);
    return null;
  }
  return {
    id: 'A' + Date.now() + Math.random().toString(36).slice(2, 6),
    name: asset.fileName || asset.name || (type === 'pdf' ? 'report.pdf' : 'photo.jpg'),
    type,
    size,
    dataUri,
  };
}

export async function pickPhoto() {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: true });
    if (res.canceled) return null;
    return await build(res.assets[0], 'image', 'image/jpeg');
  } catch (e) {
    notify('Could not open the photo picker');
    return null;
  }
}

export async function takePhoto() {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      notify('Camera permission is needed to take a photo');
      return null;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
    if (res.canceled) return null;
    return await build(res.assets[0], 'image', 'image/jpeg');
  } catch (e) {
    notify('Could not open the camera');
    return null;
  }
}

export async function pickPdf() {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (res.canceled) return null;
    const asset = res.assets[0];
    if (asset.mimeType && !asset.mimeType.includes('pdf')) {
      notify('Please choose a PDF file');
      return null;
    }
    return await build(asset, 'pdf', 'application/pdf');
  } catch (e) {
    notify('Could not open the file picker');
    return null;
  }
}

export function openPdf(dataUri) {
  if (Platform.OS === 'web') {
    const bin = atob(dataUri.split(',')[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    window.open(url, '_blank');
  } else {
    notify('PDF preview', 'PDF viewing is available in the web version. Images open inside the app.');
  }
}

// Download an attached report file.
// Web: normal browser download. Phone: saves a temporary copy and opens the share sheet (Save to Files / Drive, WhatsApp, etc.)
export async function downloadFile(name, dataUri) {
  const [head, b64] = dataUri.split(',');
  const mime = (head.match(/^data:(.*?);base64$/) || [])[1] || 'application/octet-stream';
  const ext = mime === 'application/pdf' ? '.pdf' : mime === 'image/png' ? '.png' : '.jpg';
  const base = (name || 'inspection-report').replace(/[^\w.\- ]+/g, '_');
  const fileName = /\.\w{2,4}$/.test(base) ? base : base + ext;

  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  try {
    const { File, Paths } = require('expo-file-system');
    const Sharing = require('expo-sharing');
    const file = new File(Paths.cache, `${Date.now()}_${fileName}`);
    file.write(b64, { encoding: 'base64' });
    if (!(await Sharing.isAvailableAsync())) return notify('Download is not available on this device');
    await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: 'Save inspection report' });
  } catch (e) {
    notify('Could not download the file', 'Please try again.');
  }
}
