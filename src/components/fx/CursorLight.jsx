import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/* ══════════════════════════════════════════════════════════════════
   A soft radial light that follows the cursor on desktop. Purely
   atmospheric — it sits under the grain layer and is invisible on
   touch devices and under reduced motion.

   Renders as a single div positioned via transform, driven by a rAF
   loop that reads the last-known pointer position. No React state
   updates, no re-renders.
   ══════════════════════════════════════════════════════════════════ */

function CursorLightBase() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    /* Skip on touch devices entirely. */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = ref.current;
    if (!el) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      el.style.transform = `translate3d(${cx - 260}px, ${cy - 260}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 hidden lg:block"
      style={{
        zIndex: 'var(--z-cursor)',
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,85,110,0.06) 0%, rgba(217,190,142,0.04) 30%, transparent 65%)',
        willChange: 'transform',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
}

export const CursorLight = memo(CursorLightBase);
