export function sniffMime(b64, fallback) {
  const h = (b64 || '').slice(0, 16);
  if (h.startsWith('/9j/')) return 'image/jpeg';
  if (h.startsWith('iVBORw0KGgo')) return 'image/png';
  if (h.startsWith('R0lGOD')) return 'image/gif';
  if (h.startsWith('UklGR')) return 'image/webp';
  if (h.startsWith('JVBERi0')) return 'application/pdf';
  return fallback;
}
