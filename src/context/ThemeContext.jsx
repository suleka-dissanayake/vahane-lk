import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { lightColors, darkColors } from '../theme';
import { getTheme, saveTheme } from '../utils/storage';

const ThemeContext = createContext({ mode: 'light', colors: lightColors, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    getTheme().then((m) => setMode(m === 'dark' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      toggle: () =>
        setMode((m) => {
          const next = m === 'dark' ? 'light' : 'dark';
          saveTheme(next);
          return next;
        }),
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
