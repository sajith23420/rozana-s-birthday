import { memo } from 'react';
import { copy } from '../../content/copy.js';
import { splitGlyphs } from '../../lib/glyphs.jsx';
import { seeded } from '../../lib/utils.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/* ══════════════════════════════════════════════════════════════════
   Chapter 08 — the birthday celebration.

   Picking the rose throws a shower of small petals across the whole
   viewport. They start around the rose, spread outward in every
   direction, and are gone inside five seconds — at which point the
   parent takes them out of the DOM and what is left is a still frame:
   warm centre light, dark cinematic edges, and the birthday message.

   Nothing here loops. The global RosePetals drift is the project's
   one continuous petal animation and this does not add a second; it
   borrows that component's approach instead — plain <span>s handed a
   few inline custom properties, with CSS owning every movement. No
   canvas, no rAF, no timers, no re-renders, nothing installed.

   36 petals and twelve sparks, each one compositor-only element
   animating `transform` and `opacity`. The richness is meant to come
   from variety — four silhouettes, five tones, three trajectories,
   and a different size, spin, speed and delay on every piece —
   rather than from count.

   Layout safety: `fixed inset-0`, `overflow-hidden`,
   `pointer-events-none`. It cannot add document height, widen the
   page, or intercept a click.
   ══════════════════════════════════════════════════════════════════ */

const PETAL_COUNT = 36;

/* Trajectories: the base crosses in a straight line, `arc` curves,
   `toss` is thrown up and then falls back past the bottom. */
const TOSS = ' celebration-petal--toss';
const ARC = ' celebration-petal--arc';

/* Silhouettes: the curved rose petal shared with RosePetals, plus an
   oval, a pointed leaf and an irregular chip. */
const SHAPES = ['', ' celebration-petal--oval', ' celebration-petal--leaf', ' celebration-petal--chip'];

/* Tones, weighted: mostly rose and burgundy, a little green among the
   leaves, a few gold pieces. The empty string is the dusty pink base
   already on `.celebration-petal`. */
const TONES = [
  '', '', '', '',
  ' celebration-petal--red', ' celebration-petal--red',
  ' celebration-petal--wine', ' celebration-petal--wine',
  ' celebration-petal--leafy',
  ' celebration-petal--gilt',
];

/* Built once, at module load, from a fixed seed — the same trick the
   canvas fields use — so the shower is identical on every device,
   every render and every replay, and costs nothing per frame. Fifty
   plain objects, computed one time. */
const BURST_PETALS = (() => {
  const rand = seeded(9173);

  return Array.from({ length: PETAL_COUNT }, (_, id) => {
    /* Every heading is used: left, right, up, down, and every
       diagonal in between. */
    const angle = rand() * Math.PI * 2;
    const reach = 16 + rand() * 46;

    /* Depth, biased small: most petals are 4-9px and faint, only the
       nearest few come past 12px. */
    const depth = rand() ** 1.9;
    const size = Math.round(4 + depth * 12);

    /* A third are thrown up and land below the frame. */
    const toss = rand() < 0.34;
    const pattern = toss ? TOSS : rand() < 0.5 ? ARC : '';

    const tone = TONES[Math.floor(rand() * TONES.length)];
    /* Green only reads as foliage, so it always takes the leaf
       silhouette; every other tone draws its shape freely. */
    const shape =
      tone === ' celebration-petal--leafy'
        ? ' celebration-petal--leaf'
        : SHAPES[Math.floor(rand() * SHAPES.length)];

    return {
      id,
      /* Origin: the interaction area, loosely scattered around it. */
      left: `${(46 + rand() * 8).toFixed(1)}%`,
      top: `${(52 + rand() * 10).toFixed(1)}%`,
      w: size,
      h: Math.round(size * (1.05 + rand() * 0.35)),
      x: `${(Math.cos(angle) * reach).toFixed(1)}vw`,
      y: toss
        ? `${(24 + rand() * 46).toFixed(1)}vh`
        : `${(Math.sin(angle) * reach).toFixed(1)}vh`,
      r: `${(rand() < 0.5 ? -1 : 1) * Math.round(150 + rand() * 260)}deg`,
      o: +(0.18 + depth * 0.5).toFixed(2),
      dur: `${(2.1 + rand() * 1.5).toFixed(2)}s`,
      delay: `${(0.05 + rand() * 1.15).toFixed(2)}s`,
      /* Depth of field on the few furthest pieces only. A static
         blur, set once — never animated. */
      blur: depth < 0.12 && rand() < 0.5,
      cls: pattern + shape + tone,
    };
  });
})();

