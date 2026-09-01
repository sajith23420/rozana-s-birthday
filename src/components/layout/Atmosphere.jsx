import { memo } from 'react';
import { RosePetals } from '../fx/RosePetals.jsx';

/* ══════════════════════════════════════════════════════════════════
   Fixed atmospheric plates: drifting rose petals, animated film
   grain and a cinematic vignette. Pure CSS throughout — zero JS cost
   per frame, nothing here ever repaints from script.

   The petals sit at --z-fx (1), beneath every chapter (--z-content,
   10); the grain and vignette stay on top at --z-grain (90). This is
   the project's one global decorative component, so the petals live
   here rather than in a parallel background system.
   ══════════════════════════════════════════════════════════════════ */

function AtmosphereBase() {
  return (
    <>
      {/* Behind all content — see components/fx/RosePetals.jsx */}
      <RosePetals />

      {/* Animated grain — shifts subtly so it never feels static */}
      <div
        className="pointer-events-none fixed inset-0 film-grain mix-blend-soft-light"
        style={{
          zIndex: 'var(--z-grain)',
          opacity: 0.18,
        }}
        aria-hidden="true"
      />

      {/* Cinematic vignette — darker falloff than before */}
      <div
        className="pointer-events-none fixed inset-0 cinematic-vignette"
        style={{
          zIndex: 'calc(var(--z-grain) - 1)',
        }}
        aria-hidden="true"
      />
    </>
  );
}

export const Atmosphere = memo(AtmosphereBase);
