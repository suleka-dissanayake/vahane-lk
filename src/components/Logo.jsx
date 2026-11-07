import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Vahane.lk logo: rounded badge with a "V" and a green "inspected" tick dot, plus the wordmark
export default function Logo({ size = 44 }) {
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Text style={[styles.v, { fontSize: size * 0.68, lineHeight: size * 0.8 }]}>V</Text>
        <View style={[styles.tick, { width: size * 0.36, height: size * 0.36, borderRadius: size * 0.18 }]}>
          <Text style={[styles.tickText, { fontSize: size * 0.22 }]}>✓</Text>
        </View>
      </View>
      <View style={{ marginLeft: 10 }}>
        <Text style={[styles.word, { fontSize: size * 0.6 }]}>
          Vahane<Text style={styles.lk}>.lk</Text>
        </Text>
        <Text style={styles.tag}>Inspected vehicles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  v: { color: '#fff', fontWeight: '900' },
  tick: { position: 'absolute', right: -4, bottom: -4, backgroundColor: colors.pass, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  tickText: { color: '#fff', fontWeight: '900' },
  word: { color: colors.primary, fontWeight: '900', letterSpacing: -0.5 },
  lk: { color: colors.accent, fontWeight: '700' },
  tag: { color: colors.muted, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: -2 },
});
