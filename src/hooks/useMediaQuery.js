import { useCallback, useSyncExternalStore } from 'react';

/* Media queries as an external store — which is what they are.
   No effect, no cascading render, and always correct on the very
   first paint even if `query` changes. */
export function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/* Coarse pointer = phone/tablet. Drives the hover-vs-tap decision. */
export const useIsTouch = () => useMediaQuery('(pointer: coarse)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
