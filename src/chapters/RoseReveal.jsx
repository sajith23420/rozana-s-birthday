import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flower2, Mail } from 'lucide-react';
import { Chapter } from '../components/layout/Chapter.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { SmartImage } from '../components/media/SmartImage.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { PetalFall } from '../components/fx/PetalFall.jsx';
import { RoseCelebration } from '../components/fx/RoseCelebration.jsx';
import { splitGlyphs } from '../lib/glyphs.jsx';
import { copy } from '../content/copy.js';
import { images } from '../content/images.js';
import { EASE } from '../lib/easing.js';
import { useAudio } from '../hooks/audioContext.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   08 — THE FINAL ROSE

   A cinematic Secret-Letter–style scene for the closing chapter.
   Left column: the chapter mark, the last words, the signature,
   and the rose-pick CTA. Right column: the photograph in a lit,
   glowing frame with roses resting against it. The bottom bar
   carries a chapter-number disc and a folded P.S. note.

   Picking the rose hands the viewport to RoseCelebration — a fixed
   CSS-only layer that showers petals, settles, and holds the
   birthday message. Nothing loops afterwards.
   ══════════════════════════════════════════════════════════════════ */

const BURST_MS = 5000;
const LIFT = 0.28;

/* Gold specks around the rose button. */
const SPARKS = [
  { id: 1, x: '-5%', y: '-32%', s: 3, dur: '6s', delay: '-1s' },
  { id: 2, x: '103%', y: '-16%', s: 2, dur: '8s', delay: '-4s' },
  { id: 3, x: '-3%', y: '114%', s: 2, dur: '7s', delay: '-2.5s' },
  { id: 4, x: '95%', y: '110%', s: 3, dur: '9s', delay: '-6s' },
];

