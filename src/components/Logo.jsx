import React from 'react';
import { Image } from 'react-native';

// Vahane.lk logo image (src/assets/logo.png). Pass the width you want; the height follows the image ratio.
const RATIO = 1673 / 858; // width / height of logo.png
export default function Logo({ width = 200 }) {
  return <Image source={require('../assets/logo.png')} style={{ width, height: width / RATIO }} resizeMode="contain" />;
}
