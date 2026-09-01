import { useMediaQuery } from './useMediaQuery.js';

/* Single source of truth for motion preference. Live-updates if the
   visitor flips the OS setting mid-visit. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
