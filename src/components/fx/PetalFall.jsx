import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { seeded } from '../../lib/utils.js';

/* Falling rose petals. Canvas, one loop. Each petal is an ellipse
   whose horizontal squash follows its own rotation, which is enough
   to read as a petal tumbling through three dimensions. */

const PETAL_TONES = ['#7d1c33', '#a8425a', '#c8556e', '#e08b9e', '#d9be8e'];

function PetalFallBase({ count = 26, active = true, speed = 1, seed = 11, className = '' }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const reduced = useReducedMotion();

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = null, running = false;
    const rand = seeded(seed);
    const n = reduced ? Math.round(count * 0.25) : count;

    const petals = Array.from({ length: n }, (_, i) => ({
      x: rand(), y: rand() * 1.4 - 0.4,
      size: 3 + rand() * 5,
      vy: 0.00035 + rand() * 0.0007,
      sway: 0.4 + rand() * 1.3,
      swayAmp: 0.008 + rand() * 0.03,
      spin: (rand() - 0.5) * 0.03,
      rot: rand() * Math.PI * 2,
      tone: PETAL_TONES[i % PETAL_TONES.length],
      alpha: 0.22 + rand() * 0.34,
      phase: rand() * Math.PI * 2,
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
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      for (const p of petals) {
        if (!reduced && activeRef.current) {
          p.y += p.vy * speed;
          p.rot += p.spin * speed;
          if (p.y > 1.15) { p.y = -0.15; p.x = Math.random(); }
        }
        const drift = Math.sin(t * p.sway + p.phase) * p.swayAmp;
        const x = (p.x + drift) * w;
        const y = p.y * h;
        /* Squash horizontally with rotation → the tumble. */
        const squash = Math.abs(Math.cos(p.rot)) * 0.75 + 0.25;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * squash, p.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.tone;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };

    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      onScreen && !document.hidden ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    const onVis = () => { document.hidden || !onScreen ? stop() : start(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count, speed, seed, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

export const PetalFall = memo(PetalFallBase);
