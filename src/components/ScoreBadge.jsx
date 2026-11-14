import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, StyleSheet } from 'react-native';
import { Text } from './Themed';
import { scoreColor } from '../utils/report';

export default function ScoreBadge({ score, size = 'small' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const big = size === 'big';
  return (
    <View style={[styles.badge, { borderColor: scoreColor(score) }, big && styles.big]}>
      <Text style={[styles.score, { color: scoreColor(score) }, big && styles.bigText]}>{score}%</Text>
      <Text style={[styles.label, big && { fontSize: 12 }]}>inspection</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  badge: { borderWidth: 2, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center', minWidth: 64 },
  big: { paddingVertical: 10, paddingHorizontal: 16, minWidth: 96 },
  score: { fontSize: 18, fontWeight: 'bold' },
  bigText: { fontSize: 32 },
  label: { fontSize: 10, color: colors.muted },
});
