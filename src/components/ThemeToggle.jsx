import React from 'react';
import { TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Light / dark mode button. variant "header" sits on the red header bar, "plain" sits on the page.
export default function ThemeToggle({ variant = 'plain' }) {
  const { mode, colors, toggle } = useTheme();
  const bg = variant === 'header' ? 'rgba(255,255,255,0.22)' : colors.card;
  return (
    <TouchableOpacity
      onPress={toggle}
      accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={[styles.btn, { backgroundColor: bg, borderColor: variant === 'header' ? 'transparent' : colors.border }]}
    >
      <RNText style={styles.icon}>{mode === 'dark' ? '☀️' : '🌙'}</RNText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  icon: { fontSize: 20 },
});
