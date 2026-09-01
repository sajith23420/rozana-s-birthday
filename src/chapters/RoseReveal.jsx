import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { splitGlyphs } from '../lib/glyphs.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { PetalFall } from '../components/fx/PetalFall.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useAudio } from '../hooks/audioContext.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

/* ══════════════════════════════════════════════════════════════════
   08 — THE ROSE REVEAL

   Phase 2: Starts more minimal — deeper void, single rose, sparse
   particles. After interaction: staged bloom with more petals,
   atmosphere warms, particles multiply, light lifts. No confetti —
   the rose bloom IS the visual metaphor for the reveal.
   ══════════════════════════════════════════════════════════════════ */

/* Roses that arrive after the first one blooms. */
const COMPANIONS = [
  { x: 14, y: 66, s: 168, seed: 101, d: 0.4 },
  { x: 86, y: 60, s: 186, seed: 103, d: 0.6 },
  { x: 28, y: 24, s: 124, seed: 107, d: 0.8 },
  { x: 74, y: 20, s: 116, seed: 109, d: 1.0 },
  { x: 5, y: 30, s: 104, seed: 113, d: 1.2 },
  { x: 95, y: 34, s: 110, seed: 127, d: 1.4 },
  { x: 47, y: 10, s: 92, seed: 131, d: 1.6 },
  { x: 35, y: 85, s: 80, seed: 133, d: 1.8 },
  { x: 65, y: 88, s: 96, seed: 137, d: 2.0 },
];

export function RoseReveal() {
  const [picked, setPicked] = useState(false);
  const [payoff, setPayoff] = useState(false);
  const reduced = useReducedMotion();
  const roomy = useMediaQuery('(min-width: 640px)');
  const roseScale = roomy ? 1 : 0.52;
  const { fadeTo, volume } = useAudio();
  const volumeAtPick = useRef(0.55);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = () => {
    if (picked) return;
    setPicked(true);

    /* Music lifts with the visuals, then settles back. */
    volumeAtPick.current = volume;
    fadeTo(Math.min(1, volume + 0.28), 2200);
    timers.current.push(setTimeout(() => fadeTo(volumeAtPick.current, 3200), 5200));

    timers.current.push(setTimeout(() => { setPayoff(true); }, reduced ? 300 : 2400));
  };

  return (
    <Chapter
      id="reveal"
      className="overflow-hidden"
      backdrop={
        <>
          {/* The dark lifting */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(58% 50% at 50% 55%, rgba(88,21,42,0.85), transparent 72%),' +
                'radial-gradient(90% 70% at 50% 100%, rgba(61,15,30,0.7), transparent 70%)',
            }}
            animate={{ opacity: picked ? 1 : 0.25, scale: picked ? 1.3 : 0.85 }}
            transition={{ duration: 3.5, ease: EASE.bloom }}
          />

          {/* Warmth that builds */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(50% 45% at 50% 50%, rgba(200,85,110,0.2), transparent 65%)',
            }}
            animate={{ opacity: picked ? 1 : 0 }}
            transition={{ duration: 2, delay: 0.5, ease: EASE.silk }}
          />

          <ParticleField
            count={picked ? 160 : 20}
            intensity={picked ? 2.6 : 0.35}
            speed={picked ? 2 : 0.5}
            color="240, 223, 192"
            seed={137}
          />
          <PetalFall count={picked ? 40 : 0} active={picked} speed={picked ? 1 : 0} seed={139} />

          {/* Companion roses, opening around the first one */}
          <AnimatePresence>
            {picked && COMPANIONS.map((r) => (
              <motion.div
                key={r.seed}
                className="absolute blur-[1.5px]"
                style={{ left: `${r.x}%`, top: `${r.y}%`, translate: '-50% -50%' }}
                initial={{ opacity: 0, scale: 0.2, y: 50 }}
                animate={{ opacity: roomy ? 0.55 : 0.35, scale: 1, y: 0 }}
                transition={{ duration: 2, delay: r.d, ease: EASE.bloom }}
              >
                <Rose bloom={1} size={Math.round(r.s * roseScale)} seed={r.seed} glow={false} />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      }
    >
      {/* ── Centre stage ─────────────────────────────────── */}
      <div className="relative flex min-h-[70svh] flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {!payoff ? (
            <motion.div
              key="prompt"
              className="flex flex-col items-center"
              exit={{ opacity: 0, filter: 'blur(14px)', y: -24 }}
              transition={{ duration: 1, ease: EASE.veil }}
            >
              <motion.p
                className="t-display mb-14 text-[clamp(1.15rem,3.6vw,1.75rem)] italic text-paper-dim"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.6, ease: EASE.silk }}
              >
                {copy.reveal.prompt}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.8, ease: EASE.bloom }}
                animate={picked ? { scale: 1.5, y: -14 } : undefined}
              >
                <Rose bloom={picked ? 1 : 0.08} size={roomy ? 200 : 150} seed={149} />
              </motion.div>

              <motion.div
                className="mt-16"
                animate={{ opacity: picked ? 0 : 1, y: picked ? 16 : 0 }}
                transition={{ duration: 0.7 }}
              >
                <PremiumButton size="lg" onClick={pick} disabled={picked}>
                  {copy.reveal.cta}
                </PremiumButton>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="payoff"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.92, filter: 'blur(18px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: EASE.bloom }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: EASE.bloom }}
              >
                <Rose bloom={1} size={roomy ? 168 : 120} seed={149} />
              </motion.div>

              <h2 className="t-display-hero t-lg text-sheen mt-12 max-w-[14ch] leading-[0.98]">
                {splitGlyphs(copy.reveal.payoff)}
              </h2>

              <motion.span
                className="hairline mt-12 block w-44"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, delay: 0.8, ease: EASE.silk }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Chapter>
  );
}
