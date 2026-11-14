import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Vahane.lk logo image. Pass the width you want; the height follows the image ratio.
const RATIO = 1749 / 868; // width / height of the logo images
export default function Logo({ width = 200 }) {
  const { mode } = useTheme();
  const source = mode === 'dark' ? require('../assets/logo-dark.png') : require('../assets/logo.png');
  return <Image source={source} style={{ width, height: width / RATIO }} resizeMode="contain" />;
}
