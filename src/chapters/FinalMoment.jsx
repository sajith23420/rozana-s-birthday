import { motion } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { PetalFall } from '../components/fx/PetalFall.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

/* ══════════════════════════════════════════════════════════════════
   09 — THE CLOSING FRAME

   This chapter used to open with its own "Happy Birthday" headline
   and wish. Chapter 08's finale now carries that message in full, and
   two birthday greetings one screen apart read as a mistake rather
   than as an ending — so what is left here is the last page rather
   than a second climax: a rose, the signature, and the way back.

   The rhythm is unchanged. Every gap is a viewport-height clamp
   rather than a fixed margin and the chapter opts out of the shell's
   fixed vertical padding, so the composition lands inside one screen
   at any aspect ratio.
   ══════════════════════════════════════════════════════════════════ */

export function FinalMoment({ onReplay }) {
  /* The rose is a fixed-size SVG, so it steps rather than scales. Two
     sizes are enough: generous where there is height, restrained where
     there is not. */
  const tall = useMediaQuery('(min-height: 820px)');
  const roseSize = tall ? 104 : 78;

  return (
    <Chapter
      id="final"
      padY={false}
      className="overflow-hidden"
      backdrop={
        <>
          {/* Warm, restrained atmosphere */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 50% at 50% 42%, rgba(88,21,42,0.5), transparent 72%),' +
                'radial-gradient(100% 70% at 50% 110%, rgba(26,7,16,0.9), transparent 68%)',
            }}
          />
          {/* Fewer particles — calm, not celebratory */}
          <ParticleField count={45} intensity={0.9} color="240, 223, 192" speed={0.6} seed={151} />
          <PetalFall count={12} active speed={0.5} seed={157} />
        </>
      }
    >
      {/* One flow, one rhythm. `gap` carries the vertical spacing so the
          stack compresses evenly on a short screen, rather than a single
          fixed margin pushing the ending past the fold. */}
      <div
        className="relative flex min-h-[100svh] flex-col items-center justify-center text-center"
        style={{
          gap: 'clamp(0.7rem, 2.2svh, 1.7rem)',
          paddingTop: 'clamp(1.25rem, 4svh, 2.75rem)',
          paddingBottom: 'clamp(1.25rem, 4svh, 2.75rem)',
        }}
      >
        <Reveal delay={0} y={0} blur={16}>
          <Rose bloom={1} size={roseSize} seed={163} />
        </Reveal>

        <motion.span
          className="hairline block w-36"
          style={{ marginTop: 'clamp(0.25rem, 1.4svh, 0.9rem)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4, ease: EASE.silk }}
        />

        <Reveal delay={0.8}>
          <p className="t-display text-lg italic text-champagne/85 sm:text-xl">
            {copy.final.signature}
          </p>
        </Reveal>

        <Reveal delay={1.3} style={{ marginTop: 'clamp(0.5rem, 2.4svh, 1.6rem)' }}>
          <PremiumButton variant="ghost" onClick={onReplay}>
            {copy.final.replay}
          </PremiumButton>
        </Reveal>
      </div>
    </Chapter>
  );
}
