import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { StoryNav } from '../components/layout/StoryNav.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { MessageTicker } from '../components/ui/MessageTicker.jsx';
import { HeartIcon } from '../components/ui/HeartIcon.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { Fireflies } from '../components/fx/Fireflies.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { usePointer } from '../hooks/usePointer.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   01 — ROSE GARDEN · THE OPENING FRAME

   One cinematic screen, composed asymmetrically: the masthead across
   the top, the editorial column held in the left ~45%, the
   photograph filling the right ~55%, and the birthday ticker and the
   scroll mark along the bottom. Nothing here scrolls past the fold —
   the chapter opts out of the shell's vertical padding and owns its
   own rhythm, so the whole composition lands inside one viewport.

   The depth system is unchanged: the hero photograph, distant stars
   and haze, a far hedge of roses, the type, and a near hedge that
   passes in front of it. Scroll moves each plane at its own rate and
   the pointer adds a slow camera drift. The near hedge now keeps to
   the left of the frame so it reads against the type rather than
   over the photograph.

   Plane 0 is the supplied artwork. See the `.hero-photo` note in
   styles/base.css for why it is masked rather than shown full-bleed.
   ══════════════════════════════════════════════════════════════════ */

/* Decorative only — the chapter states the same thing in live text,
   so the photograph carries an empty alt and is hidden from the
   accessibility tree, matching every other backdrop layer here. */
const HERO_SRC = '/images/rose-garden-hero.png';

/* Roses placed by hand — a scattered hedge, not a row. */
const FAR = [
  { x: 6, y: 74, s: 62, seed: 2 }, { x: 21, y: 82, s: 46, seed: 8 },
  { x: 38, y: 77, s: 54, seed: 13 }, { x: 57, y: 84, s: 44, seed: 19 },
  { x: 74, y: 76, s: 58, seed: 27 }, { x: 90, y: 83, s: 48, seed: 31 },
];
/* Kept to the left half: the right of the frame is the photograph,
   and a blurred rose over the couple would read as a smudge. */
const NEAR = [
  { x: -3, y: 96, s: 132, seed: 41 }, { x: 17, y: 104, s: 104, seed: 47 },
  { x: 36, y: 101, s: 118, seed: 53 }, { x: 52, y: 98, s: 128, seed: 59 },
];

