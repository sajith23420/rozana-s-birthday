import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { seeded } from '../../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   Atmospheric dust. One canvas, one rAF loop, no React re-renders.

   Pauses when the tab is hidden and when scrolled out of view, so it
   never burns battery on a phone sitting in someone's hand.
   `intensity` (0..1+) is animatable from the outside via a ref-like
   prop — chapters raise it at their climax.
   ══════════════════════════════════════════════════════════════════ */

function ParticleFieldBase({
  count = 60,
  intensity = 1,
  color = '216, 190, 142',
  speed = 1,
  seed = 3,
  className = '',
}) {
  const canvasRef = useRef(null);
  const intensityRef = useRef(intensity);
  const reduced = useReducedMotion();

  /* Kept in a ref so a chapter can drive intensity every frame
     without re-running the animation loop. */
  useEffect(() => { intensityRef.current = intensity; }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let raf = null;
    let visible = true;
    let running = false;

    const rand = seeded(seed);
    const n = reduced ? Math.round(count * 0.3) : count;

    const particles = Array.from({ length: n }, () => ({
      x: rand(), y: rand(),
      r: 0.4 + rand() * 1.7,
      vx: (rand() - 0.5) * 0.00016,
      vy: -(0.00006 + rand() * 0.00022),
      phase: rand() * Math.PI * 2,
      twinkle: 0.4 + rand() * 1.4,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;
    const draw = () => {
      t += 0.016 * speed;
      ctx.clearRect(0, 0, w, h);
      const k = intensityRef.current;

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx * speed;
          p.y += p.vy * speed * k;
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
        }
        const flicker = 0.45 + 0.55 * Math.sin(t * p.twinkle + p.phase);
        const alpha = Math.min(0.85, flicker * 0.5 * k);
        const radius = p.r * (1 + k * 0.25);

        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    };

    /* Only animate while actually on screen and the tab is focused. */
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; visible && !document.hidden ? start() : stop(); },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVis = () => { document.hidden || !visible ? stop() : start(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count, color, speed, seed, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

export const ParticleField = memo(ParticleFieldBase);
