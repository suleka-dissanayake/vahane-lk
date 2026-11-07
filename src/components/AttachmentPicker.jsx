import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { pickPhoto, takePhoto, pickPdf, formatSize, MAX_FILES, MAX_BYTES } from '../utils/files';
import { notify } from '../utils/alert';
import { colors } from '../theme';

export default function AttachmentPicker({ items, onChange }) {
  const add = async (picker) => {
    if (items.length >= MAX_FILES) return notify(`You can attach up to ${MAX_FILES} files`);
    const file = await picker();
    if (file) onChange([...items, file]);
  };
  const remove = (id) => onChange(items.filter((i) => i.id !== id));

  return (
    <View style={styles.box}>
      <Text style={styles.head}>📎 Official inspection report (optional)</Text>
      <Text style={styles.sub}>
        Attach a photo or PDF of a professional inspection report. Up to {MAX_FILES} files, {formatSize(MAX_BYTES)} each.
      </Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => add(pickPhoto)}>
          <Text style={styles.btnText}>🖼️ Photo</Text>
        </TouchableOpacity>
        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.btn} onPress={() => add(takePhoto)}>
            <Text style={styles.btnText}>📷 Camera</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => add(pickPdf)}>
          <Text style={styles.btnText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      {items.map((f) => (
        <View key={f.id} style={styles.file}>
          {f.type === 'image' ? (
            <Image source={{ uri: f.dataUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.pdfThumb]}>
              <Text style={{ fontSize: 22 }}>📄</Text>
            </View>
          )}
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text numberOfLines={1} style={{ fontWeight: '600' }}>{f.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{formatSize(f.size)}</Text>
          </View>
          <TouchableOpacity onPress={() => remove(f.id)}>
            <Text style={{ color: colors.fail, fontWeight: '600' }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 16 },
  head: { fontWeight: 'bold', fontSize: 16 },
  sub: { color: colors.muted, marginTop: 2, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  btn: { backgroundColor: colors.chip, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  btnText: { fontWeight: '600', color: colors.primary },
  file: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#eee' },
  pdfThumb: { alignItems: 'center', justifyContent: 'center' },
});
