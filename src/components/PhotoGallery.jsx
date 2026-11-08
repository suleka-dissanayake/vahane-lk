import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Image, View, Text, Modal, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { getAttachmentData } from '../utils/storage';

// Horizontal gallery of an ad's vehicle photos. Tap a photo to view it full screen (swipe for the others).
export default function PhotoGallery({ ids }) {
  const [uris, setUris] = useState([]);
  const [open, setOpen] = useState(null); // index of the photo shown full screen
  const { width, height } = useWindowDimensions();
  const pager = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.all(ids.map((id) => getAttachmentData(id))).then((list) => alive && setUris(list.filter(Boolean)));
    return () => { alive = false; };
  }, [ids.join(',')]);

  if (!uris.length) return null;
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
        {uris.map((u, i) => (
          <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => setOpen(i)}>
            <Image source={{ uri: u }} style={styles.img} />
          </TouchableOpacity>
        ))}
        <View style={{ width: 4 }} />
      </ScrollView>

      <Modal visible={open !== null} animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(null)}>
        <View style={styles.viewer}>
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onLayout={() => open !== null && pager.current && pager.current.scrollTo({ x: open * width, animated: false })}
            onMomentumScrollEnd={(e) => setOpen(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {uris.map((u, i) => (
              <View key={i} style={{ width, height, justifyContent: 'center' }}>
                <Image source={{ uri: u }} style={{ width, height: height * 0.85 }} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.close} onPress={() => setOpen(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {open !== null && <Text style={styles.counter}>{open + 1} / {uris.length}</Text>}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 10 },
  img: { width: 260, height: 180, borderRadius: 12, marginRight: 10, backgroundColor: '#eee' },
  viewer: { flex: 1, backgroundColor: '#000' },
  close: { position: 'absolute', top: 44, right: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  counter: { position: 'absolute', bottom: 40, alignSelf: 'center', color: '#fff', fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
});
