import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { SmartImage } from '../components/media/SmartImage.jsx';
import { filmReel } from '../content/images.js';
import { copy } from '../content/copy.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { clamp } from '../lib/utils.js';
import { EASE } from '../lib/easing.js';
import { splitGlyphs } from '../lib/glyphs.jsx';

/* ══════════════════════════════════════════════════════════════════
   04 — MEMORY FILM

   Film grain, burnt frame edges, a cinematic crop inside a film-gate
   matte, measured transitions with a dwell on each frame.

   Personalisation pass — the photographs are real, so the frame now
   behaves like a camera rather than a container:

     · the image drifts inside its gate against the strip's travel,
       which is what reads as depth rather than sliding wallpaper
     · a slow push-in settles on whichever frame holds the centre
     · captions rise as they resolve instead of only fading
     · the strip is masked at both edges, so frames enter and leave
       the gate instead of being cut off by the container
     · the closing frame is held a beat longer and lit a little warmer

   Nothing here changes the reel's geometry, order, ratios or focus
   values — the measurement and dwell maths are untouched.
   ══════════════════════════════════════════════════════════════════ */

/* Fraction of each step spent holding still on a frame, per side. */
const DWELL = 0.3;

/* The image is always drawn slightly larger than its gate so it has
   room to drift without ever exposing an edge. BASE must exceed
   DRIFT, or a gap appears at the frame border mid-transition. */
const GATE_BASE_SCALE = 1.04;   // idle zoom — 2% bleed per side
const GATE_PUSH = 0.04;         // extra push-in on the settled frame
const DRIFT = 1.8;              // max horizontal drift, in %

export function MemoryFilm() {
  const reduced = useReducedMotion();
  return reduced ? <StackedReel /> : <ScrollingReel />;
}

/* ─────────────────────────────────────────────────────────────────
   The pinned, scroll-driven reel
   ───────────────────────────────────────────────────────────────── */
