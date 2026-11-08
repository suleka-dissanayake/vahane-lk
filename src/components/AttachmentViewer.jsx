import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { getAttachmentData } from '../utils/storage';
import { openPdf, downloadFile, formatSize } from '../utils/files';
import { colors } from '../theme';

function FileItem({ att, onOpenImage }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    getAttachmentData(att.id).then(setData);
  }, [att.id]);

  if (att.type === 'pdf') {
    return (
      <View style={styles.pdfRow}>
        <Text style={{ fontSize: 26 }}>📄</Text>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text numberOfLines={1} style={{ fontWeight: '600' }}>{att.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Inspection report • PDF • {formatSize(att.size)}</Text>
        </View>
        {Platform.OS === 'web' && (
          <TouchableOpacity style={[styles.openBtn, { marginRight: 8 }]} disabled={!data} onPress={() => openPdf(data)}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Open</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.downloadBtn} disabled={!data} onPress={() => downloadFile(att.name, data)}>
          <Text style={styles.downloadText}>⬇ Download</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!data) return <Text style={{ color: colors.muted, marginBottom: 8 }}>Loading {att.name}...</Text>;
  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity onPress={() => onOpenImage(data)}>
        <Image source={{ uri: data }} style={styles.image} resizeMode="cover" />
        <Text style={styles.caption}>{att.name} (tap to enlarge)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.downloadBtn, { alignSelf: 'flex-start', marginTop: 6 }]} onPress={() => downloadFile(att.name, data)}>
        <Text style={styles.downloadText}>⬇ Download inspection report</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AttachmentViewer({ attachments }) {
  const [full, setFull] = useState(null);
  return (
    <View style={styles.box}>
      {attachments.map((a) => (
        <FileItem key={a.id} att={a} onOpenImage={setFull} />
      ))}
      <Modal visible={!!full} transparent animationType="fade" onRequestClose={() => setFull(null)}>
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setFull(null)}>
          {full && <Image source={{ uri: full }} style={styles.fullImage} resizeMode="contain" />}
          <Text style={styles.close}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#eee' },
  caption: { color: colors.muted, fontSize: 12, marginTop: 4 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  openBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  downloadBtn: { backgroundColor: colors.pass, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  downloadText: { color: '#fff', fontWeight: '700' },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '95%', height: '85%' },
  close: { color: '#ccc', marginTop: 10 },
});
