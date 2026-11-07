import React, { useEffect, useState } from 'react';
import { ScrollView, Image, View, StyleSheet } from 'react-native';
import { getAttachmentData } from '../utils/storage';

// Horizontal gallery of an ad's vehicle photos
export default function PhotoGallery({ ids }) {
  const [uris, setUris] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all(ids.map((id) => getAttachmentData(id))).then((list) => alive && setUris(list.filter(Boolean)));
    return () => { alive = false; };
  }, [ids.join(',')]);

  if (!uris.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
      {uris.map((u, i) => (
        <Image key={i} source={{ uri: u }} style={styles.img} />
      ))}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 10 },
  img: { width: 260, height: 180, borderRadius: 12, marginRight: 10, backgroundColor: '#eee' },
});
