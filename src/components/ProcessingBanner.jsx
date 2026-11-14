import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../context/ThemeContext';

const STEPS = ['Reading your inspection report…', 'Finding the vehicle details…', 'Filling in the form…'];

// Shown while the attached report is being read: spinner, moving progress bar and changing status text
export default function ProcessingBanner() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const slide = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(slide, { toValue: 1, duration: 1400, useNativeDriver: true }));
    loop.start();
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1600);
    return () => { loop.stop(); clearInterval(t); };
  }, []);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.4, width] });

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>{STEPS[step]}</Text>
      </View>
      <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.bar, { transform: [{ translateX }] }]} />
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    box: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row', alignItems: 'center' },
    text: { marginLeft: 10, fontWeight: '600' },
    track: { height: 6, borderRadius: 3, backgroundColor: colors.track, marginTop: 12, overflow: 'hidden' },
    bar: { width: '40%', height: 6, borderRadius: 3, backgroundColor: colors.primary },
  });
