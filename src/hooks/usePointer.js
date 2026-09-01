import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';

/* Normalised pointer position (-1..1 from centre), smoothed.
   Returns a ref for rAF consumers and state for React consumers that
   can tolerate a throttled update. Inert on touch and reduced motion. */
export function usePointer({ smooth = 0.08, asState = false } = {}) {
  const target = useRef({ x: 0, y: 0 });
  const value = useRef({ x: 0, y: 0 });
  const [state, setState] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf;
    let frame = 0;
    const tick = () => {
      value.current.x += (target.current.x - value.current.x) * smooth;
      value.current.y += (target.current.y - value.current.y) * smooth;
      /* Throttle React updates to every 3rd frame — the visual
         difference is nil, the render cost is a third. */
      if (asState && ++frame % 3 === 0) {
        setState({ x: value.current.x, y: value.current.y });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [smooth, asState, reduced]);

  return { ref: value, ...state };
}
