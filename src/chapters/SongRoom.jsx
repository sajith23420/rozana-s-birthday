import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Chapter } from '../components/layout/Chapter.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { useAudio } from '../hooks/audioContext.js';
import { audio as audioConfig } from '../content/site.config.js';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { formatTime, clamp } from '../lib/utils.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

/* ══════════════════════════════════════════════════════════════════
   07 — THE SONG ROOM

   Phase 2: Deeper void with soft circular spotlight, more realistic
   vinyl texture, ambient particles that react to playback, subtle
   waveform visualization, more dramatic room light breathing.
   ══════════════════════════════════════════════════════════════════ */

const RING = 148;
const CIRC = 2 * Math.PI * RING;

/* Simple sine waveform bars — subtle, not a full visualiser. */
function Waveform({ active, reduced }) {
  if (reduced) return null;

  return (
    <div className="flex items-end justify-center gap-[3px] h-6" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-champagne/40"
          style={{ originY: 1 }}
          animate={{
            scaleY: active
              ? [0.25, 0.6 + Math.sin(i * 0.7) * 0.4, 0.25]
              : 0.15,
            opacity: active ? 0.6 : 0.2,
          }}
          transition={active
            ? {
                duration: 1.2 + (i % 5) * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.05,
              }
            : { duration: 0.5 }}
        />
      ))}
    </div>
  );
}

