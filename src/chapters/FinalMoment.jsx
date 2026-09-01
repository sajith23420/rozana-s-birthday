import { motion } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { SplitText } from '../components/ui/SplitText.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { Rose } from '../components/fx/Rose.jsx';
import { PetalFall } from '../components/fx/PetalFall.jsx';
import { ParticleField } from '../components/fx/ParticleField.jsx';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

/* ══════════════════════════════════════════════════════════════════
   09 — FINAL BIRTHDAY MOMENT

   The whole composition - rose, headline, wish, thanks, signature and
   the way back - has to land inside one screen. It previously ran to
   1200px against a 900px viewport, which left the signature and the
   replay button permanently below the fold: the emotional climax was
   cut in half.

   The fix is rhythm, not shrinkage. Every gap is a viewport-height
   clamp rather than a fixed margin, the headline takes the smaller of
   a width and a height measure (see `.t-final`), and the chapter opts
   out of the shell's fixed 96-112px vertical padding so it can own its
   own breathing room. Nothing is simply made smaller - the spacing now
   scales with the room actually available.
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

        <SplitText
          as="h2"
          text={copy.final.title}
          className="t-display-hero t-final text-paper"
          lineClassName="text-sheen"
          delay={0.3}
          stagger={0.18}
        />

        <motion.span
          className="hairline block w-36"
          style={{ marginTop: 'clamp(0.25rem, 1.4svh, 0.9rem)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.9, ease: EASE.silk }}
        />

        <Reveal
          delay={1.2}
          className="max-w-[44ch]"
          style={{ marginTop: 'clamp(0.25rem, 1.4svh, 0.9rem)' }}
        >
          <p className="t-body whitespace-pre-line text-[clamp(0.86rem,2.2vw,1.02rem)] leading-[1.7]">
            {copy.final.wish}
          </p>
        </Reveal>

        <Reveal delay={1.7} style={{ marginTop: 'clamp(0.2rem, 1svh, 0.7rem)' }}>
          <p className="t-display text-[clamp(1.2rem,min(4.2vw,3.4svh),1.95rem)] italic text-rose-soft">
            {copy.final.thanks}
          </p>
        </Reveal>

        <Reveal delay={2.1}>
          <p className="t-display text-lg italic text-champagne/85 sm:text-xl">
            {copy.final.signature}
          </p>
        </Reveal>

        <Reveal delay={2.6} style={{ marginTop: 'clamp(0.5rem, 2.4svh, 1.6rem)' }}>
          <PremiumButton variant="ghost" onClick={onReplay}>
            {copy.final.replay}
          </PremiumButton>
        </Reveal>
      </div>
    </Chapter>
  );
}
