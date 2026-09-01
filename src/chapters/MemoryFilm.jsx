import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
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

   The reel behaves like a camera rather than a container:

     · the image drifts inside its gate against the strip's travel,
       which is what reads as depth rather than sliding wallpaper
     · a slow push-in settles on whichever frame holds the centre
     · captions rise as they resolve instead of only fading
     · the strip is masked at both edges, so frames enter and leave
       the gate instead of being cut off by the container
     · the closing frame is held a beat longer and lit a little warmer

   Presentation pass — the chapter is now composed as one cinematic
   screen rather than a stack: an editorial panel holds the left third
   and the reel runs through the right two thirds, with the settled
   frame standing centre-right in its own pool of gold light.

   Nothing here changes the reel's mechanics. The measurement, the
   dwell maths, the scroll mapping, the image order, the lazy-loading
   and the transition values are the same as they were; only the
   frames' geometry and dress have changed.
   ══════════════════════════════════════════════════════════════════ */

/* Fraction of each step spent holding still on a frame, per side. */
const DWELL = 0.3;

/* The image is always drawn slightly larger than its gate so it has
   room to drift without ever exposing an edge. BASE must exceed
   DRIFT, or a gap appears at the frame border mid-transition. */
const GATE_BASE_SCALE = 1.04;   // idle zoom — 2% bleed per side
const GATE_PUSH = 0.04;         // extra push-in on the settled frame
const DRIFT = 1.8;              // max horizontal drift, in %

/* The gate crop. Portrait, close to the 310×550 of a print in a
   gallery — every photograph is composed to `focus`, so nothing
   important is lost to it. */
const GATE_RATIO = '3/5';

/* A frame-by-frame scroll has to opt out of `scroll-behavior: smooth`,
   which html carries globally — an unqualified scrollTo would inherit
   it and fight the animation. `behavior: 'instant'` is the opt-out;
   browsers that predate it throw on the unknown enum, so the plain
   two-argument form is kept as the fallback. */