function ScrollingReel() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [travel, setTravel] = useState({ from: 0, pitch: 1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const count = filmReel.length;

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const frame = track.firstElementChild;
      if (!frame) return;
      const frameW = frame.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const viewport = track.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      const centre = viewport / 2;
      const pitch = frameW + gap;
      setTravel({ from: centre - frameW / 2, pitch });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    if (track.parentElement) ro.observe(track.parentElement);
    return () => ro.disconnect();
  }, [count]);

  const position = (v) => {
    const t = clamp(v, 0, 1) * (count - 1);
    const i = Math.floor(t);
    const f = t - i;
    const g = clamp((f - DWELL) / (1 - 2 * DWELL), 0, 1);
    return Math.min(count - 1, i + g * g * (3 - 2 * g));
  };

  const x = useTransform(scrollYProgress, (v) => travel.from - position(v) * travel.pitch);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = Math.round(position(v) * 100) / 100;
    setActive((prev) => (prev === p ? prev : p));
  });

  const progressScale = useTransform(
    scrollYProgress,
    (v) => 0.02 + (position(v) / Math.max(1, count - 1)) * 0.98
  );

  return (
    <section
      id="film"
      ref={ref}
      className="relative w-full"
      style={{ height: `${count * 62}vh`, zIndex: 'var(--z-content)' }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-2 overflow-hidden py-14 sm:py-16">
        {/* Projector haze */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(65% 50% at 50% 45%, rgba(61,15,30,0.55), transparent 72%)',
          }}
          aria-hidden="true"
        />

        {/* Film grain overlay for the entire section */}
        <div
          className="pointer-events-none absolute inset-0 film-grain mix-blend-soft-light"
          style={{ opacity: 0.1 }}
          aria-hidden="true"
        />

        {/* ── Header ─────────────────────────────────────── */}
        <header className="relative px-6 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1240px]">
            <Eyebrow>{copy.film.eyebrow}</Eyebrow>
            <SplitText
              as="h2"
              text={copy.film.title}
              className="t-display t-md mt-6 text-paper"
            />
          </div>
        </header>

        {/* ── Sprocket rail ──────────────────────────────── */}
        <SprocketRail className="mt-8" />

        {/* ── The strip ──────────────────────────────────────
            The mask lets frames dissolve in and out at the edges of the
            gate rather than meeting a hard container cut. The ul keeps
            its own ref and this wrapper is still a full-width block, so
            the measurement in useLayoutEffect is unchanged. */}
        <div
          className="relative w-full"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
          }}
        >
          <motion.ul
            ref={trackRef}
            className="relative flex w-max items-center gap-[6vw] py-6 will-change-transform"
            style={{ x }}
          >
            {filmReel.map((frame, i) => {
              /* Signed distance from the gate: negative to the left,
                 positive to the right. `focus` is the unsigned form. */
              const rel = clamp(i - active, -1, 1);
              const focus = 1 - Math.min(1, Math.abs(i - active));
              const isFinale = i === count - 1;

              return (
                <motion.li
                  key={frame.key}
                  className="relative w-[min(62vw,34svh)] shrink-0 sm:w-[min(38vw,32svh)] lg:w-[min(30vw,30svh)]"
                  animate={{
                    opacity: 0.22 + focus * 0.78,
                    scale: 0.85 + focus * 0.15,
                    filter: `blur(${((1 - focus) * 4).toFixed(2)}px)`,
                  }}
                  transition={{ duration: 0.45, ease: EASE.silk }}
                >
                  <div className="relative">
                    {/* A warmer light gathers behind the closing frame. */}
                    {isFinale && (
                      <motion.span
                        className="pointer-events-none absolute -inset-8 rounded-[50%]"
                        style={{
                          background:
                            'radial-gradient(closest-side, rgba(217,190,142,0.20), rgba(200,85,110,0.10) 55%, transparent 78%)',
                          filter: 'blur(18px)',
                        }}
                        animate={{ opacity: focus, scale: 0.9 + focus * 0.2 }}
                        transition={{ duration: 1.2, ease: EASE.silk }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Film gate matte — cinematic crop */}
                    <div className="relative overflow-hidden rounded-[2px]">
                      {/* The camera: a slow push-in on the settled frame,
                          and a drift against the strip travel. */}
                      <motion.div
                        animate={{
                          scale: GATE_BASE_SCALE + focus * GATE_PUSH,
                          x: `${(-rel * DRIFT).toFixed(2)}%`,
                        }}
                        transition={{ duration: 0.9, ease: EASE.silk }}
                      >
                        <SmartImage
                          image={frame}
                          priority={i < 2}
                          sizes="(max-width: 640px) 62vw, (max-width: 1024px) 38vw, 30vw"
                          className="rounded-[2px]"
                        />
                      </motion.div>
                      {/* Burnt frame edges */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[2px] frame-edge"
                        aria-hidden="true"
                      />
                    </div>
                    {/* Frame border, drawn only on the active frame */}
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-[2px] border"
                      animate={{
                        borderColor: isFinale
                          ? `rgba(232,160,176,${(0.05 + focus * 0.5).toFixed(3)})`
                          : `rgba(217,190,142,${(0.04 + focus * 0.38).toFixed(3)})`,
                      }}
                      transition={{ duration: isFinale ? 1.1 : 0.35, ease: EASE.silk }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Caption — editorial serif italic. It rises as it
                      resolves; the last one is held a beat longer. */}
                  <motion.figcaption
                    className="mt-5 flex items-baseline gap-4"
                    animate={{
                      opacity: Math.max(0, focus * 1.6 - 0.6),
                      y: (1 - focus) * (isFinale ? 18 : 10),
                    }}
                    transition={{ duration: isFinale ? 1.25 : 0.42, ease: EASE.silk }}
                  >
                    <span className="t-numeral text-champagne/60 text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={
                        isFinale
                          ? 't-display italic leading-snug text-[clamp(1rem,2.6vw,1.35rem)] text-rose-mist'
                          : 't-display italic leading-snug text-[clamp(0.95rem,2.4vw,1.25rem)] text-paper-dim'
                      }
                    >
                      {splitGlyphs(frame.caption)}
                    </span>
                  </motion.figcaption>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <SprocketRail className="mb-6" />

        {/* ── Counter + progress ─────────────────────────── */}
        <footer className="relative px-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-[1240px] items-center gap-5">
            <span className="t-numeral shrink-0 text-xs tracking-[0.2em] text-paper-faint">
              {String(Math.round(active) + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <span className="relative h-[1px] flex-1 bg-paper/10">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-rose to-champagne"
                style={{ scaleX: progressScale }}
              />
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}

/* Perforated rail — the detail that makes it read as film. */
function SprocketRail({ className = '' }) {
  return (
    <div
      className={`pointer-events-none relative flex h-3 w-full items-center gap-6 overflow-hidden opacity-25 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-4 shrink-0 rounded-[1px] bg-paper/20"
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Reduced-motion equivalent: a quiet vertical archive
   ───────────────────────────────────────────────────────────────── */
function StackedReel() {
  return (
    <section
      id="film"
      className="relative w-full px-6 py-24 sm:px-10 lg:px-16"
      style={{ zIndex: 'var(--z-content)' }}
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <Eyebrow>{copy.film.eyebrow}</Eyebrow>
        <SplitText
          as="h2"
          text={copy.film.title}
          className="t-display t-md mt-6 text-paper"
        />

        <ul className="mt-14 grid gap-14 sm:grid-cols-2">
          {filmReel.map((frame, i) => {
            const isFinale = i === filmReel.length - 1;
            return (
              /* The closing frame spans the full width and reveals a
                 little slower, so the archive lands on the same beat
                 the scrolling reel does. */
              <Reveal
                as="li"
                key={frame.key}
                delay={i * 0.05}
                duration={isFinale ? 1.5 : 1.05}
                className={isFinale ? 'block sm:col-span-2' : 'block'}
              >
                <div className="relative overflow-hidden rounded-[2px]">
                  <SmartImage
                    image={frame}
                    priority={i < 2}
                    sizes={isFinale ? '(max-width: 640px) 88vw, 76vw' : '(max-width: 640px) 88vw, 40vw'}
                    className={
                      isFinale
                        ? 'rounded-[2px] border border-rose-soft/25'
                        : 'rounded-[2px] border border-champagne/15'
                    }
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[2px] frame-edge"
                    aria-hidden="true"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline gap-3">
                  <span className="t-numeral text-xs text-champagne/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={
                      isFinale
                        ? 't-display text-xl italic text-rose-mist'
                        : 't-display text-lg italic text-paper-dim'
                    }
                  >
                    {splitGlyphs(frame.caption)}
                  </span>
                </figcaption>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
