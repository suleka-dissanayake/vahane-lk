import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from '../components/Themed';
import Logo from '../components/Logo';

// Plain intro page shown when the app opens: the logo fades and scales in,
// then "Initializing..." animates with a progress bar that fills over the 5 seconds
export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    Animated.timing(progress, { toValue: 1, duration: 5000, useNativeDriver: false }).start();
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
        <Logo width={300} />
      </Animated.View>

      <View style={styles.bottom}>
        <View style={styles.textRow}>
          <Text style={styles.init}>Initializing</Text>
          <Text style={[styles.init, styles.dotsText]}>{'.'.repeat(dots)}</Text>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]} />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', bottom: 80, alignItems: 'center', width: '100%' },
  textRow: { flexDirection: 'row' },
  init: { color: colors.muted, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  dotsText: { width: 20 },
  track: { width: '55%', height: 5, borderRadius: 3, backgroundColor: colors.track, marginTop: 12, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
});
