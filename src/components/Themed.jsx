import React from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Text and TextInput that follow the light / dark theme by default
export function Text({ style, ...rest }) {
  const { colors } = useTheme();
  return <RNText {...rest} style={[{ color: colors.text }, style]} />;
}

export function TextInput({ style, ...rest }) {
  const { colors } = useTheme();
  return <RNTextInput placeholderTextColor={colors.muted} {...rest} style={[{ color: colors.text }, style]} />;
}