/* Twelve gold sparks, spread across the frame but kept clear of the
   middle band where the message lands. */
const BURST_SPARKS = [
  { id: 1,  left: '12%', top: '26%', s: 4, o: 0.85, x: '1.5vw',  y: '-5vh', dur: '1.6s', delay: '0.42s' },
  { id: 2,  left: '26%', top: '16%', s: 3, o: 0.7,  x: '-1vw',   y: '-6vh', dur: '1.8s', delay: '0.62s' },
  { id: 3,  left: '38%', top: '30%', s: 5, o: 0.8,  x: '2vw',    y: '-4vh', dur: '1.7s', delay: '0.9s'  },
  { id: 4,  left: '62%', top: '22%', s: 4, o: 0.75, x: '-1.5vw', y: '-7vh', dur: '1.9s', delay: '0.54s' },
  { id: 5,  left: '76%', top: '32%', s: 3, o: 0.65, x: '1vw',    y: '-5vh', dur: '1.6s', delay: '1.02s' },
  { id: 6,  left: '88%', top: '20%', s: 4, o: 0.72, x: '-2vw',   y: '-4vh', dur: '1.8s', delay: '0.78s' },
  { id: 7,  left: '8%',  top: '70%', s: 5, o: 0.78, x: '2vw',    y: '-8vh', dur: '2s',   delay: '1.14s' },
  { id: 8,  left: '22%', top: '82%', s: 3, o: 0.6,  x: '1vw',    y: '-6vh', dur: '1.7s', delay: '1.34s' },
  { id: 9,  left: '44%', top: '88%', s: 4, o: 0.7,  x: '-1.5vw', y: '-7vh', dur: '1.9s', delay: '1.5s'  },
  { id: 10, left: '68%', top: '78%', s: 4, o: 0.74, x: '1.5vw',  y: '-6vh', dur: '1.8s', delay: '1.22s' },
  { id: 11, left: '84%', top: '68%', s: 3, o: 0.62, x: '-1vw',   y: '-5vh', dur: '1.7s', delay: '1.44s' },
  { id: 12, left: '94%', top: '84%', s: 4, o: 0.66, x: '-2vw',   y: '-6vh', dur: '2s',   delay: '1.6s'  },
];

/* The message stack. Each line rises once, then stays. */
const LINE_DELAYS = { title: '1.1s', wish: '2s', thanks: '2.8s', signature: '3.4s' };

