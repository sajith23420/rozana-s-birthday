import { memo } from 'react';
import { useAudio } from '../../hooks/audioContext.js';
import { HeartIcon } from '../ui/HeartIcon.jsx';
import { MobileNav } from './MobileNav.jsx';
import { copy } from '../../content/copy.js';
import { site } from '../../content/site.config.js';

/* ══════════════════════════════════════════════════════════════════
   Chapter 01's masthead.

   Deliberately local to the opening chapter rather than fixed to the
   window: it belongs to the title screen and scrolls away with it,
   which leaves the ChapterRail as the navigation for everything
   below — unchanged, and still the only thing on screen after the
   first viewport.

   Nothing here owns state. The song pill is a view onto the existing
   audio provider and calls the same `toggle` the Song Room does; the
   links reuse the same scrollIntoView the rail uses.

   `Home` is marked current unconditionally, and correctly so: this
   masthead only exists while Chapter 01 fills the screen.

   Below `lg` the six links do not fit across the top, so they fold
   into <MobileNav>'s sheet — the same list, the same jump, the same
   song control. Nothing at `lg` and above changes: the links, the
   pill and the heart render exactly as they always have.
   ══════════════════════════════════════════════════════════════════ */

/* A rose seen from above, reduced to two rings and a heart — the
   full <Rose> is a 30-petal SVG and far too much flower at 22px. */
function RoseMark({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#5c1226" />
      <circle cx="12" cy="12" r="7.2" fill="#a8425a" />
      <circle cx="12" cy="12" r="4.2" fill="#c8556e" />
      <path
        d="M12 14.4c-1.5-1.2-2.6-2-2.6-3.1 0-.8.6-1.3 1.3-1.3.5 0 .9.2 1.3.7.4-.5.8-.7 1.3-.7.7 0 1.3.5 1.3 1.3 0 1.1-1.1 1.9-2.6 3.1z"
        fill="#f3d3da"
      />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
      <path
        d="M9 18V5.5l10-2V16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.6" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.6" cy="16" r="2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function StoryNavBase() {
  const { isPlaying, toggle } = useAudio();

  const go = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <header className="relative flex w-full items-center justify-between gap-3 sm:gap-6">
      {/* ── Wordmark ─────────────────────────────────────────── */}
      <a
        href="#garden"
        className="group flex min-h-[44px] shrink-0 items-center gap-2.5"
        aria-label={site.brand}
      >
        <RoseMark className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12" />
        <span className="t-display text-[clamp(0.95rem,4vw,1.5rem)] tracking-tight sm:text-[clamp(1.1rem,2.2vw,1.5rem)]">
          <span className="text-rose-soft">Rozana</span>{' '}
          <span className="text-paper">Blosem</span>
        </span>
        <span className="hidden text-[0.6rem] text-champagne/60 sm:inline" aria-hidden="true">
          ✦
        </span>
      </a>

      {/* ── Chapter links — desktop only. Below lg the rail's
             progress bar is the navigation, exactly as before. ── */}
      <nav className="hidden items-center gap-5 lg:flex xl:gap-9" aria-label="Chapters">
        {copy.garden.nav.map((item, i) => {
          const current = i === 0;
          return (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              aria-current={current ? 'page' : undefined}
              className={`group relative whitespace-nowrap py-2 font-sans text-[0.625rem] uppercase tracking-[0.18em] transition-colors duration-500 xl:text-[0.6875rem] xl:tracking-[0.22em] ${
                current ? 'text-paper' : 'text-paper-dim/70 hover:text-paper'
              }`}
            >
              {item.label}
              {/* The active underline: a hairline plus a soft bloom
                  under it. Both are static — opacity is all that
                  changes on hover. */}
              <span
                className={`pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-center rounded-full bg-gradient-to-r from-transparent via-rose-soft to-transparent transition-opacity duration-500 ${
                  current ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                }`}
                style={{ boxShadow: '0 0 10px 1px rgba(232,160,176,0.65)' }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>

      {/* ── Song pill + heart ──────────────────────────────────
             The pill's label is what makes this group 158px wide,
             which is more than 320px has left once the wordmark and
             the menu are placed — so below `sm` the pill keeps the
             note and drops the words. Everything from `sm` up is the
             pill exactly as it was.

             The heart is the desktop flourish and stays there; below
             `lg` the menu takes its place in the row, and the heart
             reappears at the foot of the sheet. */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        <button
          onClick={toggle}
          aria-pressed={isPlaying}
          aria-label={copy.garden.song}
          className="group relative inline-flex h-11 min-h-[44px] w-11 items-center justify-center gap-2.5 rounded-full border border-rose-soft/40 px-0 text-champagne-light transition-colors duration-500 hover:border-rose-soft/70 sm:h-auto sm:min-h-[40px] sm:w-auto sm:px-6"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: '0 0 18px -4px rgba(232,160,176,0.55)' }}
            aria-hidden="true"
          />
          <NoteIcon />
          <span className="hidden font-sans text-[0.625rem] uppercase tracking-[0.24em] sm:inline sm:text-[0.6875rem]">
            {copy.garden.song}
          </span>
        </button>

        <MobileNav />

        <span className="hidden text-rose-mist/85 lg:block" aria-hidden="true">
          <HeartIcon size={17} />
        </span>
      </div>
    </header>
  );
}

export const StoryNav = memo(StoryNavBase);
