import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { stars, constellation } from '../content/stars.js';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   03 — STAR MAP

   Composition: a small atmospheric portrait dissolving into the dark
   on the left, with the heading and a large constellation set into
   the right portion. The heading is centered relative to the star map
   region, NOT the viewport.

   Every star label (number + title + note excerpt) is always visible,
   positioned just below its star. Clicking a star discovers it,
   lighting the constellation segment, and the bottom panel shows
   the full note.

   Below `lg` the sky has the whole screen rather than the right two
   thirds of one, and the desktop scatter puts those labels on top of
   each other — so narrow screens read the same nine stars from
   `star.m`: the chain walks down the frame, each label hangs off the
   side its star leans away from, and the note excerpt is dropped
   because the panel underneath is already carrying it in full. The
   concept, the interaction and the constellation order are the same;
   only the coordinates are read differently.

   Performance: To preserve frame rate and avoid heavy global
   repaints, the background atmosphere is lightweight. Most distant
   stars are static SVG circles; only a small fraction use motion.
   Heavy filters and blurs are minimized.
   ══════════════════════════════════════════════════════════════════ */

const PORTRAIT_SRC = '/images/rose.jpeg';

/* ── Per-star label offsets, `lg` and above ────────────────────── */
const LABEL_META = [
  /* s1  x:14 y:26 */ { dx: 0, dy: 3, align: 'left' },
  /* s2  x:29 y:14 */ { dx: 0, dy: 3, align: 'left' },
  /* s3  x:44 y:30 */ { dx: -5, dy: 3, align: 'left' },
  /* s4  x:61 y:18 */ { dx: -5, dy: 3, align: 'left' },
  /* s5  x:74 y:34 */ { dx: -5, dy: 3, align: 'left' },
  /* s6  x:86 y:22 */ { dx: -5, dy: 3, align: 'left' },
  /* s7  x:55 y:52 */ { dx: -5, dy: 3, align: 'left' },
  /* s8  x:33 y:60 */ { dx: -5, dy: 3, align: 'left' },
  /* s9  x:70 y:66 */ { dx: -5, dy: 3, align: 'left' },
];

