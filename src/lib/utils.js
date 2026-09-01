/* Small shared helpers. */

export const cn = (...parts) => parts.filter(Boolean).join(' ');

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* Deterministic pseudo-random — same layout on every render and on
   every device, so particle fields do not reshuffle on re-mount. */
export function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
