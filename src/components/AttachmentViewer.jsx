import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { getAttachmentData } from '../utils/storage';
import { openPdf, formatSize } from '../utils/files';
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
          <Text style={{ color: colors.muted, fontSize: 12 }}>PDF • {formatSize(att.size)}</Text>
        </View>
        <TouchableOpacity style={styles.openBtn} disabled={!data} onPress={() => openPdf(data)}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Open</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!data) return <Text style={{ color: colors.muted, marginBottom: 8 }}>Loading {att.name}...</Text>;
  return (
    <TouchableOpacity onPress={() => onOpenImage(data)} style={{ marginBottom: 10 }}>
      <Image source={{ uri: data }} style={styles.image} resizeMode="cover" />
      <Text style={styles.caption}>{att.name} (tap to enlarge)</Text>
    </TouchableOpacity>
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
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '95%', height: '85%' },
  close: { color: '#ccc', marginTop: 10 },
});
