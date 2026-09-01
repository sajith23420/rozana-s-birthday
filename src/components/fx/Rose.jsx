import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { seeded } from '../../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   The rose. Layered petals arranged on a golden-angle spiral, so it
   reads as a bloom rather than a flower icon.

   `bloom` (0..1) drives everything: a closed bud at 0, an open rose
   at 1. Outer layers open first and travel furthest, which is the
   order a real rose opens in.

   Each petal carries its own tone and a darker rim. Without that
   separation the stack collapses into a single pink disc — the
   edges are what make it legible as petals.
   ══════════════════════════════════════════════════════════════════ */

const GOLDEN = 137.5;

/* Outer → inner. Darker and larger outside, brightest at the heart. */
const LAYERS = [
  { count: 7, radius: 42, scale: 1.00, fill: '#5c1226', rim: '#3a0a17' },
  { count: 6, radius: 32, scale: 0.84, fill: '#7d1c33', rim: '#4a0f20' },
  { count: 6, radius: 23, scale: 0.68, fill: '#a8425a', rim: '#6a1930' },
  { count: 5, radius: 14, scale: 0.52, fill: '#c8556e', rim: '#8b2f46' },
  { count: 3, radius: 6,  scale: 0.38, fill: '#e08b9e', rim: '#a8425a' },
];

function buildPetals(seed) {
  const rand = seeded(seed);
  const petals = [];
  let n = 0;

  LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      petals.push({
        id: `p${li}-${i}`,
        angle: (n++ * GOLDEN) % 360 + (rand() - 0.5) * 12,
        radius: layer.radius,
        scale: layer.scale * (0.92 + rand() * 0.16),
        fill: layer.fill,
        rim: layer.rim,
        depth: LAYERS.length - li,
      });
    }
  });

  /* Outermost drawn first so inner petals sit on top. */
  return petals.sort((a, b) => b.depth - a.depth);
}

function RoseBase({ bloom = 1, size = 220, seed = 7, glow = true, className = '' }) {
  const petals = useMemo(() => buildPetals(seed), [seed]);
  const uid = `rose-${seed}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#f3d3da" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#c8556e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5c1226" stopOpacity="0" />
        </radialGradient>
        {/* Light falls from the upper left, as it does everywhere else
            in this world — the same key light as the letter and the
            record. */}
        <linearGradient id={`${uid}-key`} x1="18%" y1="0%" x2="76%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>
      </defs>

      {glow && (
        <motion.circle
          r="70" cx="0" cy="0"
          fill={`url(#${uid}-glow)`}
          initial={false}
          animate={{ opacity: 0.2 + bloom * 0.6, scale: 0.65 + bloom * 0.5 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {petals.map((p) => {
        /* Outer petals swing out further as the rose opens. */
        const openness = bloom * (0.3 + p.depth * 0.17);
        const dist = p.radius * openness;
        const rot = p.angle + bloom * (16 - p.depth * 3);
        const petalScale = p.scale * (0.4 + bloom * 0.64);
        const rad = ((rot - 90) * Math.PI) / 180;

        return (
          <motion.g
            key={p.id}
            initial={false}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              rotate: rot,
              scale: petalScale,
            }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* A petal: wide at the lip, tapering into the centre. */}
            <path
              d="M0 0 C -21 -8, -27 -30, -14 -44 C -7 -52, 7 -52, 14 -44 C 27 -30, 21 -8, 0 0 Z"
              fill={p.fill}
              stroke={p.rim}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M0 0 C -21 -8, -27 -30, -14 -44 C -7 -52, 7 -52, 14 -44 C 27 -30, 21 -8, 0 0 Z"
              fill={`url(#${uid}-key)`}
            />
          </motion.g>
        );
      })}

      {/* The heart stays tight and catches the light last. */}
      <motion.circle
        cx="0" cy="0" r="6"
        fill="#3d0f1e"
        initial={false}
        animate={{ scale: 1 - bloom * 0.2 }}
        transition={{ duration: 1.4 }}
      />
      <motion.circle
        cx="-1.6" cy="-2.4" r="2.4"
        fill="#f3d3da"
        initial={false}
        animate={{ opacity: 0.3 + bloom * 0.5 }}
        transition={{ duration: 1.4 }}
      />
    </svg>
  );
}

export const Rose = memo(RoseBase);
