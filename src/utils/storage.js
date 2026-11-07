import AsyncStorage from '@react-native-async-storage/async-storage';
import seedListings from '../data/listings.json';
import seedUsers from '../data/users.json';

const K = {
  listings: 'vahane_listings',
  users: 'vahane_users',
  session: 'vahane_session',
  draft: 'vahane_draft',
};

// Simple (non-secure) hash so passwords are not stored as plain text. Local demo only.
export function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return String(h >>> 0);
}

async function read(key, fallback) {
  try {
    const j = await AsyncStorage.getItem(key);
    return j ? JSON.parse(j) : fallback;
  } catch (e) {
    return fallback;
  }
}
const write = (key, val) => AsyncStorage.setItem(key, JSON.stringify(val));

// Seed the local dataset on first launch
export async function initData() {
  try {
    if ((await AsyncStorage.getItem(K.listings)) === null) await write(K.listings, seedListings);
    if ((await AsyncStorage.getItem(K.users)) === null) {
      await write(K.users, seedUsers.map((u) => ({ ...u, password: hash(u.password) })));
    }
  } catch (e) {}
}

// ---- Listings ----
export const getListings = () => read(K.listings, []);
export async function getListing(id) {
  return (await getListings()).find((l) => l.id === id) || null;
}
export async function addListing(listing) {
  const list = await getListings();
  await write(K.listings, [listing, ...list]);
}
export async function deleteListing(id) {
  const list = await getListings();
  const target = list.find((l) => l.id === id);
  await write(K.listings, list.filter((l) => l.id !== id));
  if (target && target.attachments && target.attachments.length) await removeAttachments(target.attachments);
  if (target && target.photoId) await removeAttachments([{ id: target.photoId }]);
}

// ---- Attachments (report photos / PDFs), stored under their own keys ----
const attKey = (id) => 'vahane_att_' + id;
export const saveAttachmentData = (id, dataUri) => AsyncStorage.setItem(attKey(id), dataUri);
export const getAttachmentData = async (id) => {
  try {
    return await AsyncStorage.getItem(attKey(id));
  } catch (e) {
    return null;
  }
};
export async function removeAttachments(list) {
  try {
    await Promise.all(list.map((a) => AsyncStorage.removeItem(attKey(a.id))));
  } catch (e) {}
}

// ---- Users / session ----
export async function registerUser({ name, username, password, phone }) {
  const users = await read(K.users, []);
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'That username is already taken' };
  }
  const user = { id: 'u' + Date.now(), name, username, phone, password: hash(password) };
  await write(K.users, [...users, user]);
  await AsyncStorage.setItem(K.session, user.id);
  return { ok: true, user };
}
export async function loginUser(username, password) {
  const users = await read(K.users, []);
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === hash(password)
  );
  if (!user) return { ok: false, error: 'Wrong username or password' };
  await AsyncStorage.setItem(K.session, user.id);
  return { ok: true, user };
}
export async function getSessionUser() {
  try {
    const id = await AsyncStorage.getItem(K.session);
    if (!id) return null;
    return (await read(K.users, [])).find((u) => u.id === id) || null;
  } catch (e) {
    return null;
  }
}
export const clearSession = () => AsyncStorage.removeItem(K.session);

// ---- Inspection draft (progress saving) ----
export const getDraft = () => read(K.draft, null);
export const saveDraft = (d) => write(K.draft, d).catch(() => {});
export const clearDraft = () => AsyncStorage.removeItem(K.draft).catch(() => {});
