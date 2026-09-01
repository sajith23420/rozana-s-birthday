import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from '../ui/HeartIcon.jsx';
import { copy } from '../../content/copy.js';
import { site } from '../../content/site.config.js';
import { useAudio } from '../../hooks/audioContext.js';
import { EASE } from '../../lib/easing.js';

/* ══════════════════════════════════════════════════════════════════
   The masthead's chapter links, for screens narrower than `lg`.

   Chapter 01's <StoryNav> carries six links across the top on a wide
   screen. Below `lg` they do not fit — set end to end they run well
   past 320px — so the same six become a sheet: one trigger in the
   masthead, and a full-screen index in the palette the rest of the
   experience is drawn in.

   Nothing here is a second navigation system. The list is the same
   `copy.garden.nav`, the jump is the same `scrollIntoView` the rail
   and the masthead already use, and the song control is the same
   `toggle` from the audio provider — this is the desktop masthead,
   folded up.

   `lg:hidden` on both the trigger and the sheet, so the desktop
   masthead is untouched.
   ══════════════════════════════════════════════════════════════════ */

function MenuGlyph({ open }) {
  /* Two rules that cross into a close mark. One transform each. */
  return (
    <span className="relative block h-[9px] w-[18px]" aria-hidden="true">
      <motion.span
        className="absolute inset-x-0 top-0 block h-px bg-current"
        animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.45, ease: EASE.silk }}
      />
      <motion.span
        className="absolute inset-x-0 bottom-0 block h-px bg-current"
        animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.45, ease: EASE.silk }}
      />
    </span>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isPlaying, toggle } = useAudio();

  /* The sheet owns the screen while it is up. Same approach the
     entrance gate takes, so there is one way of doing this. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    /* Let the sheet start leaving before the page moves under it. */
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      180
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Chapters"
        aria-expanded={open}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-soft/35 text-champagne-light transition-colors duration-500 hover:border-rose-soft/70 lg:hidden"
        style={{ boxShadow: '0 0 18px -6px rgba(232,160,176,0.5)' }}
      >
        <MenuGlyph open={false} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 flex flex-col lg:hidden"
            style={{ zIndex: 'var(--z-dock)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE.silk }}
          >
            {/* The ground — the same burgundy-into-void the chapters
                are lit against, not a grey scrim. */}
            <div
              className="absolute inset-0"
              style={{
                /* Opaque, deliberately. Chapter 01's headline is ivory
                   on near-black, so even three percent of it read as a
                   ghost through the sheet. The warmth comes from the
                   burgundy above the base, not from letting the page
                   below show through. */
                background:
                  'radial-gradient(78% 52% at 50% 12%, rgba(88,21,42,0.7), transparent 72%),' +
                  'linear-gradient(to bottom, #0c0710, #050308)',
              }}
              aria-hidden="true"
            />

            <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-10 pt-6 sm:px-10">
              {/* ── Head: the wordmark, and the way out ────────── */}
              <div className="flex shrink-0 items-center justify-between gap-4">
                <span className="t-display text-[1.05rem] tracking-tight sm:text-[1.2rem]">
                  <span className="text-rose-soft">Rozana</span>{' '}
                  <span className="text-paper">Blosem</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-champagne/30 text-champagne"
                >
                  <MenuGlyph open />
                </button>
              </div>

              <span className="hairline mt-6 block w-full shrink-0" aria-hidden="true" />

              {/* ── The chapters ───────────────────────────────── */}
              <nav
                className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-6"
                aria-label={site.brand}
              >
                <ul className="flex flex-col">
                  {copy.garden.nav.map((item, i) => (
                    <motion.li
                      key={item.to}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.06 + i * 0.05, ease: EASE.silk }}
                    >
                      <button
                        type="button"
                        onClick={() => go(item.to)}
                        className="group flex min-h-[52px] w-full items-center gap-4 py-1 text-left"
                      >
                        <span className="t-numeral w-7 shrink-0 text-[0.7rem] text-champagne/50">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="t-display text-[clamp(1.5rem,7vw,2.1rem)] text-paper transition-colors duration-500 group-hover:text-rose-soft">
                          {item.label}
                        </span>
                        <span
                          className="ml-auto h-px w-6 shrink-0 bg-champagne/25 transition-all duration-500 group-hover:w-10 group-hover:bg-champagne/60"
                          aria-hidden="true"
                        />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* ── The song, and the heart ────────────────────── */}
              <div className="flex shrink-0 items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={toggle}
                  aria-pressed={isPlaying}
                  className="group relative inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-rose-soft/40 px-5 text-champagne-light transition-colors duration-500 hover:border-rose-soft/70"
                >
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ boxShadow: '0 0 18px -4px rgba(232,160,176,0.55)' }}
                    aria-hidden="true"
                  />
                  <span className="font-sans text-[0.625rem] uppercase tracking-[0.24em]">
                    {isPlaying ? 'Pause' : 'Play'} · {copy.garden.song}
                  </span>
                </button>

                <span className="text-rose-mist/85" aria-hidden="true">
                  <HeartIcon size={17} />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
