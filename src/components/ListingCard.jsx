import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScoreBadge from './ScoreBadge';
import { formatLKR, formatKm } from '../utils/format';
import { countStatus } from '../utils/report';
import { colors } from '../theme';

export default function ListingCard({ listing, onPress }) {
  const w = countStatus(listing.report.results, 'Warning');
  const f = countStatus(listing.report.results, 'Fail');
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
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
  title: { fontSize: 17, fontWeight: 'bold' },
  meta: { color: colors.muted, marginTop: 2 },
  price: { color: colors.pass, fontWeight: '700', fontSize: 16, marginTop: 4 },
  issues: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
