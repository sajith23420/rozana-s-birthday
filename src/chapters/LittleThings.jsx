import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { littleThings } from '../content/littleThings.js';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useIsTouch } from '../hooks/useMediaQuery.js';

/* ══════════════════════════════════════════════════════════════════
   05 — LITTLE THINGS

   One cinematic screen, not a document. The supplied artwork is the
   full-bleed ground of the chapter: she stands in the left third of
   the frame, so a layered scrim darkens the right half into the
   negative space the type lives in. Nothing is cropped, nothing is
   repositioned, nothing is animated about the photograph itself.

   The six observations are floating panes in the right column, laid
   out 2 × 3 on a desktop and a single column on a phone. Each pane
   reserves the room its body text will need, so opening a thought
   only fades text in — the grid never reflows and the document
   never grows by a pixel.

   Performance: the whole chapter is CSS transforms and opacity. The
   canvas particle field this chapter used to carry is gone — the
   photograph already brings its own bokeh and petals, and the global
   RosePetals plate in Atmosphere.jsx supplies the drift.
   ══════════════════════════════════════════════════════════════════ */

const GROUND_SRC = '/images/Dreamy Rose Garden Portrait.png';

export function LittleThings() {
  const [open, setOpen] = useState(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  const toggle = (id) => setOpen((cur) => (cur === id ? null : id));

  const scrollToLetter = () =>
    document.getElementById('letter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Chapter
      id="little"
      full
      padY={false}
      className="flex h-[100svh] max-h-[100svh] min-h-[100svh] flex-col overflow-hidden py-[3svh]"
      innerClassName="flex min-h-0 flex-1 flex-col"
      backdrop={
        <>
          {/* ── The ground ────────────────────────────────────
              Full-bleed, never scaled or moved. On a phone the frame
              is far narrower than the artwork, so the focal point is
              pulled to where she stands rather than to the middle of
              a 3:2 plate. */}
          <img
            src={GROUND_SRC}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable="false"
            className="absolute inset-0 h-full w-full select-none object-cover object-[30%_38%] sm:object-[34%_42%] lg:object-center"
          />

          {/* Left-to-right scrim: she keeps her light, the right half
              falls away into readable darkness. */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(to right, rgba(5,3,8,0.10) 0%, rgba(5,3,8,0.20) 22%,' +
                ' rgba(26,7,16,0.62) 40%, rgba(5,3,8,0.88) 56%, rgba(5,3,8,0.94) 100%)',
            }}
          />
          {/* Narrow screens: the type sits over the photograph, so the
              weighting is vertical instead. */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to bottom, rgba(5,3,8,0.92) 0%, rgba(5,3,8,0.86) 11%,' +
                ' rgba(26,7,16,0.52) 18%, rgba(26,7,16,0.36) 25%, rgba(26,7,16,0.54) 34%,' +
                ' rgba(5,3,8,0.84) 45%, rgba(5,3,8,0.93) 62%, rgba(5,3,8,0.96) 100%)',
            }}
          />
          {/* A breath of burgundy so the plate belongs to the palette. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(58% 52% at 24% 42%, rgba(88,21,42,0.24), transparent 72%),' +
                'radial-gradient(60% 55% at 82% 62%, rgba(26,7,16,0.42), transparent 78%)',
            }}
          />
        </>
      }
    >
      {/* ── Content column — the right/centre negative space ───── */}
      <div className="flex min-h-0 flex-1 flex-col lg:justify-center lg:pl-[36%] lg:pr-[130px] xl:pl-[40%] xl:pr-[200px]">
        <header className="relative flex shrink-0 flex-col items-center text-center">
          <Eyebrow align="center">{copy.little.eyebrow}</Eyebrow>
          <SplitText
            as="h2"
            text={copy.little.title}
            className="t-display t-thought mt-3 text-paper sm:mt-4"
          />
          <Reveal delay={0.4} className="mt-2 sm:mt-3">
            <p
              className="font-sans text-[9px] uppercase tracking-[0.3em] text-paper-dim/70 sm:text-[10px] lg:text-paper-faint"
              style={{ textShadow: '0 1px 6px rgba(5,3,8,0.95)' }}
            >
              {copy.little.sub}
            </p>
          </Reveal>
        </header>

        {/* ── The six thoughts ─────────────────────────────────
            A fixed grid: the rows share whatever height is left, so
            a thought opening inside a pane cannot move anything. */}
        <ul className="relative mt-auto grid h-[68svh] shrink-0 grid-cols-1 grid-rows-6 gap-1 sm:h-auto sm:min-h-0 sm:max-h-[440px] sm:flex-1 sm:shrink sm:grid-cols-2 sm:grid-rows-3 sm:gap-2.5 lg:mt-6 lg:max-h-[548px] lg:gap-3">
          {littleThings.map((item, i) => (
            <motion.li
              key={item.id}
              className="min-h-0"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: EASE.bloom }}
            >
              <Thought
                item={item}
                index={i + 1}
                isOpen={open === item.id}
                dimmed={open !== null && open !== item.id}
                onToggle={() => toggle(item.id)}
                reduced={reduced}
                isTouch={isTouch}
              />
            </motion.li>
          ))}
        </ul>
      </div>

      {/* ── Bottom navigation ──────────────────────────────────── */}
      <Reveal delay={0.9} className="flex h-[clamp(44px,8svh,76px)] shrink-0 items-center justify-center lg:justify-end lg:pr-[130px] xl:pr-[200px]">
        <button
          onClick={scrollToLetter}
          className="group -my-3 inline-flex items-center gap-3 py-3 text-champagne"
          style={{ filter: 'drop-shadow(0 1px 5px rgba(5,3,8,0.95))' }}
        >
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] sm:text-[0.6rem] sm:tracking-[0.32em]">
            Wander a little
          </span>
          <span className="relative block h-[1px] w-10 overflow-hidden bg-champagne/30 sm:w-12">
            <motion.span
              className="absolute inset-0 origin-left bg-champagne"
              initial={{ scaleX: 0 }}
              animate={reduced ? { scaleX: 0.4 } : { scaleX: [0, 1, 0] }}
              transition={reduced ? { duration: 0.4 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          <motion.span
            className="text-xs"
            aria-hidden="true"
            animate={reduced ? {} : { x: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </button>
      </Reveal>
    </Chapter>
  );
}

/* ─────────────────────────────────────────────────────────────────
   One floating thought.

   The pane is a flex column of fixed parts — numeral, quote, rule,
   metadata — with one elastic band between the quote and the rule.
   That band is present whether or not the thought is open, so the
   body text fades into room that already existed. No layout
   animation, no height animation, no reflow.
   ───────────────────────────────────────────────────────────────── */
function Thought({ item, index, isOpen, dimmed, onToggle, reduced, isTouch }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="thought-pane group relative flex h-full w-full flex-col overflow-hidden rounded-[3px] px-3 py-1.5 text-left sm:px-4 sm:py-3 lg:px-4 lg:py-3 xl:px-5"
      data-open={isOpen ? 'true' : undefined}
      animate={{ opacity: dimmed ? 0.42 : 1 }}
      transition={{ duration: 0.5, ease: EASE.silk }}
      whileHover={isTouch || reduced ? undefined : { scale: 1.015 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
    >
      {/* Hover / open glow — opacity only. */}
      <span className="thought-glow" aria-hidden="true" />

      <span className="relative flex shrink-0 items-center justify-between gap-2">
        <span className="t-numeral text-[0.58rem] leading-none text-champagne/55 sm:text-[0.66rem]">
          {String(index).padStart(2, '0')}
        </span>
        {/* Phone screens fold the affordance up here — see below. */}
        <motion.span
          className="text-[0.65rem] leading-none text-champagne/60 sm:hidden"
          aria-hidden="true"
          animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 1 : 0.55 }}
          transition={{ duration: 0.45, ease: EASE.silk }}
        >
          →
        </motion.span>
      </span>

      <span className="t-display relative mt-1 block shrink-0 text-[clamp(0.72rem,1.35vw,1rem)] italic leading-[1.32] text-paper/92">
        {`“${item.label}”`}
      </span>

      {/* The elastic band — reserved room for the body text. */}
      <span className="relative mt-1 block min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.span
              key="body"
              className="t-body block text-[clamp(0.6rem,1.02vw,0.76rem)] leading-[1.42]"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: EASE.silk }}
            >
              {item.body}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="relative mt-1.5 hidden h-px w-9 shrink-0 bg-gradient-to-r from-champagne/45 to-transparent sm:block" />

      <span className="relative mt-1.5 hidden shrink-0 items-center justify-between sm:flex">
        <span className="font-sans text-[0.5rem] uppercase tracking-[0.26em] text-paper-faint sm:text-[0.55rem]">
          {isOpen ? 'Close' : 'Read'}
        </span>
        <motion.span
          className="text-[0.7rem] text-champagne/60"
          aria-hidden="true"
          animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 1 : 0.55 }}
          transition={{ duration: 0.45, ease: EASE.silk }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
}