export function StarMap() {
  const [found, setFound] = useState(() => new Set());
  const [open, setOpen] = useState(null);
  const reduced = useReducedMotion();
  /* The desktop constellation owns everything from `lg`; below it the
     map is read from `star.m`. */
  const compact = !useMediaQuery('(min-width: 1024px)');
  const at = (star) => (compact ? star.m : star);

  /* Only generate ~80 background stars, and only animate 15 of them.
     This massively reduces React/Framer motion overhead. */
  const farStars = useMemo(() => {
    const rand = seeded(97);
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      r: 0.06 + rand() * 0.3,
      o: 0.1 + rand() * 0.45,
      d: rand() * 6,
      drift: { x: (rand() - 0.5) * 0.3, y: (rand() - 0.5) * 0.2 },
      animates: i < 15, // Only animate a subset
    }));
  }, []);

  const select = useCallback((star) => {
    setOpen((cur) => (cur?.id === star.id ? null : star));
    setFound((prev) => {
      if (prev.has(star.id)) return prev;
      const next = new Set(prev);
      next.add(star.id);
      return next;
    });
  }, []);

  const segments = useMemo(() => {
    const segs = [];
    for (let i = 0; i < constellation.length - 1; i++) {
      const a = stars[constellation[i]];
      const b = stars[constellation[i + 1]];
      if (!a || !b) continue;
      const pa = compact ? a.m : a;
      const pb = compact ? b.m : b;
      segs.push({
        key: `${a.id}-${b.id}-${i}`,
        a: pa, b: pb,
        lit: found.has(a.id) && found.has(b.id),
      });
    }
    return segs;
  }, [found, compact]);

  const complete = found.size === stars.length;

  const scrollToGarden = () =>
    document.getElementById('garden')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToLittle = () =>
    document.getElementById('little')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Chapter
      id="starmap"
      full
      padY={false}
      className="flex h-[100dvh] max-h-[100dvh] min-h-[100dvh] flex-col overflow-hidden py-[2.5dvh]"
      innerClassName="flex min-h-0 flex-1 flex-col"
      backdrop={
        <>
          {/* Night wash — lightweight gradients, no filters */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(75% 60% at 50% 18%, rgba(26,7,16,0.9), transparent 70%),' +
                'radial-gradient(50% 40% at 20% 70%, rgba(88,21,42,0.15), transparent 60%)',
            }}
          />
          {/* Ambient light shifts subtly when a star is selected */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(40% 35% at 50% 50%, rgba(200,85,110,0.1), transparent 65%)',
            }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE.silk }}
          />

          {/* Reduced particle field to minimize rendering cost */}
          <ParticleField count={15} intensity={0.4} color="245, 239, 233" speed={0.4} seed={61} />

          {/* The portrait. Reduced size to ~26vw, max-width constrained.
              Uses object-contain to avoid stretching. Masking happens
              via .star-portrait in base.css. No expensive blurs. */}
          <div
            className="pointer-events-none absolute left-[-6%] top-[38%] w-[50%] -translate-y-1/2 sm:left-0 sm:top-[46%] sm:w-[34%] lg:left-[5%] lg:top-1/2 lg:w-[28vw] lg:max-w-[440px] xl:left-[6%] xl:w-[30vw] xl:max-w-[460px]"
            aria-hidden="true"
          >
            {/* Subtle glow without large expensive blur */}
            <div
              className="absolute -inset-[10%] rounded-[50%]"
              style={{
                background:
                  'radial-gradient(closest-side at 50% 50%, rgba(168,66,90,0.15), transparent 85%)',
              }}
            />
            <img
              src={PORTRAIT_SRC}
              alt=""
              loading="lazy"
              decoding="async"
              className="star-portrait relative h-auto max-h-[64dvh] w-full object-contain opacity-[0.4] sm:opacity-[0.5] xl:opacity-[0.88]"
            />
          </div>
        </>
      }
    >
      {/* ── Content column ───────────────────────────────────────
          Padding keeps content clear of portrait (left) and rail (right). */}
      <div className="flex min-h-0 flex-1 flex-col lg:pl-[26%] lg:pr-[220px] xl:pl-[28%]">
        <header className="relative flex shrink-0 flex-col items-center text-center">
          <Eyebrow align="center">{copy.starmap.eyebrow}</Eyebrow>
          <SplitText
            as="h2"
            text={copy.starmap.title}
            className="t-display t-star mt-3 text-paper sm:mt-4"
          />
          <Reveal delay={0.4} className="mt-2 sm:mt-3">
            <p className="t-body text-[0.78rem] sm:text-sm">{copy.starmap.sub}</p>
          </Reveal>
        </header>

        {/* ── The sky ─────────────────────────────────────────
            Enlarged container to make the Star Map the primary focus. */}
        <div className="relative mx-auto mt-3 flex min-h-0 w-full max-w-[1100px] flex-1 flex-col sm:mt-5">
          <div className="relative h-[clamp(300px,47dvh,500px)] w-full shrink-0 lg:h-[clamp(300px,42dvh,500px)]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
                </filter>
              </defs>

              {/* Distant field — mix of static and animated to save performance */}
              {farStars.map((s) => (
                s.animates ? (
                  <motion.circle
                    key={s.id}
                    cx={s.x} cy={s.y} r={s.r}
                    fill="#f5efe9"
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    whileInView={
                      reduced
                        ? { opacity: s.o * 0.5, x: 0, y: 0 }
                        : {
                          opacity: [s.o * 0.2, s.o, s.o * 0.2],
                          x: [0, s.drift.x, 0],
                          y: [0, s.drift.y, 0],
                        }
                    }
                    viewport={{ once: false, amount: 0 }}
                    transition={reduced
                      ? { duration: 1 }
                      : { duration: 6 + s.d * 2, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
                  />
                ) : (
                  <circle
                    key={s.id}
                    cx={s.x} cy={s.y} r={s.r}
                    fill="#f5efe9"
                    opacity={s.o}
                  />
                )
              ))}

              {/* Constellation lines */}
              {segments.map((s) => (
                <g key={s.key}>
                  {/* Glow shadow */}
                  <motion.line
                    x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y}
                    stroke="#d9be8e"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#line-glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: s.lit ? 1 : 0, opacity: s.lit ? 0.35 : 0 }}
                    transition={{ duration: 1.4, ease: EASE.silk }}
                  />
                  {/* Crisp line */}
                  <motion.line
                    x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y}
                    stroke="#d9be8e"
                    strokeWidth="1.1"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: s.lit ? 1 : 0, opacity: s.lit ? 0.78 : 0 }}
                    transition={{ duration: 1.4, ease: EASE.silk }}
                  />
                </g>
              ))}
            </svg>

            {/* Interactive stars */}
            {stars.map((star, i) => {
              const isFound = found.has(star.id);
              const isOpen = open?.id === star.id;
              const pos = at(star);
              const openPos = open ? at(open) : null;
              const near = openPos
                ? Math.hypot(openPos.x - pos.x, openPos.y - pos.y) < 26 && !isOpen
                : false;

              return (
                <motion.button
                  key={star.id}
                  onClick={() => select(star)}
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: 48,
                    height: 48,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-label={star.title}
                  aria-pressed={isOpen}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.09, ease: EASE.bloom }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Halo */}
                  <motion.span
                    className="absolute rounded-full"
                    style={{
                      width: 52,
                      height: 52,
                      background:
                        'radial-gradient(circle, rgba(217,190,142,0.42) 0%, transparent 66%)',
                    }}
                    animate={{
                      opacity: isOpen ? 1 : near ? 0.7 : isFound ? 0.45 : compact ? 0.3 : 0.15,
                      scale: isOpen ? 1.8 : near ? 1.3 : 1,
                    }}
                    transition={{ duration: 0.7, ease: EASE.silk }}
                  />
                  {/* Star core */}
                  <motion.span
                    className="relative block rounded-full"
                    style={{ background: '#f5efe9' }}
                    animate={{
                      width: (isOpen ? 10 : isFound ? 7 : compact ? 6 : 4.5) * star.mag,
                      height: (isOpen ? 10 : isFound ? 7 : compact ? 6 : 4.5) * star.mag,
                      boxShadow: isOpen
                        ? '0 0 20px 4px rgba(232,160,176,0.8), 0 0 40px 10px rgba(200,85,110,0.3)'
                        : isFound
                          ? '0 0 12px 3px rgba(217,190,142,0.55)'
                          : '0 0 6px 1px rgba(245,239,233,0.28)',
                      opacity: isFound ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.6, ease: EASE.silk }}
                  />
                </motion.button>
              );
            })}

            {/* Always-visible star labels.

                From `lg` the label sits just below its star, exactly
                as it always has. Below `lg` it hangs off the side the
                star leans away from — measured from that edge, and
                capped so it can neither reach the frame edge nor the
                next star's label — and vertically centred on the star
                rather than dropped underneath it. */}
            {stars.map((star, i) => {
              const meta = LABEL_META[i];
              const isOpen = open?.id === star.id;
              const pos = at(star);
              const toLeft = compact && star.m.side === 'l';

              const place = compact
                ? {
                    top: `${pos.y}%`,
                    transform: 'translateY(-50%)',
                    textAlign: toLeft ? 'right' : 'left',
                    /* The 24px in these offsets is the star's, not a
                       margin. Its button carries `transform:
                       translate(-50%,-50%)` in `style`, but it is a
                       motion.button that also animates `scale`, and
                       Framer owns `transform` outright — so the
                       translate never lands and the star actually sits
                       half its 48px box to the right of `pos.x`. The
                       `lg` offsets in LABEL_META were hand-tuned
                       against that same rendered position, which is why
                       they read oddly too. Correcting the button would
                       move every desktop star, so the offset is
                       absorbed here instead. */
                    ...(toLeft
                      ? { right: `calc(${100 - pos.x}% - 7px)`, maxWidth: `min(${pos.x}% - 15px, 190px)` }
                      : { left: `calc(${pos.x}% + 41px)`, maxWidth: `min(${100 - pos.x}% - 49px, 190px)` }),
                  }
                : {
                    left: `${pos.x + meta.dx}%`,
                    top: `${pos.y + meta.dy}%`,
                    textAlign: meta.align,
                  };

              return (
                <motion.div
                  key={`lbl-${star.id}`}
                  className="pointer-events-none absolute select-none"
                  style={{
                    ...place,
                    textShadow: '0 1px 6px rgba(5,3,8,0.95), 0 0 10px rgba(5,3,8,0.7)',
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: EASE.silk }}
                >
                  <span className="t-numeral block text-[0.6rem] text-champagne/70 lg:text-[0.7rem]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <motion.span
                    className="t-display mt-px block text-[0.82rem] leading-tight italic lg:max-w-[180px] lg:text-[0.85rem]"
                    animate={{ color: isOpen ? '#e8a0b0' : '#f5efe9' }}
                    transition={{ duration: 0.5 }}
                  >
                    {star.title}
                  </motion.span>
                  {/* The excerpt is the panel's job on a narrow screen —
                      repeating a truncated copy of it beside every star
                      is what made the labels collide. */}
                  <span className="mt-0.5 hidden max-w-[170px] truncate font-sans text-[0.68rem] leading-snug text-paper-dim/60 lg:block">
                    {star.note}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* ── The note ──────────────────────────────────────
              Absolutely placed inside the leftover band, so opening a
              star swaps the panel without changing document height.
              The panel scrolls internally if a note ever runs long. */}
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-x-0 bottom-7 top-0 flex items-center justify-center px-2">
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.figure
                    key={open.id}
                    className="surface-veil max-h-full w-full max-w-lg overflow-y-auto rounded-sm px-5 py-4 text-center sm:px-7 sm:py-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.7, ease: EASE.silk }}
                  >
                    <span className="t-numeral block text-[0.75rem] text-champagne/60">
                      {String(stars.indexOf(open) + 1).padStart(2, '0')}
                    </span>
                    <figcaption className="t-display mt-1.5 text-[clamp(1.15rem,3.5vw,1.7rem)] italic text-rose-soft">
                      {open.title}
                    </figcaption>
                    <div className="hairline mx-auto my-3 w-14" />
                    <p className="t-body text-[0.8rem] leading-relaxed sm:text-[0.85rem]">{open.note}</p>
                  </motion.figure>
                ) : (
                  <motion.p
                    key="hint"
                    className="font-sans text-[10px] uppercase tracking-[0.3em] text-paper-faint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {copy.starmap.progress(found.size, stars.length)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center">
              <AnimatePresence>
                {complete && (
                  <motion.p
                    className="t-display text-[clamp(1rem,3vw,1.35rem)] italic text-champagne"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: EASE.silk }}
                  >
                    {copy.starmap.complete}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation ────────────────────────────────────
          Outside the padding so it spans the full width. */}
      <Reveal delay={0.9} className="flex min-h-[clamp(56px,10dvh,92px)] shrink-0 items-center lg:pr-[220px]">
        {/* Set end to end the two labels are wider than 320px, so the
            narrowest screens read them as a stack. The band it sits in
            is elastic, so nothing below is pushed off. */}
        <div className="flex w-full flex-col items-center gap-3 py-1 sm:flex-row sm:justify-between sm:gap-4 sm:py-0">
          <button
            onClick={scrollToGarden}
            className="group -my-3 inline-flex min-h-[44px] items-center gap-3 py-3 text-champagne"
            style={{ filter: 'drop-shadow(0 1px 5px rgba(5,3,8,0.95))' }}
          >
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.28em] sm:text-[0.6rem] sm:tracking-[0.32em]">
              Wander a little
            </span>
            <span className="relative hidden h-[1px] w-12 overflow-hidden bg-champagne/30 sm:block">
              <motion.span
                className="absolute inset-0 origin-left bg-champagne"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
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

          <div className="flex flex-col items-center gap-1 sm:gap-2.5">
            <span
              className="block text-[11px] text-champagne/50"
              aria-hidden="true"
              style={{ textShadow: '0 0 10px rgba(217,190,142,0.5)' }}
            >
              ✦
            </span>
            <button
              onClick={scrollToLittle}
              className="group -my-3 inline-flex min-h-[44px] items-center gap-3 py-3 text-champagne"
              style={{ filter: 'drop-shadow(0 1px 5px rgba(5,3,8,0.95))' }}
            >
              <span className="font-sans text-[0.55rem] uppercase tracking-[0.28em] sm:text-[0.6rem] sm:tracking-[0.32em]">
                Explore the little things
              </span>
            </button>
          </div>
        </div>
      </Reveal>
    </Chapter>
  );
}
