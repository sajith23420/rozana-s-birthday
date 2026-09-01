import { memo } from 'react';
import { motion } from 'framer-motion';
import { chapters } from '../../content/site.config.js';
import { useActiveChapter } from '../../hooks/useActiveChapter.js';

const IDS = chapters.map((c) => c.id);

/* ══════════════════════════════════════════════════════════════════
   Chapter rail — replaces the idea of a navigation bar entirely.

   Desktop: a vertical index on the right; the active chapter's label
   slides out. Mobile: a slim progress bar pinned to the very top,
   which costs no screen real estate at all.
   ══════════════════════════════════════════════════════════════════ */

function ChapterRailBase() {
  const active = useActiveChapter(IDS);
  const activeIndex = Math.max(0, IDS.indexOf(active));

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ── Mobile: hairline progress ───────────────────────── */}
      <div
        className="fixed inset-x-0 top-0 h-[2px] bg-paper/5 lg:hidden"
        style={{ zIndex: 'var(--z-rail)' }}
        aria-hidden="true"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-rose-deep via-rose to-champagne"
          animate={{ scaleX: (activeIndex + 1) / chapters.length }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      {/* ── Desktop: vertical index ──────────────────────────── */}
      <nav
        className="fixed right-8 top-1/2 hidden -translate-y-1/2 lg:block"
        style={{ zIndex: 'var(--z-rail)' }}
        aria-label="Chapters"
      >
        <ul className="flex flex-col items-end gap-5">
          {chapters.map((c) => {
            const isActive = c.id === active;
            return (
              <li key={c.id}>
                <button
                  onClick={() => go(c.id)}
                  className="group -my-[7px] flex items-center gap-4 py-[7px]"
                  aria-current={isActive ? 'true' : undefined}
                >
                  <motion.span
                    className="whitespace-nowrap font-sans text-[9px] uppercase tracking-[0.3em]"
                    style={{ textShadow: '0 1px 5px rgba(5,3,8,0.95), 0 0 12px rgba(5,3,8,0.7)' }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : 8,
                      color: isActive ? '#d9be8e' : '#6f6862',
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {c.label}
                  </motion.span>
                  <span className="relative flex h-[1px] w-8 items-center justify-end">
                    <motion.span
                      className="absolute right-0 h-[1px] bg-current"
                      style={{ boxShadow: '0 0 6px rgba(5,3,8,0.9)' }}
                      animate={{
                        width: isActive ? 32 : 12,
                        backgroundColor: isActive ? '#d9be8e' : '#3a3238',
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export const ChapterRail = memo(ChapterRailBase);
