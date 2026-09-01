import { Suspense, lazy, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AudioProvider } from './hooks/useAudio.jsx';
import { useAudio } from './hooks/audioContext.js';
import { Atmosphere } from './components/layout/Atmosphere.jsx';
import { CursorLight } from './components/fx/CursorLight.jsx';
import { ChapterRail } from './components/layout/ChapterRail.jsx';
import { Entrance } from './chapters/Entrance.jsx';
import { RoseGarden } from './chapters/RoseGarden.jsx';
import { StarMap } from './chapters/StarMap.jsx';
import { EASE } from './lib/easing.js';
import { audio as audioConfig } from './content/site.config.js';

/* Chapters below the fold are split out of the initial bundle — the
   Entrance and the Garden are all that is needed to start. */
const MemoryFilm = lazy(() => import('./chapters/MemoryFilm.jsx').then((m) => ({ default: m.MemoryFilm })));
const LittleThings = lazy(() => import('./chapters/LittleThings.jsx').then((m) => ({ default: m.LittleThings })));
const SecretLetter = lazy(() => import('./chapters/SecretLetter.jsx').then((m) => ({ default: m.SecretLetter })));
const SongRoom = lazy(() => import('./chapters/SongRoom.jsx').then((m) => ({ default: m.SongRoom })));
const RoseReveal = lazy(() => import('./chapters/RoseReveal.jsx').then((m) => ({ default: m.RoseReveal })));
const FinalMoment = lazy(() => import('./chapters/FinalMoment.jsx').then((m) => ({ default: m.FinalMoment })));

export default function App() {
  return (
    <AudioProvider>
      <Experience />
    </AudioProvider>
  );
}

function Experience() {
  const [entered, setEntered] = useState(false);
  /* Remounts the whole world on replay, so every chapter returns to
     its untouched state rather than showing its spent version. */
  const [runId, setRunId] = useState(0);

  const { play, restart, fadeTo } = useAudio();

  const handleEnter = useCallback(() => {
    setEntered(true);
    /* This call sits inside the click handler's gesture, which is
       exactly what browsers require to allow sound. */
    play();
    fadeTo(audioConfig.defaultVolume, 2400);
    /* Release the scroll lock only once the gate is gone. */
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }, [play, fadeTo]);

  const handleReplay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setEntered(false);
      setRunId((n) => n + 1);
      restart();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 700);
  }, [restart]);

  return (
    <>
      <Atmosphere />
      <CursorLight />

      <AnimatePresence>
        {!entered && (
          <Entrance key={`gate-${runId}`} onEnter={handleEnter} express={runId > 0} />
        )}
      </AnimatePresence>

      {/* The gate owns the screen until it is opened. */}
      {!entered && (
        <style>{'html,body{overflow:hidden!important;height:100%}'}</style>
      )}

      <AnimatePresence>
        {entered && (
          <motion.main
            key={`world-${runId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.3, ease: EASE.silk }}
          >
            <ChapterRail />

            <RoseGarden />
            <StarMap />

            <Suspense fallback={<ChapterFallback />}>
              <MemoryFilm />
              <LittleThings />
              <SecretLetter />
              <SongRoom />
              <RoseReveal />
              <FinalMoment onReplay={handleReplay} />
            </Suspense>

            <Colophon />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}

/* Deliberately near-invisible — a spinner would break the spell. */
function ChapterFallback() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center" aria-hidden="true">
      <motion.span
        className="h-[1px] w-24 bg-champagne/30"
        animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function Colophon() {
  return (
    <footer
      className="relative flex items-center justify-center px-6 pb-14 pt-4"
      style={{ zIndex: 'var(--z-content)' }}
    >
      <p className="font-sans text-[8px] uppercase tracking-[0.42em] text-paper-faint/60">
        A little world, made for one person
      </p>
    </footer>
  );
}