/* ── Floating dust around the photo frame ──────────────────────── */
function FrameDust({ seed = 83 }) {
  const reduced = useReducedMotion();
  const motes = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: 8 }, (_, id) => ({
      id,
      x: 10 + rand() * 80,
      y: 12 + rand() * 76,
      size: 1 + rand() * 2,
      dur: `${(10 + rand() * 14).toFixed(1)}s`,
      delay: `-${(rand() * 11).toFixed(1)}s`,
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
            background: 'rgba(240,223,192,0.5)',
            animation: `dust-float ${m.dur} ease-in-out ${m.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* Hairline with a heart set into it. */
function HeartRule({ className = '' }) {
  return (
    <div className={`flex w-full items-center gap-4 ${className}`} aria-hidden="true">
      <span className="hairline block h-px flex-1" />
      <Heart size={13} strokeWidth={1.25} className="glow-gold shrink-0 text-champagne/75" />
      <span className="hairline block h-px flex-1" />
    </div>
  );
}

export function RoseReveal() {
  const [picked, setPicked] = useState(false);
  const [burst, setBurst] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  const reduced = useReducedMotion();
  const { fadeTo, volume } = useAudio();

  const sectionRef = useRef(null);
  const volumeAtPick = useRef(0.55);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!picked) return;
    if (onScreen) fadeTo(Math.min(1, volumeAtPick.current + LIFT), 2200);
    else fadeTo(volumeAtPick.current, 3200);
  }, [picked, onScreen, fadeTo]);

  const pick = () => {
    if (picked) return;
    volumeAtPick.current = volume;
    setPicked(true);
    setBurst(true);
    timers.current.push(setTimeout(() => setBurst(false), reduced ? 600 : BURST_MS));
  };

  return (
    <Chapter
      id="reveal"
      ref={sectionRef}
      padY={false}
      className="overflow-hidden"
      innerClassName="max-w-[1340px]"
      style={{ zIndex: picked ? 'var(--z-celebration)' : 'var(--z-content)' }}
      backdrop={
        <>
          {/* The room: a deep crimson wash with dark corners. */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(38% 48% at 68% 50%, rgba(120,28,54,0.5), transparent 70%),' +
                'radial-gradient(46% 40% at 30% 42%, rgba(61,15,30,0.45), transparent 72%),' +
                'radial-gradient(95% 65% at 50% 108%, rgba(20,6,13,0.92), transparent 74%)',
            }}
            animate={{ opacity: picked ? 1 : 0.85 }}
            transition={{ duration: 2.4, ease: EASE.silk }}
          />
          <div className="cinematic-vignette absolute inset-0" />
          <ParticleField count={20} intensity={0.35} speed={0.5} color="240, 223, 192" seed={137} />
          <PetalFall count={18} active speed={0.6} seed={139} />
        </>
      }
    >
      {picked && <RoseCelebration visible={onScreen} burst={burst} />}

      <div className="flex min-h-[100svh] flex-col gap-4 py-[clamp(2.25rem,5.5svh,4rem)] md:gap-4">
        {/* ═══ HEADER ═══════════════════════════════════════════ */}
        <header className="flex items-start justify-between gap-6">
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE.silk }}
          >
            <span className="t-eyebrow">{copy.reveal.kicker}</span>
            <span className="mt-3 flex items-center gap-3">
              <span className="t-eyebrow text-rose-soft/75">{copy.reveal.name}</span>
              <Flower2 size={13} strokeWidth={1.3} className="shrink-0 text-champagne/55" />
            </span>
            <span className="mt-3 flex items-center gap-2">
              <span className="hairline block h-px w-20 sm:w-28" />
              <span className="text-[9px] leading-none text-champagne/60">&#10022;</span>
            </span>
          </motion.div>

          <motion.div
            className="hidden items-center gap-4 pt-1 md:flex"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE.silk }}
          >
            <span className="flex flex-col items-end gap-2">
              <span className="t-eyebrow">{copy.reveal.corner}</span>
              <span className="hairline block h-px w-24" />
            </span>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne/30 text-rose-soft/80"
              style={{ boxShadow: '0 0 22px -10px rgba(217,190,142,0.8)' }}
              aria-hidden="true"
            >
              <Mail size={14} strokeWidth={1.4} />
            </span>
          </motion.div>
        </header>

        {/* ═══ THE SCENE ════════════════════════════════════════ */}
        <div className="grid flex-1 content-center items-center gap-x-8 gap-y-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-x-10 lg:gap-x-14 lg:pr-8 xl:pr-12">
          {/* ── LEFT — the last things worth saying ───────────── */}
          <div
            /* The photograph is right-aligned in a column wider than
               itself, which leaves the empty space in the middle of the
               scene. Nudging the text column toward it closes part of
               that gap without touching the image. Desktop only — the
               stacked layouts have no gap to close. */
            className="contents md:flex md:flex-col md:justify-center lg:translate-x-10 xl:translate-x-20"
            style={{ gap: 'clamp(0.85rem, 2.4svh, 1.9rem)' }}
          >
            <div className="order-1">
              <motion.h2
                className="t-display-hero leading-[1.04]"
                style={{ fontSize: 'clamp(2rem, min(5.4vw, 7svh), 4rem)' }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.3, ease: EASE.bloom }}
              >
                <span className="text-paper">{copy.reveal.title} </span>
                <span className="italic text-rose-soft">{copy.reveal.titleAccent}</span>
              </motion.h2>

              <HeartRule className="mt-6 max-w-[18rem]" />
            </div>

            <div className="order-3 flex flex-col">
              <motion.p
                className="t-body max-w-[30rem] whitespace-pre-line leading-[1.9] text-paper-dim/80"
                style={{ fontSize: 'clamp(0.78rem, min(1.05vw, 1.75svh), 0.95rem)' }}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.2, delay: 0.15, ease: EASE.silk }}
              >
                {copy.reveal.intro}
              </motion.p>

              {/* ── The wish ─────────────────────────────────── */}
              <motion.div
                className="relative max-w-[30rem] rounded-[3px] pl-6 pr-5"
                style={{
                  marginTop: 'clamp(0.85rem, 2.4svh, 1.9rem)',
                  paddingBlock: 'clamp(0.85rem, 2.2svh, 1.5rem)',
                  background:
                    'linear-gradient(120deg, rgba(61,15,30,0.5), rgba(20,6,13,0.32) 70%, transparent)',
                  borderLeft: '1px solid rgba(217,190,142,0.3)',
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 1.2, delay: 0.3, ease: EASE.silk }}
              >
                <p
                  className="t-display italic text-champagne"
                  style={{ fontSize: 'clamp(1rem, min(2.2vw, 2.7svh), 1.4rem)' }}
                >
                  {copy.reveal.wishHeading}
                </p>
                <p
                  className="t-body whitespace-pre-line leading-[1.85] text-paper/75"
                  style={{
                    marginTop: 'clamp(0.6rem, 1.6svh, 1rem)',
                    fontSize: 'clamp(0.76rem, min(1vw, 1.65svh), 0.92rem)',
                  }}
                >
                  {copy.reveal.wish}
                </p>
                <p
                  className="t-body whitespace-pre-line leading-[1.85] text-paper-dim/65"
                  style={{
                    marginTop: 'clamp(0.55rem, 1.5svh, 1rem)',
                    fontSize: 'clamp(0.72rem, min(0.95vw, 1.5svh), 0.86rem)',
                  }}
                >
                  {copy.reveal.wishSoft}
                </p>
              </motion.div>

              {/* ── Closing + Signature ───────────────────────── */}
              <motion.p
                className="t-display max-w-[28rem] italic text-rose-soft/90"
                style={{
                  marginTop: 'clamp(0.85rem, 2.4svh, 1.9rem)',
                  fontSize: 'clamp(0.9rem, min(1.9vw, 2.4svh), 1.2rem)',
                }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.1, delay: 0.45, ease: EASE.silk }}
              >
                {copy.reveal.closing}
              </motion.p>

              <motion.p
                className="t-display text-[0.9rem] italic text-champagne/80"
                style={{ marginTop: 'clamp(0.3rem, 1svh, 0.75rem)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.1, delay: 0.6, ease: EASE.silk }}
              >
                {splitGlyphs(copy.reveal.signature)}
              </motion.p>

              {/* ── The rose CTA ──────────────────────────────── */}
              <AnimatePresence>
                {!picked && (
                  <motion.div
                    className="relative self-start"
                    style={{ marginTop: 'clamp(1rem, 2.9svh, 2.5rem)' }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.75, ease: EASE.silk }}
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

                    <PremiumButton size="lg" onClick={pick}>
                      <span className="inline-flex items-center gap-3">
                        <Flower2 size={14} strokeWidth={1.5} className="shrink-0" />
                        {copy.reveal.cta}
                      </span>
                    </PremiumButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT — the photograph in a glowing frame ──────── */}
          <motion.div
            className="order-2 flex min-w-0 items-center justify-center md:h-full md:justify-end"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.4, delay: 0.1, ease: EASE.bloom }}
          >
            <div
              className="relative"
              style={{
                width: 'min(100%, 54svh, 34rem)',
                aspectRatio: '3 / 4',
              }}
            >
              {/* Two offset cards behind for the stacked-photograph look. */}
              <div
                className="absolute inset-0 rounded-[14px] border border-champagne/12"
                style={{
                  transform: 'rotate(-5.5deg) translate3d(-3%, -3.5%, 0)',
                  background: 'linear-gradient(150deg, rgba(61,15,30,0.5), rgba(12,7,16,0.6))',
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 rounded-[14px] border border-champagne/18"
                style={{
                  transform: 'rotate(-2.5deg) translate3d(-1.5%, -1.75%, 0)',
                  background: 'linear-gradient(150deg, rgba(88,21,42,0.5), rgba(12,7,16,0.55))',
                }}
                aria-hidden="true"
              />

              {/* The crimson glow pool the frame sits in. */}
              <div
                className="pointer-events-none absolute inset-[-18%] -z-10"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(200,85,110,0.28), rgba(88,21,42,0.14) 48%, transparent 76%)',
                }}
                aria-hidden="true"
              />

              {/* Floating dust around the frame. */}
              <FrameDust />

              {/* The photograph. */}
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-[14px] border border-champagne/40"
                style={{ transform: 'rotate(1.2deg)' }}
                animate={{
                  boxShadow: picked
                    ? '0 0 70px -14px rgba(200,85,110,0.75), 0 40px 90px -40px rgba(0,0,0,0.95)'
                    : '0 0 46px -18px rgba(200,85,110,0.5), 0 40px 90px -40px rgba(0,0,0,0.95)',
                }}
                transition={{ duration: 2, ease: EASE.silk }}
              >
                <SmartImage
                  image={images.finalMoment}
                  className="h-full w-full"
                  ratio="3/4"
                  tone={false}
                  sizes="(max-width: 1024px) 82vw, 34vw"
                />
                {/* A warm wash that lifts as the celebration begins. */}
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(70% 60% at 50% 40%, rgba(240,223,192,0.16), transparent 72%)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: picked ? 1 : 0 }}
                  transition={{ duration: 2, ease: EASE.silk }}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Roses resting around the frame. */}
              <div
                className="pointer-events-none absolute -bottom-6 -left-6 rotate-[12deg] sm:-bottom-9 sm:-left-10"
                aria-hidden="true"
              >
                <Rose bloom={1} size={92} seed={211} glow={false} />
              </div>
              <div
                className="pointer-events-none absolute -right-7 top-[26%] hidden rotate-[-14deg] opacity-90 sm:block"
                aria-hidden="true"
              >
                <Rose bloom={1} size={74} seed={223} glow={false} />
              </div>
              <div
                className="pointer-events-none absolute -right-4 top-[6%] hidden rotate-[8deg] opacity-70 lg:block"
                aria-hidden="true"
              >
                <Rose bloom={1} size={48} seed={227} glow={false} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ BOTTOM BAR ═════════════════════════════════════════
            Left: a chapter-number disc. Right: a folded P.S. note. */}
        <div className="mt-auto flex items-end justify-between gap-6">
          {/* Chapter number indicator */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1, delay: 0.8, ease: EASE.silk }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne/25 bg-wine-900/50"
              style={{ boxShadow: '0 0 18px -7px rgba(217,190,142,0.6)' }}
              aria-hidden="true"
            >
              <Heart size={12} strokeWidth={1.3} className="text-rose-soft/80" />
            </span>
            <span className="t-eyebrow text-paper-faint/80">08</span>
          </motion.div>

          {/* P.S. folded note — desktop only */}
          <motion.div
            className="relative hidden w-[13rem] lg:block"
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
                clipPath: 'polygon(0 0, 100% 0, 100% 74%, 82% 100%, 0 100%)',
              }}
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.34em] text-champagne/70">
                P.S.
              </p>
              <p className="t-display mt-2 text-[0.95rem] italic leading-snug text-paper-dim/80">
                You mean the world to me.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Chapter>
  );
}
