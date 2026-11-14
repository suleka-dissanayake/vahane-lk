const shared = {
  pass: '#2a9d8f',
  warning: '#e9c46a',
  fail: '#e63946',
};

export const lightColors = {
  ...shared,
  bg: '#fbf5f5',
  primary: '#9b0d18',   // main dark red (buttons, headers)
  accent: '#b3172a',    // red for links and highlights
  card: '#ffffff',
  text: '#1b1b1b',
  muted: '#666666',
  edit: '#b38600',      // dark yellow for Edit buttons
  chip: '#f3e1e1',
  border: '#ecd0d0',
  tint: '#fde8e8',
  track: '#f3d6d6',
  placeholder: '#f6eaea',
  warnBg: '#fff8e6',
  issueBg: '#fff4f4',
  issueBorder: '#f3c4c8',
};

export const darkColors = {
  ...shared,
  bg: '#141012',
  primary: '#b3172a',
  accent: '#ff6b78',
  card: '#1f1a1b',
  text: '#f2eeee',
  muted: '#a89fa0',
  edit: '#e0a800',
  chip: '#2e2425',
  border: '#3d2e30',
  tint: '#3a1d22',
  track: '#3d2e30',
  placeholder: '#2e2a2b',
  warnBg: '#3a2f12',
  issueBg: '#3a1a1d',
  issueBorder: '#6b2a30',
};

// Static light colours, only for places that don't change with the theme (pass / warning / fail)
export const colors = lightColors;
