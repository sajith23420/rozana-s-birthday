import { memo } from 'react';

/* ══════════════════════════════════════════════════════════════════
   Global rose-petal atmosphere.

   A purely decorative layer that drifts behind every chapter. It is
   deliberately dumb: no state, no effects, no timers, no rAF. Each
   petal is one <span> handed a few inline custom properties, and CSS
   does the rest — so this costs nothing per frame in JavaScript and
   never re-renders.

   The values below are hand-picked to look random rather than being
   generated, so the composition is identical on every device and
   across reloads, and nothing shifts between renders.

   Petal count is handled with Tailwind's responsive `hidden` rather
   than with JS: 9 on phones, 12 on tablets, 16 on desktop. Rendering
   the same markup everywhere keeps this free of media-query hooks.

   See `.rose-petal` in styles/keyframes.css for the shape and the
   four drift patterns.
   ══════════════════════════════════════════════════════════════════ */

/* anim  — which drift pattern (see keyframes.css)
   o     — peak opacity, kept inside 0.12-0.35
   vis   — responsive gate; the first nine are always on
   Negative delays start each petal mid-journey, so the screen is
   already populated on load instead of filling up over half a minute. */
const PETALS = [
  // ── always visible (phones and up - 4 total) ──────────────────────────────
  { id: 1,  left: '8%',  top: '-14%', w: 13, h: 17, o: 0.24, anim: 'petal-fall',  dur: '28s', delay: '-4s',  vis: '' },
  { id: 2,  left: '73%', top: '-16%', w: 10, h: 13, o: 0.18, anim: 'petal-fall',  dur: '33s', delay: '-19s', vis: '' },
  { id: 3,  left: '41%', top: '104%', w: 12, h: 16, o: 0.2,  anim: 'petal-rise',  dur: '31s', delay: '-11s', vis: '' },
  { id: 4,  left: '88%', top: '22%',  w: 9,  h: 12, o: 0.15, anim: 'petal-drift', dur: '24s', delay: '-7s',  vis: '' },

  // ── tablets and up (7 total) ───────────────────────────────────
  { id: 10, left: '4%',  top: '-18%', w: 12, h: 15, o: 0.21, anim: 'petal-fall',  dur: '32s', delay: '-27s', vis: 'hidden sm:block' },
  { id: 11, left: '48%', top: '15%',  w: 10, h: 13, o: 0.17, anim: 'petal-drift', dur: '26s', delay: '-6s',  vis: 'hidden sm:block' },
  { id: 12, left: '80%', top: '52%',  w: 16, h: 21, o: 0.14, anim: 'petal-hover', dur: '28s', delay: '-18s', vis: 'hidden sm:block' },

  // ── desktop (10 total) ──────────────────────────────────────────
  { id: 13, left: '26%', top: '-15%', w: 9,  h: 12, o: 0.23, anim: 'petal-fall',  dur: '35s', delay: '-2s',  vis: 'hidden lg:block' },
  { id: 14, left: '14%', top: '103%', w: 11, h: 15, o: 0.19, anim: 'petal-rise',  dur: '34s', delay: '-22s', vis: 'hidden lg:block' },
  { id: 15, left: '68%', top: '43%',  w: 13, h: 17, o: 0.15, anim: 'petal-drift', dur: '29s', delay: '-14s', vis: 'hidden lg:block' },
];

function RosePetalsBase() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-fx)' }}
      aria-hidden="true"
    >
      {PETALS.map((p) => (
        <span
          key={p.id}
          className={`rose-petal absolute ${p.vis} ${p.cls ?? ''}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            '--petal-o': p.o,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export const RosePetals = memo(RosePetalsBase);
