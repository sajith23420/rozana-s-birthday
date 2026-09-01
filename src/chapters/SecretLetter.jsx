import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flower2, Infinity as InfinityIcon } from 'lucide-react';
import { Chapter } from '../components/layout/Chapter.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { splitGlyphs } from '../lib/glyphs.jsx';
import { letter } from '../content/letter.js';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   06 — SECRET LETTER

   One cinematic screen, composed in three columns: the editorial
   invitation on the left, the envelope holding the centre under a
   warm key light, and three quiet notes down the right. Below that
   breakpoint the same pieces stack in reading order — label,
   heading, invitation, envelope, button, notes — rather than the
   desktop layout being shrunk.

   The letter itself is untouched: the same content from
   content/letter.js, the same opening interaction, the same flap,
   page-rise and line-by-line reveal timings. What changed is where
   those pieces sit and how they are lit.

   The envelope and the open letter share one grid cell, so opening
   swaps them in place instead of pushing a second full-height block
   onto the page.
   ══════════════════════════════════════════════════════════════════ */

/* Floating dust around the envelope. Ten <span>s on the existing
   `dust-float` keyframe — it was fourteen framer-motion elements each
   running an infinite JS-driven loop, which is a per-frame cost for
   something CSS does on the compositor. */
function EnvelopeDust({ seed = 77 }) {
  const reduced = useReducedMotion();

  const motes = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: 10 }, (_, id) => ({
      id,
      x: 14 + rand() * 72,
      y: 18 + rand() * 64,
      size: 1 + rand() * 2,
      dur: `${(11 + rand() * 14).toFixed(1)}s`,
      delay: `-${(rand() * 12).toFixed(1)}s`,
    }));
  }, [seed]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            background: 'rgba(240,223,192,0.55)',
            animation: `dust-float ${m.dur} ease-in-out ${m.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* A hairline with a small outlined heart set into it. */
function HeartRule({ className = '' }) {
  return (
    <div className={`flex w-full items-center gap-4 ${className}`} aria-hidden="true">
      <span className="hairline block h-px flex-1" />
      <Heart size={13} strokeWidth={1.25} className="glow-gold shrink-0 text-champagne/75" />
      <span className="hairline block h-px flex-1" />
    </div>
  );
}

/* Four gold specks around the button. Static positions, the existing
   star-twinkle, four elements. */
const SPARKS = [
  { id: 1, x: '-6%', y: '-30%', s: 3, dur: '6s', delay: '-1s' },
  { id: 2, x: '104%', y: '-14%', s: 2, dur: '8s', delay: '-4s' },
  { id: 3, x: '-2%', y: '112%', s: 2, dur: '7s', delay: '-2.5s' },
  { id: 4, x: '96%', y: '108%', s: 3, dur: '9s', delay: '-6s' },
];

const DETAIL_ICONS = [Heart, Flower2, InfinityIcon];

export function SecretLetter() {
  const [opened, setOpened] = useState(false);
  const reduced = useReducedMotion();
  const open = () => setOpened(true);

  return (
    <Chapter
      id="letter"
      padY={false}
      className="overflow-hidden"
      innerClassName="max-w-[1320px]"
      backdrop={
        <>
          {/* The room: a spotlight on the table, corners left dark. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(42% 46% at 50% 46%, rgba(88,21,42,0.55), transparent 70%),' +
                'radial-gradient(30% 34% at 50% 40%, rgba(217,190,142,0.14), transparent 68%),' +
                'radial-gradient(95% 65% at 50% 108%, rgba(26,7,16,0.92), transparent 72%)',
            }}
          />
          {/* The key light lifts a little as the letter is opened. */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(34% 30% at 50% 38%, rgba(240,223,192,0.13), transparent 62%)',
            }}
            animate={{ opacity: opened ? 1.15 : 0.5 }}
            transition={{ duration: 1.5, ease: EASE.silk }}
          />
          {/* Corners, pulled down hard so the centre reads as lit. */}
          <div className="cinematic-vignette absolute inset-0" />
        </>
      }
    >
      <div
        className="grid min-h-[100svh] w-full items-center gap-x-10 gap-y-14 py-[clamp(4.5rem,11svh,7rem)] lg:grid-cols-[minmax(260px,20rem)_minmax(0,1fr)_minmax(170px,13rem)] lg:gap-x-12 lg:pr-16 xl:gap-x-16 xl:pr-24"
      >
        {/* ═══ LEFT — the invitation ═══════════════════════════ */}
        <div className="contents lg:flex lg:flex-col lg:items-start lg:text-left">
          <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* The mark: chapter, name, rule, and one small spark. */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE.silk }}
          >
            <span className="t-eyebrow">{copy.letter.kicker}</span>
            <span className="t-eyebrow mt-2 text-champagne/55">{copy.letter.name}</span>
            <span className="mt-4 flex items-center gap-2">
              <span className="hairline block h-px w-16" />
              <span className="text-[9px] leading-none text-champagne/60">&#10022;</span>
            </span>
          </motion.div>

          <motion.h2
            className="t-display-hero mt-10 leading-[1.02]"
            style={{ fontSize: 'clamp(2.4rem, min(6.2vw, 7svh), 3.9rem)' }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.3, delay: 0.15, ease: EASE.bloom }}
          >
            <span className="block text-paper">{copy.letter.title}</span>
            <span className="block italic text-rose-soft">{copy.letter.titleAccent}</span>
          </motion.h2>

          <HeartRule className="mt-9 max-w-[17rem]" />

          <motion.p
            className="t-body mt-8 max-w-[24rem] whitespace-pre-line text-[clamp(0.82rem,1.05vw,0.95rem)] leading-[2] text-paper-dim/75"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE.silk }}
          >
            {copy.letter.intro}
          </motion.p>

          </div>

          {/* ── The trigger. Same handler, new dress. On a phone this
              sits after the envelope, which is the order it is read
              in; on desktop it closes the left column. ──────────── */}
          <AnimatePresence>
            {!opened && (
              <motion.div
                className="relative order-3 mt-11 self-center lg:self-start"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.45, ease: EASE.silk }}
              >
                {!reduced &&
                  SPARKS.map((s) => (
                    <span
                      key={s.id}
                      className="pointer-events-none absolute rounded-full bg-champagne/70"
                      style={{
                        left: s.x,
                        top: s.y,
                        width: s.s,
                        height: s.s,
                        animation: `star-twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
                      }}
                      aria-hidden="true"
                    />
                  ))}

                <PremiumButton onClick={open}>
                  <span className="inline-flex items-center gap-3">
                    <Heart size={13} strokeWidth={1.5} className="shrink-0" />
                    {copy.letter.cta}
                  </span>
                </PremiumButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ CENTRE — the envelope, and then the letter ══════ */}
        <div className="order-2 flex min-w-0 flex-col items-center">
          {/* Both states occupy one grid cell, so opening swaps them
              in place rather than adding a screen of height. */}
          <div className="grid w-full max-w-[34rem] justify-items-center">
            {/* ── The envelope ─────────────────────────────── */}
            <motion.div
              className="relative w-full"
              style={{ gridArea: '1 / 1', perspective: 1400 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              animate={opened ? { opacity: 0, scale: 0.94, y: -18 } : undefined}
              transition={
                opened
                  ? { duration: 1.1, delay: 1.15, ease: EASE.veil }
                  : { duration: 1.2, ease: EASE.silk }
              }
            >
              {/* The warm pool the envelope sits in. */}
              <div
                className="pointer-events-none absolute inset-[-32%] -z-10"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(168,66,90,0.22), rgba(88,21,42,0.12) 46%, transparent 74%)',
                }}
                aria-hidden="true"
              />

              <EnvelopeDust />

              {/* Cast shadow on the table — shifts when opened */}
              <motion.div
                className="pointer-events-none absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-[50%] blur-2xl"
                style={{ background: 'rgba(0,0,0,0.75)' }}
                animate={{
                  width: opened ? '75%' : '85%',
                  y: opened ? 6 : 0,
                  opacity: opened ? 0.5 : 0.75,
                }}
                transition={{ duration: 1.5, ease: EASE.silk }}
                aria-hidden="true"
              />

              {/* A faint burgundy bloom on the floor, barely there. */}
              <div
                className="pointer-events-none absolute -bottom-16 left-1/2 h-20 w-[70%] -translate-x-1/2 rounded-[50%] opacity-40"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(168,66,90,0.3), transparent 72%)',
                }}
                aria-hidden="true"
              />

              {/* The envelope proper. The gentle float is one
                  compositor-only transform on the whole group. */}
              <div className={`relative aspect-[1.62/1] w-full ${opened ? '' : 'anim-drift'}`}>
                {/* Body */}
                <div
                  className="absolute inset-0 rounded-[3px] border border-champagne/20"
                  style={{
                    background: 'linear-gradient(158deg, #3d0f1e 0%, #240913 55%, #14060d 100%)',
                    boxShadow:
                      'inset 0 1px 0 rgba(240,223,192,0.1), inset 0 0 60px rgba(0,0,0,0.45), 0 34px 78px -32px rgba(0,0,0,0.95)',
                  }}
                />
                {/* Paper tooth on the envelope itself. */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[3px] opacity-[0.16] mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/texture-noise.svg)',
                    backgroundSize: '220px',
                  }}
                  aria-hidden="true"
                />

                {/* The page, rising out from behind the envelope front */}
                <AnimatePresence>
                  {opened && (
                    <motion.div
                      className="absolute inset-x-[7%] bottom-[10%] top-[10%] rounded-[2px] border border-wine-700/15"
                      style={{
                        background: 'linear-gradient(#efe6d8, #e3d7c4)',
                        transformOrigin: 'bottom center',
                        boxShadow: '0 18px 40px -18px rgba(0,0,0,0.8)',
                      }}
                      initial={{ y: 0, opacity: 0, scale: 0.96 }}
                      animate={{ y: reduced ? 0 : '-58%', opacity: 1, scale: 1 }}
                      exit={{ y: 0, opacity: 0 }}
                      transition={{ duration: 1.5, delay: 0.5, ease: EASE.bloom }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>

                {/* Front panel — sits above the page so it looks tucked in */}
                <div
                  className="absolute inset-x-0 bottom-0 top-[38%] rounded-b-[3px] border-x border-b border-champagne/20"
                  style={{
                    background: 'linear-gradient(165deg, #4a1324 0%, #1a0710 100%)',
                    clipPath: 'polygon(0 0, 50% 34%, 100% 0, 100% 100%, 0 100%)',
                  }}
                  aria-hidden="true"
                />

                {/* Flap */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-[52%] origin-top"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateX: opened ? -172 : 0 }}
                  transition={{ duration: 1.3, ease: EASE.veil }}
                  aria-hidden="true"
                >
                  <div
                    className="h-full w-full"
                    style={{
                      background: 'linear-gradient(180deg, #66192f 0%, #2b0a14 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      backfaceVisibility: 'hidden',
                      borderTop: '1px solid rgba(217,190,142,0.22)',
                    }}
                  />
                </motion.div>

                {/* Wax seal */}
                <AnimatePresence>
                  {!opened && (
                    <motion.div
                      className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
                      exit={{ opacity: 0, scale: 0.6, rotate: -25 }}
                      transition={{ duration: 0.5 }}
                      aria-hidden="true"
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 35% 30%, #a8425a, #5c1226 70%)',
                          boxShadow:
                            '0 6px 18px -4px rgba(0,0,0,0.8), inset 0 2px 6px rgba(243,211,218,0.25)',
                        }}
                      >
                        <span className="t-display text-xl italic text-rose-mist/85">
                          {letter.seal}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* A small rose resting against the lower right of
                    the envelope — the existing bloom, kept small. */}
                <div
                  className="pointer-events-none absolute -bottom-5 -right-3 rotate-[14deg] opacity-90 sm:-bottom-7 sm:-right-6"
                  aria-hidden="true"
                >
                  <Rose bloom={1} size={64} seed={191} glow={false} />
                </div>
              </div>
            </motion.div>

            {/* ── The letter, in the envelope's place ────────── */}
            <AnimatePresence>
              {opened && (
                <motion.article
                  className="relative w-full rounded-[3px] px-7 py-11 sm:px-12 sm:py-14"
                  style={{
                    gridArea: '1 / 1',
                    background: 'linear-gradient(#f2ebe0, #e6dbc9)',
                    boxShadow: '0 50px 110px -40px rgba(0,0,0,0.95)',
                  }}
                  initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, delay: 1.2, ease: EASE.bloom }}
                >
                  {/* Paper tooth */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-multiply"
                    style={{
                      backgroundImage: 'url(/images/texture-noise.svg)',
                      backgroundSize: '200px',
                    }}
                    aria-hidden="true"
                  />
                  {/* A thin decorative border just inside the edge */}
                  <div
                    className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-wine-700/15"
                    aria-hidden="true"
                  />

                  <motion.h3
                    className="relative t-display text-center text-[clamp(1.5rem,4vw,2.2rem)] italic text-wine-800"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 1.7 }}
                  >
                    {letter.title}
                  </motion.h3>

                  {/* Gold rule with a heart, under the heading */}
                  <motion.div
                    className="relative mx-auto mt-5 flex w-40 items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.9, delay: 1.85 }}
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-champagne-dim/40" />
                    <Heart size={11} strokeWidth={1.4} className="text-rose-deep/70" />
                    <span className="h-px flex-1 bg-champagne-dim/40" />
                  </motion.div>

                  <div className="relative mt-7 space-y-5 text-center">
                    <LetterLine delay={2.0} className="t-display text-xl italic text-wine-700">
                      {letter.greeting}
                    </LetterLine>

                    {letter.paragraphs.map((p, i) => (
                      <LetterLine
                        key={i}
                        delay={2.2 + i * 0.25}
                        className="font-sans text-[0.9rem] font-light leading-[1.95] text-wine-900/80"
                      >
                        {p}
                      </LetterLine>
                    ))}

                    <LetterLine
                      delay={2.2 + letter.paragraphs.length * 0.25}
                      className="t-display text-xl italic text-wine-700"
                    >
                      {splitGlyphs(letter.closing)}
                    </LetterLine>
                  </div>

                  <motion.footer
                    className="relative mt-10 flex items-center justify-center gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 3.4 }}
                  >
                    <span className="h-[1px] w-14 bg-wine-700/30" />
                    <span className="t-display text-2xl italic text-wine-800">
                      {letter.signature}
                    </span>
                  </motion.footer>
                </motion.article>
              )}
            </AnimatePresence>
          </div>

          {/* ── The small heart below the envelope ───────────── */}
          <AnimatePresence>
            {!opened && (
              <motion.button
                type="button"
                onClick={open}
                className="group mt-12 flex h-11 w-11 items-center justify-center rounded-full border border-champagne/30 bg-wine-900/40 text-champagne/80 transition-colors duration-500 hover:border-champagne/60 hover:text-champagne"
                style={{ boxShadow: '0 0 26px -10px rgba(217,190,142,0.75)' }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.6, ease: EASE.silk }}
                aria-label={copy.letter.cta}
              >
                <Heart size={15} strokeWidth={1.4} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ RIGHT — three quiet notes ═══════════════════════ */}
        <div className="order-4 flex flex-col items-center lg:items-stretch">
          <ul className="relative flex w-full max-w-[22rem] flex-col gap-9 lg:max-w-none">
            {/* The dashed thread connecting the three marks. */}
            <span
              className="pointer-events-none absolute bottom-8 left-[1.375rem] top-8 hidden border-l border-dashed border-champagne/15 sm:block"
              aria-hidden="true"
            />

            {copy.letter.details.map((d, i) => {
              const Icon = DETAIL_ICONS[i];
              const active = i === 0;

              return (
                <motion.li
                  key={d.n}
                  className="relative flex items-start gap-4"
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: EASE.silk }}
                >
                  <span
                    className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? 'border-champagne/55 bg-wine-800/60 text-rose-soft'
                        : 'border-champagne/20 bg-void/50 text-champagne/55'
                    }`}
                    style={
                      active
                        ? { boxShadow: '0 0 24px -8px rgba(217,190,142,0.8)' }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    <Icon size={15} strokeWidth={1.4} />
                  </span>

                  <div className="min-w-0 pt-[2px]">
                    <p
                      className={`font-sans text-[9px] uppercase tracking-[0.34em] ${
                        active ? 'text-champagne' : 'text-champagne/50'
                      }`}
                    >
                      {d.n} — {d.label}
                    </p>
                    <p className="t-body mt-2 whitespace-pre-line text-[0.78rem] leading-[1.7] text-paper-dim/65">
                      {d.text}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {/* ── P.S. — a small folded note, desktop only ─────── */}
          <motion.div
            className="relative mt-14 hidden w-[13rem] self-end lg:block"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, delay: 0.6, ease: EASE.silk }}
          >
            <div
              className="relative rotate-[-2.5deg] px-5 py-4"
              style={{
                background:
                  'linear-gradient(150deg, rgba(61,15,30,0.72), rgba(20,6,13,0.72))',
                border: '1px solid rgba(217,190,142,0.16)',
                /* The folded corner, cut out of the note itself. */
                clipPath: 'polygon(0 0, 100% 0, 100% 74%, 82% 100%, 0 100%)',
              }}
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.34em] text-champagne/70">
                P.S.
              </p>
              <p className="t-display mt-2 text-[0.95rem] italic leading-snug text-paper-dim/80">
                {copy.letter.ps}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Chapter>
  );
}

function LetterLine({ children, delay, className }) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, delay, ease: EASE.silk }}
    >
      {children}
    </motion.p>
  );
}
