import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { seeded } from '../../lib/utils.js';

/* A handful of slow warm lights. Deliberately few — restraint is the
   difference between "garden at night" and "screensaver". */
function FirefliesBase({ count = 12, seed = 21 }) {
  const reduced = useReducedMotion();

  const flies = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: 25 + rand() * 65,
      dx: (rand() - 0.5) * 16,
      dy: -(8 + rand() * 22),
      size: 2 + rand() * 3.5,
      dur: 10 + rand() * 14,
      delay: rand() * 12,
    }));
  }, [count, seed]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flies.map((f) => (
        <motion.span
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            background: 'radial-gradient(circle, #f0dfc0 0%, #d9be8e 45%, transparent 70%)',
            boxShadow: '0 0 12px 3px rgba(217, 190, 142, 0.35)',
          }}
          animate={{
            x: [0, f.dx, f.dx * 0.4, 0],
            y: [0, f.dy, f.dy * 1.6, 0],
            opacity: [0, 0.85, 0.2, 0.7, 0],
          }}
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export const Fireflies = memo(FirefliesBase);
