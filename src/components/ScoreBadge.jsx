import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scoreColor } from '../utils/report';

export default function ScoreBadge({ score, size = 'small' }) {
  const big = size === 'big';
  return (
    <View style={[styles.badge, { borderColor: scoreColor(score) }, big && styles.big]}>
      <Text style={[styles.score, { color: scoreColor(score) }, big && styles.bigText]}>{score}%</Text>
      <Text style={[styles.label, big && { fontSize: 12 }]}>inspection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 2, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center', minWidth: 64 },
  big: { paddingVertical: 10, paddingHorizontal: 16, minWidth: 96 },
  score: { fontSize: 18, fontWeight: 'bold' },
  bigText: { fontSize: 32 },
  label: { fontSize: 10, color: '#666' },
});
