import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { Fireflies } from '../components/fx/Fireflies.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { copy } from '../content/copy.js';
import { usePointer } from '../hooks/usePointer.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';
import { useMemo } from 'react';

/* ══════════════════════════════════════════════════════════════════
   02 — ROSE GARDEN

   Five-plane depth — the hero photograph, distant stars/haze, a far
   hedge of roses, the type, and a near hedge that passes in front of
   it. Scroll moves each plane at its own rate and the pointer adds a
   slow camera drift. Foreground petals occasionally overlap the
   typography to create depth.

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
const NEAR = [
  { x: -2, y: 96, s: 132, seed: 41 }, { x: 26, y: 104, s: 108, seed: 47 },
  { x: 62, y: 101, s: 120, seed: 53 }, { x: 94, y: 97, s: 142, seed: 59 },
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
      className="overflow-hidden"
      backdrop={
        <>
          {/* Plane 0 — the artwork.

              A foreground visual, not a wash: full strength, no tint,
              no vignette, nothing dimming the photograph. It sits in
              the backdrop slot, so the type and the chapter rail both
              draw above it.

              Wide screens give it the right 52% at full bleed — top,
              bottom and right edges are the viewport edges, so there is
              no band or gap anywhere. Narrow screens keep the lower
              panel: a right-hand column at 390px would leave nothing to
              set the heading in.

              object-position leans right of centre on wide screens so
              the couple clears the edge feather; elsewhere the frame is
              already close to the photograph's own composition. */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[54%] overflow-hidden sm:h-[62%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[52%]"
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
              className={`hero-photo h-full w-full object-cover object-center transition-opacity duration-[1600ms] ease-out lg:object-[60%_50%] ${
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
        /* Plane 4 — the near hedge, passing in front of the type */
        <motion.div className="absolute inset-x-0 -bottom-[22%] h-[68%]" style={{ y: yNear }}>
          <div className="absolute inset-0" style={drift(24)}>
            {NEAR.map((r, i) => (
              <motion.div
                key={r.seed}
                className="absolute blur-[3px]"
                style={{ left: `${r.x}%`, top: `${r.y}%`, translate: '-50% -50%', opacity: 0.7 }}
                animate={reduced ? {} : { y: [0, -12, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 12 + i * 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }}
              >
                <Rose bloom={1} size={r.s} seed={r.seed} glow={false} />
              </motion.div>
            ))}
          </div>
          {/* Ground, so the near roses have something to sit on */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/4"
            style={{ background: 'linear-gradient(to top, #050308 32%, transparent)' }}
          />
          {/* Foreground petal shapes for depth overlap */}
          <ForegroundPetals reduced={reduced} />
        </motion.div>
      }
    >
      <motion.div
        className="relative flex min-h-[62svh] flex-col justify-center"
        style={{ y: yText, opacity: fade }}
      >
        <Eyebrow>{copy.garden.eyebrow}</Eyebrow>

        {/* The one <h1> of the running experience. The Entrance has its own
            heading, but it unmounts on entry — without this the document
            would have no level-1 heading at all. Rendering is identical. */}
        <SplitText
          as="h1"
          text={copy.garden.title}
          className="t-display t-xl mt-8 max-w-[15ch] text-paper"
          delay={0.15}
        />

        <Reveal delay={0.5} className="mt-8 max-w-[46ch]">
          <p className="t-body text-[clamp(0.9rem,2.4vw,1.05rem)]">{copy.garden.sub}</p>
        </Reveal>

        <Reveal delay={0.75} className="mt-12">
          {/* py/-my pair: a 48px touch target that occupies no extra layout
              space, so the composition is unchanged. */}
          <button
            onClick={scrollOn}
            className="group -my-3 inline-flex items-center gap-4 py-3 text-champagne"
            style={{ filter: 'drop-shadow(0 1px 5px rgba(5,3,8,0.95))' }}
          >
            <span className="font-sans text-[0.6875rem] uppercase tracking-[0.32em]">
              {copy.garden.cta}
            </span>
            <span className="relative block h-[1px] w-12 overflow-hidden bg-champagne/30">
              <motion.span
                className="absolute inset-0 origin-left bg-champagne"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            <motion.span
              aria-hidden="true"
              animate={reduced ? {} : { x: [0, 6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </button>
        </Reveal>
      </motion.div>
    </Chapter>
  );
}