/* Distant background stars / dust. */
function DistantStars({ count = 50, seed = 200 }) {
  const reduced = useReducedMotion();
  const stars = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 80,
      size: 0.8 + rand() * 1.8,
      opacity: 0.15 + rand() * 0.4,
      dur: 6 + rand() * 12,
      delay: rand() * 8,
    }));
  }, [count, seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#f5efe9',
          }}
          animate={reduced ? { opacity: s.opacity * 0.5 } : {
            opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3],
          }}
          transition={reduced ? { duration: 0.5 } : {
            duration: s.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

/* Large out-of-focus foreground petal shapes. */
function ForegroundPetals({ reduced }) {
  if (reduced) return null;

  const petals = [
    { x: '-5%', y: '65%', size: 180, rot: 25, opacity: 0.08 },
    { x: '88%', y: '40%', size: 140, rot: -15, opacity: 0.06 },
    { x: '75%', y: '80%', size: 200, rot: 45, opacity: 0.07 },
  ];

  return (
    <>
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 1.4,
            background: `radial-gradient(ellipse, rgba(200,85,110,${p.opacity}) 0%, transparent 70%)`,
            filter: 'blur(30px)',
            transform: `rotate(${p.rot}deg)`,
          }}
          animate={{ y: [0, -15, 0], rotate: [p.rot, p.rot + 3, p.rot] }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </>
  );
}

export function RoseGarden() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { ref: pointer } = usePointer();
  const [heroLoaded, setHeroLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '6%']);
  const yHaze = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '14%']);
  const yFar = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-9%']);
  const yNear = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-24%']);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-13%']);
  const fade = useTransform(scrollYProgress, [0, 0.45, 0.85, 1], [1, 1, 0.4, 0.15]);

  /* Slow pointer-driven camera. Amplitude is small enough that a
     transform on two wrappers costs nothing. */
  const drift = (depth) => ({
    transform: reduced
      ? 'none'
      : `translate3d(${(pointer.current?.x ?? 0) * depth}px, ${(pointer.current?.y ?? 0) * depth * 0.5}px, 0)`,
  });

  const scrollOn = () =>
    document.getElementById('starmap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Chapter
      id="garden"
      ref={ref}
      padY={false}
      className="overflow-hidden"
      innerClassName="flex min-h-[100svh] flex-col py-6 sm:py-8"
      backdrop={
        <>
          {/* Plane 0 — the artwork.

              A foreground visual, not a wash: full strength, no tint,
              nothing dimming the photograph. It sits in the backdrop
              slot, so the type and the masthead both draw above it.

              Wide screens give it the right 55% at full bleed — top,
              bottom and right edges are the viewport edges, so there
              is no band or gap anywhere. Narrow screens keep the
              lower panel: a right-hand column at 390px would leave
              nothing to set the heading in.

              object-position leans right of centre on wide screens so
              the couple clears the edge feather; elsewhere the frame
              is already close to the photograph's own composition. */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[54%] overflow-hidden sm:h-[62%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[55%]"
            style={{ y: yHero }}
          >
            <img
              src={HERO_SRC}
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="low"
              decoding="async"
              onLoad={() => setHeroLoaded(true)}
              onError={() => setHeroLoaded(true)}
              className={`hero-photo h-full w-full object-cover object-center transition-opacity duration-[1600ms] ease-out lg:object-[58%_46%] ${
                heroLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Narrow screens only: the type sits over the top of the
                panel, so that band alone is weighted. It clears well
                before the faces. */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(5,3,8,0.96) 0%, rgba(5,3,8,0.72) 12%,' +
                  ' rgba(5,3,8,0.34) 24%, rgba(5,3,8,0.12) 36%, transparent 48%)',
              }}
              aria-hidden="true"
            />

            {/* The bottom feather. The left edge is masked in CSS; this
                is the other edge that would otherwise read as the
                straight side of a rectangle, and it also settles the
                photograph behind the ticker. */}
            <div
              className="absolute inset-x-0 bottom-0 h-[26%]"
              style={{
                background:
                  'linear-gradient(to top, rgba(5,3,8,0.92) 0%, rgba(5,3,8,0.55) 38%, transparent 100%)',
              }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Plane 0.5 — distant star field */}
          <DistantStars />

          {/* Plane 1 — haze */}
          <motion.div className="absolute inset-x-0 -inset-y-[20%]" style={{ y: yHaze }}>
            <div
              className="anim-drift absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 55% at 22% 30%, rgba(88,21,42,0.55), transparent 65%),' +
                  'radial-gradient(60% 50% at 82% 62%, rgba(168,66,90,0.28), transparent 70%),' +
                  'radial-gradient(90% 60% at 50% 100%, rgba(61,15,30,0.75), transparent 72%)',
              }}
            />
          </motion.div>

          {/* The masthead scrim. The photograph's string lights sit
              directly behind the links on a wide screen, and warm
              bokeh under 10px letterforms is unreadable. */}
          <div
            className="absolute inset-x-0 top-0 h-[22%]"
            style={{
              background:
                'linear-gradient(to bottom, rgba(5,3,8,0.86) 0%, rgba(5,3,8,0.55) 42%,' +
                ' rgba(5,3,8,0.2) 74%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* The editorial side is held down a little further, so the
              headline always has ground to sit on however bright the
              photograph's left edge happens to be. */}
          <div
            className="absolute inset-y-0 left-0 hidden w-[62%] lg:block"
            style={{
              background:
                'linear-gradient(to right, rgba(5,3,8,0.92) 0%, rgba(9,4,12,0.72) 42%,' +
                ' rgba(12,5,14,0.34) 74%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <ParticleField count={44} intensity={0.85} color="232, 160, 176" seed={17} />
          <Fireflies count={12} />

          {/* Plane 2 — far hedge */}
          <motion.div className="absolute inset-0" style={{ y: yFar }}>
            <div className="absolute inset-0" style={drift(-12)}>
              {FAR.map((r, i) => (
                <motion.div
                  key={r.seed}
                  className="absolute blur-[1.5px]"
                  style={{ left: `${r.x}%`, top: `${r.y}%`, translate: '-50% -50%', opacity: 0.55 }}
                  animate={reduced ? {} : { y: [0, -7, 0] }}
                  transition={{ duration: 9 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                >
                  <Rose bloom={0.85} size={r.s} seed={r.seed} glow={false} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      }
      foreground={
        <>
          {/* Plane 4 — the near hedge, passing in front of the type */}
          <motion.div className="absolute inset-x-0 -bottom-[24%] h-[68%]" style={{ y: yNear }}>
            <div className="absolute inset-0" style={drift(24)}>
              {NEAR.map((r, i) => (
                <motion.div
                  key={r.seed}
                  className="absolute blur-[3px]"
                  style={{ left: `${r.x}%`, top: `${r.y}%`, translate: '-50% -50%', opacity: 0.55 }}
                  animate={reduced ? {} : { y: [0, -12, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 12 + i * 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }}
                >
                  <Rose bloom={1} size={r.s} seed={r.seed} glow={false} />
                </motion.div>
              ))}
            </div>
            {/* Ground, so the near roses have something to sit on.

                It reaches nothing like as far up the frame as it used
                to: the foreground slot draws above the content, and
                at its old strength this plate was an opaque black
                sheet over the band the scroll mark sits in. */}
            <div
              className="absolute inset-x-0 bottom-0 h-3/4"
              style={{
                background:
                  'linear-gradient(to top, #050308 0%, rgba(5,3,8,0.6) 18%, transparent 42%)',
              }}
            />
            {/* Foreground petal shapes for depth overlap */}
            <ForegroundPetals reduced={reduced} />
          </motion.div>

          {/* Plane 5 — the bottom rule. Full-bleed, and inert: the
              foreground slot takes no pointer events at all. */}
          <div className="absolute inset-x-0 bottom-[74px] sm:bottom-[86px]">
            <MessageTicker items={copy.garden.ticker} />
          </div>
        </>
      }
    >
      <StoryNav />

      {/* ── The editorial column — the left 45% ─────────────────
          `pb` reserves the band the ticker and the scroll mark own,
          so the button can never land underneath them. */}
      <div className="flex flex-1 items-center pb-[112px] pt-6 sm:pb-[128px] lg:pt-0">
        <motion.div
          className="relative w-full lg:w-[47%] lg:min-w-[440px]"
          style={{ y: yText, opacity: fade }}
        >
          <Reveal delay={0} y={16} blur={8} className="flex flex-col gap-4">
            <span className="t-eyebrow">{copy.garden.eyebrow}</span>
            {/* The chapter mark: a hairline broken by a small rose. */}
            <span className="flex items-center gap-3" aria-hidden="true">
              <span className="hairline block w-16 sm:w-20" />
              <Rose bloom={1} size={18} seed={11} glow={false} />
              <span className="hairline block w-10 sm:w-14" />
            </span>
          </Reveal>

          <div className="relative mt-6 sm:mt-8">
            {/* The one <h1> of the running experience. The Entrance has
                its own heading, but it unmounts on entry — without this
                the document would have no level-1 heading at all. */}
            <SplitText
              as="h1"
              text={copy.garden.title}
              accent={copy.garden.titleAccent}
              accentClassName="text-rose-soft"
              className="t-display t-garden max-w-[14ch] text-paper"
              delay={0.15}
            />
            {/* The flourish beside the first line — desktop only, where
                there is room for it to sit clear of the letterforms. */}
            <span
              className="pointer-events-none absolute right-1 top-[0.3em] hidden text-rose-soft/70 lg:block"
              aria-hidden="true"
            >
              <HeartIcon size={26} filled={false} />
            </span>
          </div>

          {/* The handwritten line. */}
          <Reveal delay={0.55} y={14} blur={8}>
            <p className="t-script mt-4 text-[clamp(1.6rem,4.4vw,2.6rem)] sm:mt-5">
              {copy.garden.script}
            </p>
          </Reveal>

          <Reveal delay={0.75} className="mt-5 max-w-[32ch] sm:mt-6">
            <p className="t-body text-[clamp(0.875rem,2.2vw,1rem)] leading-relaxed">
              {copy.garden.sub}
            </p>
          </Reveal>

          <Reveal delay={0.95} className="mt-7 sm:mt-9">
            <PremiumButton variant="rose" onClick={scrollOn}>
              <span className="flex items-center gap-3">
                <HeartIcon size={14} className="text-rose-mist" />
                {copy.garden.cta}
              </span>
            </PremiumButton>
          </Reveal>
        </motion.div>
      </div>

      {/* ── The scroll mark, under the rule ───────────────────── */}
      <motion.button
        onClick={scrollOn}
        className="absolute inset-x-0 bottom-2 mx-auto flex w-fit flex-col items-center gap-2 py-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1.2, ease: EASE.silk }}
      >
        <span
          className="flex h-8 w-5 items-center justify-center rounded-full border border-champagne/80 text-champagne-light"
          style={{ boxShadow: '0 0 16px -3px rgba(217,190,142,0.75)' }}
          aria-hidden="true"
        >
          <motion.span
            animate={reduced ? {} : { y: [-2, 2, -2] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true">
              <path
                d="M6 9.5l6 5.5 6-5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </span>
        <span
          className="font-sans text-[8px] uppercase tracking-[0.42em] text-champagne-light sm:text-[9px]"
          style={{ textShadow: '0 0 18px rgba(217,190,142,0.75), 0 1px 3px rgba(5,3,8,0.9)' }}
        >
          {copy.garden.scroll}
        </span>
      </motion.button>
    </Chapter>
  );
}