export function SongRoom() {
  const { isPlaying, isMuted, volume, progress, duration, current, toggle, toggleMute, setVolume, seek } = useAudio();
  const reduced = useReducedMotion();
  const ringRef = useRef(null);

  const scrub = useCallback((e) => {
    const el = ringRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) + Math.PI / 2;
    const ratio = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
    seek(ratio);
  }, [seek]);

  return (
    <Chapter
      id="song"
      className="overflow-hidden"
      backdrop={
        <>
          {/* Circular spotlight */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(42% 38% at 50% 48%, rgba(168,66,90,0.35), transparent 68%),' +
                'radial-gradient(80% 60% at 50% 100%, rgba(26,7,16,0.95), transparent 65%)',
            }}
            animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.35 }}
            transition={isPlaying && !reduced
              ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 1.2 }}
          />
          {/* Ambient particles — react to playback */}
          <ParticleField
            count={isPlaying ? 50 : 20}
            intensity={isPlaying ? 1.2 : 0.4}
            speed={isPlaying ? 1 : 0.4}
            color="240, 223, 192"
            seed={83}
          />
        </>
      }
    >
      <header className="relative flex flex-col items-center text-center">
        <Eyebrow align="center">{copy.song.eyebrow}</Eyebrow>
        <SplitText
          as="h2"
          text={copy.song.title}
          className="t-display t-md mt-7 text-paper"
        />
      </header>

      {/* ── The record ───────────────────────────────────── */}
      <div className="relative mt-14 flex flex-col items-center">
        <div className="relative aspect-square w-[min(78vw,340px)]">
          {/* Halo cast onto the floor */}
          <motion.div
            className="pointer-events-none absolute inset-[-18%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,85,110,0.3), transparent 65%)',
            }}
            animate={{ opacity: isPlaying ? [0.4, 1, 0.4] : 0.2, scale: isPlaying ? [1, 1.08, 1] : 1 }}
            transition={isPlaying && !reduced
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 1 }}
            aria-hidden="true"
          />

          {/* Progress ring + scrub surface */}
          <svg
            ref={ringRef}
            viewBox="0 0 320 320"
            className="absolute inset-0 h-full w-full -rotate-90 cursor-pointer"
            onClick={scrub}
            role="slider"
            aria-label="Track position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') seek(clamp(progress + 0.05, 0, 1));
              if (e.key === 'ArrowLeft') seek(clamp(progress - 0.05, 0, 1));
            }}
          >
            <circle
              cx="160" cy="160" r={RING}
              fill="none"
              stroke="rgba(245,239,233,0.07)"
              strokeWidth="1.5"
            />
            <circle
              cx="160" cy="160" r={RING}
              fill="none"
              stroke="#d9be8e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.25s linear' }}
            />
          </svg>

          {/* The disc — more realistic grooves */}
          <motion.button
            onClick={toggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="absolute inset-[9%] rounded-full"
            style={{
              background:
                'repeating-radial-gradient(circle at 50% 50%, #0c0710 0px, #0c0710 2px, #150c14 3px, #0c0710 4px),' +
                'radial-gradient(circle at 34% 28%, #241722, #07050d 70%)',
              boxShadow:
                'inset 0 0 60px rgba(0,0,0,0.9), 0 30px 70px -25px rgba(0,0,0,0.95), inset 0 1px 0 rgba(245,239,233,0.06)',
            }}
            animate={reduced ? {} : { rotate: isPlaying ? 360 : 0 }}
            transition={isPlaying
              ? { duration: 9, repeat: Infinity, ease: 'linear' }
              : { duration: 1.4, ease: EASE.silk }}
            whileTap={{ scale: 0.985 }}
          >
            {/* Light raking across the grooves */}
            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-45"
              style={{
                background:
                  'conic-gradient(from 210deg, transparent 0deg, rgba(240,223,192,0.16) 28deg, transparent 76deg, transparent 200deg, rgba(232,160,176,0.12) 232deg, transparent 288deg)',
              }}
              aria-hidden="true"
            />
            {/* Centre label — counter-rotated */}
            <motion.span
              className="absolute inset-[33%] flex flex-col items-center justify-center rounded-full text-center"
              style={{ background: 'radial-gradient(circle at 40% 32%, #a8425a, #58152a 72%)' }}
              animate={reduced ? {} : { rotate: isPlaying ? -360 : 0 }}
              transition={isPlaying
                ? { duration: 9, repeat: Infinity, ease: 'linear' }
                : { duration: 1.4, ease: EASE.silk }}
            >
              <span className="t-display text-[clamp(0.8rem,3vw,1.05rem)] italic leading-tight text-rose-mist">
                {audioConfig.title}
              </span>
              {/* Artist takes the second line once it is set in the config;
                  until then the label carries the dedication instead. */}
              <span className="mt-1 font-sans text-[7px] uppercase tracking-[0.3em] text-rose-mist/60">
                {audioConfig.artist || audioConfig.subtitle}
              </span>
            </motion.span>
            {/* Spindle */}
            <span
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-void"
              style={{ boxShadow: 'inset 0 0 4px rgba(0,0,0,0.9)' }}
              aria-hidden="true"
            />
          </motion.button>

          {/* Tonearm */}
          <motion.div
            className="pointer-events-none absolute right-[2%] top-[6%] hidden h-[46%] w-[3px] origin-top rounded-full sm:block"
            style={{ background: 'linear-gradient(#d9be8e, #8c7752)' }}
            animate={{ rotate: isPlaying ? 28 : 6 }}
            transition={{ duration: 1.4, ease: EASE.silk }}
            aria-hidden="true"
          >
            <span className="absolute -left-[3px] -top-[5px] h-3 w-3 rounded-full bg-champagne-dim" />
            <span className="absolute -left-[2px] bottom-0 h-2.5 w-[7px] rounded-[1px] bg-champagne" />
          </motion.div>

          {/* Realistic disc shadow */}
          <div
            className="pointer-events-none absolute inset-[9%] -bottom-4 rounded-full"
            style={{
              background: 'transparent',
              boxShadow: '0 20px 50px -15px rgba(0,0,0,0.8)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* ── Waveform visualisation ─────────────────────── */}
        <Reveal delay={0.2} className="mt-8">
          <Waveform active={isPlaying} reduced={reduced} />
        </Reveal>

        {/* ── Transport ────────────────────────────────────── */}
        <Reveal delay={0.3} className="mt-8 w-full max-w-[340px]">
          <div className="flex items-center justify-between font-sans text-[10px] tracking-[0.22em] text-paper-faint">
            <span>{formatTime(current)}</span>
            <motion.span
              animate={{ opacity: isPlaying ? [0.4, 1, 0.4] : 0.4 }}
              transition={isPlaying && !reduced
                ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.4 }}
              className="uppercase text-champagne/70"
            >
              {isPlaying ? 'Now playing' : 'Paused'}
            </motion.span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="mt-7 flex items-center justify-center gap-8">
            <IconMark onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </IconMark>

            <motion.button
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne/35 text-champagne transition-colors duration-500 hover:bg-champagne hover:text-void"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </motion.button>

            {/* Volume as a hairline. The label is 44px tall so the range input
                has a proper touch target; the visible track stays a 1px line,
                vertically centred. The row is already 56px tall because of the
                play button, so nothing shifts. */}
            <label className="group relative flex h-11 w-20 items-center" aria-label="Volume">
              <span className="pointer-events-none absolute inset-x-0 h-[1px] bg-paper/12" />
              <span
                className="pointer-events-none absolute h-[1px] bg-champagne"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <span
                className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 rounded-full bg-champagne transition-transform duration-300 group-hover:scale-125"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        </Reveal>

        <Reveal delay={0.5} className="mt-10">
          <p className="font-sans text-[9px] uppercase tracking-[0.32em] text-paper-faint">
            {copy.song.sub}
          </p>
        </Reveal>
      </div>
    </Chapter>
  );
}

function IconMark({ children, onClick, label }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className="flex h-11 w-11 items-center justify-center rounded-full text-paper-dim transition-colors duration-400 hover:text-champagne"
    >
      {children}
    </motion.button>
  );
}
