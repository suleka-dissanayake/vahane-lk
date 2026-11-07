import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ScoreBadge from './ScoreBadge';
import { formatLKR, formatKm } from '../utils/format';
import { countStatus } from '../utils/report';
import { getAttachmentData } from '../utils/storage';
import { colors } from '../theme';

const ICONS = { car: '🚗', sedan: '🚗', hatchback: '🚗', suv: '🚙', van: '🚐', lorry: '🚚', truck: '🛻', pickup: '🛻', motorcycle: '🏍️', threewheel: '🛺' };

// showPhoto: small vehicle photo box on the left (used on the search results page)
export default function ListingCard({ listing, onPress, showPhoto }) {
  const w = countStatus(listing.report.results, 'Warning');
  const f = countStatus(listing.report.results, 'Fail');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let alive = true;
    if (showPhoto && listing.photoId) getAttachmentData(listing.photoId).then((d) => alive && setPhoto(d));
    return () => { alive = false; };
  }, [showPhoto, listing.photoId]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {showPhoto && (
        photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Text style={{ fontSize: 30 }}>{ICONS[String(listing.category).toLowerCase()] || '🚗'}</Text>
          </View>
        )
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {listing.make} {listing.model} {listing.year}
        </Text>
        <Text style={styles.meta}>
          {listing.category} • {formatKm(listing.mileage)} • {listing.district}
        </Text>
        <Text style={styles.price}>{formatLKR(listing.price)}</Text>
        <Text style={styles.issues}>
          {f} fail • {w} warning{listing.attachments && listing.attachments.length ? '  • 📎 report file' : ''}
        </Text>
      </View>
      <ScoreBadge score={listing.report.score} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  photo: { width: 84, height: 72, borderRadius: 10, marginRight: 12, backgroundColor: '#eef1f6' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: 'bold' },
  meta: { color: colors.muted, marginTop: 2 },
  price: { color: colors.pass, fontWeight: '700', fontSize: 16, marginTop: 4 },
  issues: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