function RoseCelebrationBase({ visible = true, burst = true }) {
  const reduced = useReducedMotion();

  /* Reduced motion keeps the finale — the light, the darkness at the
     edges and the whole message — and simply drops everything that
     travels. The plates carry an inline opacity so they still land at
     their resting level once the global reduced-motion rule has
     switched their animations off. */
  const plate = (restingOpacity, animClass, style) =>
    reduced
      ? { className: '', style: { ...style, opacity: restingOpacity } }
      : { className: animClass, style: { ...style, '--fade-to': restingOpacity } };

  const veil = plate(1, 'celebration-fade-in', {
    animationDuration: '1.8s',
    animationDelay: '0.15s',
  });
  const bloom = plate(0.62, 'celebration-bloom', {
    animationDuration: '3.6s',
    animationDelay: '0.1s',
  });

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: 'var(--z-celebration)',
        /* The finale is anchored to its chapter: it fades away when
           she scrolls on to Chapter 09 and returns if she comes back.
           Opacity only, and the parent stops rendering it entirely
           once the fade is done. */
        opacity: visible ? 1 : 0,
        /* Hidden once the fade is done, so the resting petals stop
           being composited while she is somewhere else. */
        visibility: visible ? 'visible' : 'hidden',
        transition: visible
          ? 'opacity 900ms var(--ease-veil)'
          : 'opacity 900ms var(--ease-veil), visibility 0s linear 900ms',
      }}
    >
      {/* ── The world transforms: warm centre, dark cinematic edges ── */}
      <div
        className={`absolute inset-0 ${veil.className}`}
        style={{
          ...veil.style,
          background:
            'radial-gradient(58% 46% at 50% 52%, rgba(88,21,42,0.34), rgba(26,7,16,0.66) 62%, rgba(5,3,8,0.9) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── The rose light, spreading and then resting ────────────── */}
      <div
        className={`absolute inset-[-25%] ${bloom.className}`}
        style={{
          ...bloom.style,
          background:
            'radial-gradient(closest-side, rgba(200,85,110,0.3), rgba(168,66,90,0.17) 42%, rgba(217,190,142,0.09) 62%, transparent 76%)',
        }}
        aria-hidden="true"
      />

      {/* ── The shower: runs once, then leaves the DOM for good ──── */}
      {!reduced && burst && (
        <div className="absolute inset-0" aria-hidden="true">
          {BURST_PETALS.map((p) => (
            <span
              key={p.id}
              className={`celebration-petal${p.cls}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.w,
                height: p.h,
                '--pt-x': p.x,
                '--pt-y': p.y,
                '--pt-r': p.r,
                '--pt-o': p.o,
                animationDuration: p.dur,
                animationDelay: p.delay,
                filter: p.blur ? 'blur(1px)' : undefined,
              }}
            />
          ))}

          {BURST_SPARKS.map((s) => (
            <span
              key={s.id}
              className="celebration-spark"
              style={{
                left: s.left,
                top: s.top,
                width: s.s,
                height: s.s,
                '--sp-x': s.x,
                '--sp-y': s.y,
                '--sp-o': s.o,
                animationDuration: s.dur,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* ── The message ───────────────────────────────────────────
          One centred column with generous air. Every size is the
          smaller of a width and a height measure — the same trick
          `.t-final` uses in Chapter 09 — so the whole stack lands
          inside one screen at 320px and at 1440px alike, and never
          needs to scroll. */}
      <div className="absolute inset-0 flex items-center justify-center px-6 py-[clamp(1rem,5svh,3rem)]">
        {/* On a wide screen the photograph is in the right column and
            the message lands on dark ground. Below `lg` the chapter is
            a stack, so the photograph is exactly what the message sits
            on — sunlit greenery under ivory serif. A plate of the same
            centre-warm, edge-dark light the veil above already uses
            gives it back its ground, without touching the desktop
            composition. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(78svh,44rem)] -translate-y-1/2 lg:hidden"
          style={{
            background:
              'radial-gradient(72% 50% at 50% 50%, rgba(12,5,12,0.9), rgba(12,5,12,0.72) 58%, transparent 82%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative flex w-full max-w-[34rem] flex-col items-center text-center sm:max-w-[40rem]"
          style={{ gap: 'clamp(0.65rem, 2.2svh, 1.6rem)' }}
        >
          <h2
            className={`t-display-hero leading-[1.04] text-parchment ${reduced ? '' : 'celebration-line'}`}
            style={{
              fontSize: 'clamp(1.85rem, min(7.4vw, 6.4svh), 4.5rem)',
              ...(reduced ? {} : { animationDuration: '1.5s', animationDelay: LINE_DELAYS.title }),
            }}
          >
            {splitGlyphs(copy.reveal.celebration)}
          </h2>

          <span
            className={`hairline block w-32 sm:w-44 ${reduced ? '' : 'celebration-line'}`}
            style={reduced ? undefined : { animationDuration: '1.4s', animationDelay: LINE_DELAYS.wish }}
            aria-hidden="true"
          />

          <p
            className={`t-body max-w-[42ch] whitespace-pre-line leading-[1.75] ${
              reduced ? '' : 'celebration-line'
            }`}
            style={{
              fontSize: 'clamp(0.78rem, min(2.2vw, 1.9svh), 1rem)',
              ...(reduced ? {} : { animationDuration: '1.6s', animationDelay: LINE_DELAYS.wish }),
            }}
          >
            {copy.reveal.celebrationWish}
          </p>

          <p
            className={`t-display italic text-rose-soft ${reduced ? '' : 'celebration-line'}`}
            style={{
              fontSize: 'clamp(1.05rem, min(4vw, 3svh), 1.85rem)',
              ...(reduced ? {} : { animationDuration: '1.6s', animationDelay: LINE_DELAYS.thanks }),
            }}
          >
            {copy.reveal.celebrationThanks}
          </p>

          <p
            className={`t-display italic text-champagne/85 ${reduced ? '' : 'celebration-line'}`}
            style={{
              fontSize: 'clamp(0.9rem, min(3vw, 2.4svh), 1.2rem)',
              ...(reduced ? {} : { animationDuration: '1.6s', animationDelay: LINE_DELAYS.signature }),
            }}
          >
            {copy.reveal.celebrationSignature}
          </p>
        </div>
      </div>
    </div>
  );
}

export const RoseCelebration = memo(RoseCelebrationBase);