function scrollToInstant(top) {
  try {
    window.scrollTo({ top, behavior: 'instant' });
  } catch {
    window.scrollTo(0, top);
  }
}

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
  const rafRef = useRef(0);
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

  /* ── Driving the reel from the page, never from its state ──────
     The frame index and the play control move the window, and the
     reel reads the window exactly as it does when a finger does the
     scrolling. Neither touches the transform or the active frame. */

  const span = useCallback(() => {
    const el = ref.current;
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return { top, length: Math.max(1, el.offsetHeight - window.innerHeight) };
  }, []);

  /* position(p) is exactly i at p = i / (count - 1) — the dwell curve
     is flat at every whole frame — so a frame's scroll offset needs
     no search. */
  const goToFrame = useCallback((i) => {
    const s = span();
    if (!s) return;
    cancelAnimationFrame(rafRef.current);
    const p = clamp(i / Math.max(1, count - 1), 0, 1);
    window.scrollTo({ top: s.top + p * s.length, behavior: 'smooth' });
  }, [count, span]);

  /* Play — the reel runs itself to the end at reading pace. Any real
     scroll input takes it straight back. */
  const play = useCallback(() => {
    const s = span();
    if (!s) return;
    cancelAnimationFrame(rafRef.current);

    const from = clamp(window.scrollY, s.top, s.top + s.length);
    const to = s.top + s.length;
    const distance = to - from;

    /* Already at the end — rewind and let them scroll it again. */
    if (distance < 12) {
      window.scrollTo({ top: s.top, behavior: 'smooth' });
      return;
    }

    const duration = (distance / s.length) * count * 1400;
    const start = performance.now();

    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      scrollToInstant(from + distance * e);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [count, span]);

  useEffect(() => {
    const stop = () => cancelAnimationFrame(rafRef.current);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return () => {
      stop();
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };
  }, []);

  const settled = Math.round(active);

  return (
    <section
      id="film"
      ref={ref}
      className="relative w-full"
      style={{ height: `${count * 62}vh`, zIndex: 'var(--z-content)' }}
    >
      <div className="film-stage sticky top-0 flex h-[100svh] w-full flex-col overflow-hidden lg:flex-row lg:items-center">
        {/* Projector haze — centred on phones, gathered behind the
            settled frame once the composition splits in two. */}
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(70% 44% at 50% 62%, rgba(61,15,30,0.55), transparent 74%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              'radial-gradient(46% 62% at 66% 50%, rgba(61,15,30,0.62), transparent 72%), radial-gradient(38% 48% at 66% 50%, rgba(140,119,82,0.10), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Film grain overlay for the entire section */}
        <div
          className="pointer-events-none absolute inset-0 film-grain mix-blend-soft-light"
          style={{ opacity: 0.1 }}
          aria-hidden="true"
        />

        {/* ── Editorial panel ────────────────────────────────
            A third of the screen on desktop, the opening beat on a
            phone. It never overlaps the reel — the two are columns
            of one flex row, not layers. */}
        <div className="relative shrink-0 px-6 pt-6 text-center sm:px-10 sm:pt-9 lg:w-[34%] lg:max-w-[560px] lg:pt-0 lg:pl-14 lg:pr-8 lg:text-left xl:pl-20">
          <FilmLabel />

          <SplitText
            as="h2"
            text={copy.film.title}
            delay={0.1}
            className="t-display t-film mt-5 lg:mt-7"
            lineClassName={(i) => (i === 0 ? 'text-paper' : 'text-rose-soft/85')}
          />

          <HeartRule className="mt-5 lg:mx-0 lg:mt-7" />

          <p className="film-lede t-body mx-auto mt-5 lg:mt-7 max-w-[34ch] text-[0.8125rem] leading-[1.9] text-paper-dim/80 sm:text-sm lg:mx-0">
            {copy.film.body}
          </p>

          <div className="mt-6 flex justify-center lg:justify-start lg:mt-8">
            <PlayControl onClick={play} />
          </div>

          {/* Counter + progress — the reel's position, read as an
              editorial footnote rather than a scrollbar. */}
          <div className="mt-9 hidden items-center justify-center gap-4 lg:flex lg:justify-start">
            <span className="t-numeral shrink-0 text-xs tracking-[0.2em] text-paper-faint">
              {String(settled + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <span className="relative h-[1px] w-24 bg-paper/10 sm:w-36">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-rose to-champagne"
                style={{ scaleX: progressScale }}
              />
            </span>
          </div>
        </div>

        {/* ── The reel ───────────────────────────────────────
            `min-w-0` keeps the w-max strip from widening the row; the
            mask wrapper is still the strip's direct parent and still a
            full-width block, so the measurement is untouched. */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col justify-center lg:pl-12 xl:pl-16">
          <FrameIndex count={count} active={settled} onSelect={goToFrame} />

          <SprocketRail className="mb-2" />

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
              className="relative flex w-max items-center py-4 will-change-transform sm:py-6 lg:py-8"
              style={{ x, columnGap: 'var(--film-gap)' }}
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
                    className="relative shrink-0"
                    style={{ width: 'var(--film-card-w)' }}
                    animate={{
                      opacity: 0.32 + focus * 0.68,
                      scale: 0.82 + focus * 0.18,
                      filter: `blur(${((1 - focus) * 3.4).toFixed(2)}px)`,
                    }}
                    transition={{ duration: 0.45, ease: EASE.silk }}
                  >
                    <div className="relative">
                      {/* The gold bloom the settled frame stands in —
                          warmer still on the closing frame. */}
                      <motion.span
                        className="film-frame-glow pointer-events-none absolute -inset-7 rounded-[50%]"
                        animate={{
                          opacity: focus * (isFinale ? 1 : 0.72),
                          scale: 0.92 + focus * 0.08,
                        }}
                        transition={{ duration: isFinale ? 1.2 : 0.6, ease: EASE.silk }}
                        aria-hidden="true"
                      />

                      {/* Film gate matte — cinematic crop */}
                      <div
                        className="film-frame-shadow relative overflow-hidden rounded-[6px]"
                        style={{ height: 'var(--film-card-h)' }}
                      >
                        {/* The camera: a slow push-in on the settled
                            frame, and a drift against the travel. */}
                        <motion.div
                          className="h-full w-full"
                          animate={{
                            scale: GATE_BASE_SCALE + focus * GATE_PUSH,
                            x: `${(-rel * DRIFT).toFixed(2)}%`,
                          }}
                          transition={{ duration: 0.9, ease: EASE.silk }}
                        >
                          <SmartImage
                            image={frame}
                            ratio={GATE_RATIO}
                            priority={i < 2}
                            sizes="(max-width: 640px) 62vw, (max-width: 1024px) 40vw, 26vw"
                            className="h-full w-full rounded-[6px]"
                          />
                        </motion.div>

                        {/* Frames to either side fall back into the
                            dark, so the settled one is the only lit
                            thing on the strip. */}
                        <motion.span
                          className="pointer-events-none absolute inset-0 bg-void"
                          animate={{ opacity: (1 - focus) * 0.5 }}
                          transition={{ duration: 0.45, ease: EASE.silk }}
                          aria-hidden="true"
                        />

                        {/* Burnt frame edges */}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-[6px] frame-edge"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Frame border — a hairline of gold, drawn on
                          the settled frame only. */}
                      <motion.span
                        className="pointer-events-none absolute inset-0 rounded-[6px] border"
                        animate={{
                          borderColor: isFinale
                            ? `rgba(232,160,176,${(0.06 + focus * 0.54).toFixed(3)})`
                            : `rgba(217,190,142,${(0.06 + focus * 0.46).toFixed(3)})`,
                        }}
                        transition={{ duration: isFinale ? 1.1 : 0.35, ease: EASE.silk }}
                        aria-hidden="true"
                      />

                      {/* Reflection — a pool of light, not a mirror. */}
                      <motion.span
                        className="film-reflection pointer-events-none absolute inset-x-2 top-full h-14"
                        animate={{ opacity: focus * 0.55 }}
                        transition={{ duration: 0.6, ease: EASE.silk }}
                        aria-hidden="true"
                      />

                      {/* Frame number, on the frame's lower edge. */}
                      <motion.span
                        className="pointer-events-none absolute -bottom-[18px] left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border bg-void/85 backdrop-blur-[2px]"
                        animate={{
                          borderColor: `rgba(217,190,142,${(0.14 + focus * 0.42).toFixed(3)})`,
                          opacity: 0.5 + focus * 0.5,
                        }}
                        transition={{ duration: 0.45, ease: EASE.silk }}
                      >
                        <span className="t-numeral text-[0.7rem] leading-none text-champagne/90">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </motion.span>
                    </div>

                    {/* Caption — editorial serif italic, centred under
                        the frame. It rises as it resolves; the last one
                        is held a beat longer. */}
                    <motion.figcaption
                      className="mx-auto mt-8 max-w-[24ch] text-center lg:mt-11"
                      animate={{
                        opacity: 0.3 + focus * 0.7,
                        y: (1 - focus) * (isFinale ? 16 : 9),
                      }}
                      transition={{ duration: isFinale ? 1.25 : 0.42, ease: EASE.silk }}
                    >
                      <span
                        className={
                          isFinale
                            ? 't-display block italic leading-snug text-[clamp(0.95rem,2.4vw,1.3rem)] text-rose-mist'
                            : 't-display block italic leading-snug text-[clamp(0.9rem,2.2vw,1.2rem)] text-paper-dim'
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

          <SprocketRail className="mt-2" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Editorial furniture
   ───────────────────────────────────────────────────────────────── */

/* Chapter number over its title, a hairline, and one small light at
   the end of it. */
function FilmLabel() {
  return (
    <div className="flex flex-col items-center gap-2 lg:items-start">
      <motion.span
        className="font-sans text-[0.5rem] uppercase tracking-[0.5em] text-champagne-dim sm:text-[0.5625rem]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, ease: EASE.silk }}
      >
        {copy.film.chapter}
      </motion.span>

      <motion.span
        className="t-eyebrow"
        initial={{ opacity: 0, letterSpacing: '0.8em' }}
        whileInView={{ opacity: 1, letterSpacing: '0.42em' }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: EASE.silk }}
      >
        {copy.film.label}
      </motion.span>

      <motion.span
        className="mt-1 flex items-center gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, delay: 0.2, ease: EASE.silk }}
        aria-hidden="true"
      >
        <span className="hairline block w-20 sm:w-24" />
        <span className="film-spark h-[3px] w-[3px] rounded-full bg-champagne shadow-[0_0_8px_2px_rgba(217,190,142,0.55)]" />
      </motion.span>
    </div>
  );
}

/* A hairline with a small open heart resting in it. */
function HeartRule({ className = '' }) {
  return (
    <div
      className={`mx-auto flex w-full max-w-[19rem] items-center gap-3 lg:max-w-[15rem] ${className}`}
      aria-hidden="true"
    >
      <span className="hairline block flex-1" />
      <svg
        viewBox="0 0 24 22"
        className="h-[13px] w-[13px] shrink-0 text-champagne/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5C12 20.5 1.8 14.4 1.8 7.7A5.2 5.2 0 0 1 12 5.4a5.2 5.2 0 0 1 10.2 2.3c0 6.7-10.2 12.8-10.2 12.8Z" />
      </svg>
      <span className="hairline block flex-1" />
    </div>
  );
}

/* The play control — a pill of thin gold with a circled play mark,
   and four small lights that never sit still. */
function PlayControl({ onClick }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute -left-3 -top-2 h-[3px] w-[3px] rounded-full bg-champagne/80 film-spark" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-4 top-1 h-[2px] w-[2px] rounded-full bg-rose-soft/70 film-spark [animation-delay:1.4s]" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-2 left-6 h-[2px] w-[2px] rounded-full bg-champagne/60 film-spark [animation-delay:2.6s]" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-2 -bottom-3 h-[3px] w-[3px] rounded-full bg-champagne/50 film-spark [animation-delay:3.4s]" aria-hidden="true" />

      <PremiumButton onClick={onClick} className="!pl-5 !pr-7">
        <span className="flex items-center gap-3">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-current">
            <svg viewBox="0 0 10 12" className="h-[9px] w-[9px] translate-x-[1px]" fill="currentColor" aria-hidden="true">
              <path d="M0 0.6v10.8L10 6z" />
            </svg>
          </span>
          {copy.film.cta}
        </span>
      </PremiumButton>
    </div>
  );
}

/* The reel's index, standing at the near edge of the strip. Selecting
   a frame moves the page to that frame's scroll offset — the reel
   itself still reads only the window. */
function FrameIndex({ count, active, onSelect }) {
  return (
    <div
      className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-[10px] lg:flex xl:left-3"
    >
      <span className="t-numeral text-[0.7rem] text-champagne/60">04</span>
      <span className="h-5 w-px bg-champagne/20" aria-hidden="true" />
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className="group flex h-[14px] w-[14px] items-center justify-center"
            aria-label={`Frame ${String(i + 1).padStart(2, '0')}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <motion.span
              className="block rounded-full border border-champagne/35 group-hover:border-champagne/70"
              animate={{
                width: isActive ? 7 : 4,
                height: isActive ? 7 : 4,
                backgroundColor: isActive ? '#d9be8e' : 'rgba(217,190,142,0)',
                opacity: isActive ? 1 : 0.55,
              }}
              transition={{ duration: 0.4, ease: EASE.silk }}
            />
          </button>
        );
      })}
      <span className="h-5 w-px bg-champagne/20" aria-hidden="true" />
    </div>
  );
}

/* Perforated rail — the detail that makes it read as film. */
function SprocketRail({ className = '' }) {
  return (
    <div
      className={`pointer-events-none relative flex h-2 w-full items-center gap-6 overflow-hidden opacity-[0.14] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="h-[6px] w-4 shrink-0 rounded-[1px] bg-champagne/25"
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
          className="t-display t-md mt-6"
          lineClassName={(i) => (i === 0 ? 'text-paper' : 'text-rose-soft/85')}
        />
        <HeartRule className="mt-8 !mx-0" />
        <p className="t-body mt-7 max-w-[42ch] text-sm text-paper-dim/80">
          {copy.film.body}
        </p>

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
                <div className="relative overflow-hidden rounded-[6px]">
                  <SmartImage
                    image={frame}
                    priority={i < 2}
                    sizes={isFinale ? '(max-width: 640px) 88vw, 76vw' : '(max-width: 640px) 88vw, 40vw'}
                    className={
                      isFinale
                        ? 'rounded-[6px] border border-rose-soft/25'
                        : 'rounded-[6px] border border-champagne/15'
                    }
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[6px] frame-edge"
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
