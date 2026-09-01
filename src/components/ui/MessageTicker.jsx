import { memo } from 'react';
import { HeartIcon } from './HeartIcon.jsx';

/* ══════════════════════════════════════════════════════════════════
   The bottom rule of Chapter 01 — the birthday messages, passing.

   Pure CSS: the list is rendered twice into one `w-max` track and
   `.ticker-track` translates that track by exactly half its own
   width, which lands copy two where copy one began. No timers, no
   rAF, no state, no measurement, no Framer Motion — the compositor
   owns the whole loop and React never re-renders it.

   Decorative and duplicated by definition, so it is hidden from the
   accessibility tree and takes no pointer events: it can never eat a
   click meant for the chapter beneath it.
   ══════════════════════════════════════════════════════════════════ */

function MessageTickerBase({ items, duration = 48 }) {
  const run = [...items, ...items];

  return (
    <div
      className="ticker-rule pointer-events-none w-full overflow-hidden py-2.5 sm:py-3"
      aria-hidden="true"
    >
      <div
        className="ticker-track flex w-max items-center"
        style={{ '--ticker-dur': `${duration}s` }}
      >
        {run.map((message, i) => (
          <div key={i} className="flex items-center">
            <span className="whitespace-nowrap font-sans text-[0.625rem] uppercase tracking-[0.22em] text-paper sm:text-[0.75rem] sm:tracking-[0.26em]">
              {message}
            </span>
            <span className="px-6 text-rose-soft/80 sm:px-10" aria-hidden="true">
              <HeartIcon size={12} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MessageTicker = memo(MessageTickerBase);
