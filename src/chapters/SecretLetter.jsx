import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '../components/layout/Chapter.jsx';
import { Eyebrow } from '../components/ui/Eyebrow.jsx';
import { PremiumButton } from '../components/ui/PremiumButton.jsx';
import { splitGlyphs } from '../lib/glyphs.jsx';
import { letter } from '../content/letter.js';
import { copy } from '../content/copy.js';
import { EASE } from '../lib/easing.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { seeded } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   06 — SECRET LETTER

   Phase 2: Floating dust around envelope, warm key light, deeper
   shadow with dynamic shift, enhanced paper texture, more cinematic
   flap opening and paper rise. Elegant serif typography.
   ══════════════════════════════════════════════════════════════════ */

/* Floating dust motes around the envelope. */
function EnvelopeDust({ active, seed = 77 }) {
  const reduced = useReducedMotion();
  const motes = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 20 + rand() * 60,
      y: 20 + rand() * 60,
      size: 1 + rand() * 2,
      dur: 10 + rand() * 16,
      delay: rand() * 8,
    }));
  }, [seed]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            background: 'rgba(240,223,192,0.5)',
          }}
          animate={{
            y: [0, -40, -80],
            opacity: [0, active ? 0.6 : 0.3, 0],
          }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function SecretLetter() {
  const [opened, setOpened] = useState(false);
  const reduced = useReducedMotion();

  return (
    <Chapter
      id="letter"
      className="overflow-hidden"
      backdrop={
        <>
          {/* Table + single overhead light — warm key light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(46% 40% at 50% 34%, rgba(217,190,142,0.18), transparent 68%),' +
                'radial-gradient(90% 60% at 50% 108%, rgba(43,10,20,0.9), transparent 70%)',
            }}
          />
          {/* Key light that responds to opening */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(35% 30% at 50% 30%, rgba(240,223,192,0.12), transparent 60%)',
            }}
            animate={{ opacity: opened ? 1.2 : 0.5 }}
            transition={{ duration: 1.5, ease: EASE.silk }}
          />
        </>
      }
    >
      <header className="relative flex flex-col items-center text-center">
        <Eyebrow align="center">{copy.letter.eyebrow}</Eyebrow>
      </header>

      <div className="relative mx-auto mt-12 flex w-full max-w-[640px] flex-col items-center">
        {/* ── The envelope ─────────────────────────────────── */}
        <motion.div
          className="relative w-full max-w-[440px]"
          style={{ perspective: 1400 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: EASE.silk }}
        >
          {/* Floating dust */}
          <EnvelopeDust active={!opened} />

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

          <div className="relative aspect-[1.62/1] w-full">
            {/* Body */}
            <div
              className="absolute inset-0 rounded-[3px] border border-champagne/20"
              style={{
                background: 'linear-gradient(158deg, #2b0a14 0%, #1a0710 55%, #12060c 100%)',
                boxShadow: 'inset 0 1px 0 rgba(240,223,192,0.08), 0 30px 70px -30px rgba(0,0,0,0.95)',
              }}
            />

            {/* The page, rising out from behind the envelope front */}
            <AnimatePresence>
              {opened && (
                <motion.div
                  className="absolute inset-x-[7%] bottom-[10%] top-[10%] rounded-[2px]"
                  style={{
                    background: 'linear-gradient(#efe6d8, #e3d7c4)',
                    transformOrigin: 'bottom center',
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
                background: 'linear-gradient(165deg, #3d0f1e 0%, #1a0710 100%)',
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
                  background: 'linear-gradient(180deg, #58152a 0%, #2b0a14 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  backfaceVisibility: 'hidden',
                  borderTop: '1px solid rgba(217,190,142,0.18)',
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
                      boxShadow: '0 6px 18px -4px rgba(0,0,0,0.8), inset 0 2px 6px rgba(243,211,218,0.25)',
                    }}
                  >
                    <span className="t-display text-xl italic text-rose-mist/85">
                      {letter.seal}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Trigger ──────────────────────────────────────── */}
        <AnimatePresence>
          {!opened && (
            <motion.div
              className="mt-14"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: EASE.silk }}
            >
              <PremiumButton onClick={() => setOpened(true)}>
                {copy.letter.cta}
              </PremiumButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── The letter itself ────────────────────────────── */}
        <AnimatePresence>
          {opened && (
            <motion.article
              className="relative mt-10 w-full rounded-[2px] px-7 py-12 sm:px-14 sm:py-16"
              style={{
                background: 'linear-gradient(#f2ebe0, #e6dbc9)',
                boxShadow: '0 50px 110px -40px rgba(0,0,0,0.95)',
              }}
              initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, delay: 1.2, ease: EASE.bloom }}
            >
              {/* Paper tooth — enhanced texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-multiply"
                style={{ backgroundImage: 'url(/images/texture-noise.svg)', backgroundSize: '200px' }}
                aria-hidden="true"
              />
              {/* Ruled left margin */}
              <div
                className="pointer-events-none absolute inset-y-8 left-5 w-[1px] bg-rose-deep/20 sm:left-9"
                aria-hidden="true"
              />

              <motion.h3
                className="relative t-display text-[clamp(1.6rem,5vw,2.5rem)] italic text-wine-800"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.7 }}
              >
                {letter.title}
              </motion.h3>

              <div className="relative mt-8 space-y-6">
                <LetterLine delay={2.0} className="t-display text-xl italic text-wine-700">
                  {letter.greeting}
                </LetterLine>

                {letter.paragraphs.map((p, i) => (
                  <LetterLine
                    key={i}
                    delay={2.2 + i * 0.25}
                    className="font-sans text-[0.95rem] font-light leading-[1.95] text-wine-900/80"
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
                className="relative mt-12 flex items-center gap-5"
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
