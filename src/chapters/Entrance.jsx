import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rose } from '../components/fx/Rose.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { splitGlyphs } from '../lib/glyphs.jsx';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   01 — THE ENTRANCE

   Not a loading screen. A held breath.

   The screen starts genuinely black. A bud appears as a point of
   light, two lines are spoken, then the welcome and the door. On
   entry the rose blooms, the particle field expands outward, and the
   whole gate irises away — which is also the gesture that unlocks
   audio.

   Phase 2: floating dust, volumetric breathing glow, cinematic
   vignette, subtle grain, improved bloom staging.
   ══════════════════════════════════════════════════════════════════ */

const STAGES = [0, 2800, 5800, 8000];   // dark → line1 → line2 → welcome

/* Floating dust motes — extremely slow, warm-toned, sparse. */
function FloatingDust({ count = 18, seed = 42 }) {
  const reduced = useReducedMotion();
  const motes = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: 30 + rand() * 60,
      size: 1 + rand() * 2.5,
      dur: 14 + rand() * 18,
      delay: rand() * 10,
      drift: (rand() - 0.5) * 30,
    }));
  }, [count, seed]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            background: 'radial-gradient(circle, rgba(240,223,192,0.7) 0%, transparent 70%)',
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, m.drift * 0.5, m.drift],
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.2, 0.6],
          }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function Entrance({ onEnter, express = false }) {
  const [timedStage, setTimedStage] = useState(0);
  const [entering, setEntering] = useState(false);
  const reduced = useReducedMotion();

  /* With motion reduced — or on a replay, where the opening lines
     have already been read once — there is no reason to make anyone
     wait. The door is simply already there. */
  const skip = reduced || express;
  const stage = skip ? 3 : timedStage;

  useEffect(() => {
    if (skip) return;
    const timers = STAGES.slice(1).map((ms, i) =>
      setTimeout(() => setTimedStage(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [skip]);

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    /* Let the bloom read before handing over the screen. */
    setTimeout(() => onEnter?.(), reduced ? 200 : 1700);
  };

  /* Three-stage bloom: bud → half-open → full */
  const bloom = entering ? 1 : stage >= 3 ? 0.25 : stage >= 1 ? 0.12 : 0.05;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-void px-6"
      style={{ zIndex: 'var(--z-gate)' }}
      exit={{ opacity: 0, filter: 'blur(18px)', scale: 1.08 }}
      transition={{ duration: 1.3, ease: EASE.veil }}
    >
      {/* Cinematic vignette — deep dark edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 32%, rgba(3,2,6,0.5) 68%, rgba(3,2,6,0.88) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle film grain */}
      <div
        className="pointer-events-none absolute inset-0 film-grain mix-blend-soft-light"
        style={{ opacity: 0.12 }}
        aria-hidden="true"
      />

      {/* Deep burgundy pool that swells as we enter */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(88,21,42,0.5) 0%, rgba(26,7,16,0.35) 35%, transparent 68%)',
        }}
        animate={{ opacity: entering ? 1 : 0.35, scale: entering ? 1.5 : 0.85 }}
        transition={{ duration: 2, ease: EASE.bloom }}
      />

      {/* Volumetric breathing glow behind the rose */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 420,
          height: 420,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -58%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,85,110,0.25) 0%, rgba(168,66,90,0.12) 35%, transparent 65%)',
        }}
        animate={{
          opacity: entering ? [0.6, 0.9, 0.6] : [0.22, 0.48, 0.22],
          scale: entering ? [1.1, 1.35, 1.1] : [0.94, 1.08, 0.94],
        }}
        transition={{
          duration: entering ? 2.5 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />

      <ParticleField
        count={entering ? 110 : 34}
        intensity={entering ? 2.4 : 0.7}
        speed={entering ? 3 : 1}
        color="216, 190, 142"
        seed={5}
      />

      <FloatingDust />

      {/* ── The bud ─────────────────────────────────────────── */}
      <motion.div
        className="relative mb-10 sm:mb-14"
        initial={{ opacity: 0, scale: 0.15 }}
        animate={{ opacity: 1, scale: entering ? 1.35 : 1 }}
        transition={{
          opacity: { duration: 3.5, ease: EASE.silk },
          scale: { duration: entering ? 1.8 : 4, ease: EASE.bloom },
        }}
      >
        <Rose bloom={bloom} size={entering ? 210 : 150} seed={4} />
      </motion.div>

      {/* ── The lines ───────────────────────────────────────── */}
      <div className="relative flex min-h-[190px] w-full max-w-2xl flex-col items-center justify-start text-center sm:min-h-[210px]">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <Line key="l1">{copy.entrance.lines[0]}</Line>
          )}
          {stage === 2 && (
            <Line key="l2">{copy.entrance.lines[1]}</Line>
          )}
          {stage >= 3 && (
            <motion.div
              key="welcome"
              className="flex flex-col items-center gap-9"
              initial={{ opacity: 0, y: 22, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: EASE.silk }}
            >
              <motion.h1
                className="t-display t-md text-paper"
                initial={{ letterSpacing: '0.08em' }}
                animate={{ letterSpacing: '-0.02em' }}
                transition={{ duration: 2.2, delay: 0.3, ease: EASE.silk }}
              >
                {splitGlyphs(copy.entrance.welcome)}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: entering ? 0 : 1, y: 0 }}
                transition={{ duration: 1, delay: entering ? 0 : (express ? 0.3 : 0.9), ease: EASE.silk }}
              >
                <PremiumButton size="lg" onClick={handleEnter}>
                  {copy.entrance.cta}
                </PremiumButton>
              </motion.div>

              <motion.p
                className="font-sans text-[9px] uppercase tracking-[0.34em] text-paper-dim/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: entering ? 0 : 1 }}
                transition={{ duration: 1, delay: express ? 0.7 : 1.8 }}
              >
                {copy.entrance.hint}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Iris flash at the moment of entry */}
      <AnimatePresence>
        {entering && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(243,211,218,0.85), transparent 58%)' }}
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: [0, 0.5, 0], scale: 3.5 }}
            transition={{ duration: 1.8, ease: EASE.bloom }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Line({ children }) {
  return (
    <motion.p
      className="t-display text-[clamp(1.35rem,4.6vw,2.35rem)] italic leading-snug text-paper-dim"
      initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: EASE.silk }}
    >
      {children}
    </motion.p>
  );
}
