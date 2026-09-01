import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   Chapter shell.

   Full viewport height in svh — so mobile browser chrome can never
   clip the climax of a section — with consistent gutters and a
   content column that stops at a comfortable measure.

   Three slots, because atmosphere and content need different widths:

     backdrop    full-bleed, behind everything
     children    the measured content column
     foreground  full-bleed, in front of the content

   Without this split, an `absolute inset-0` background placed among
   the children would be clipped to the 1240px column and stop short
   of the screen edges on a wide display.
   ══════════════════════════════════════════════════════════════════ */

export const Chapter = forwardRef(function Chapter(
  {
    id,
    children,
    backdrop = null,
    foreground = null,
    className = '',
    innerClassName = '',
    full = false,
    padY = true,
    ...rest
  },
  ref
) {
  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'relative w-full',
        !full && 'min-h-[100svh] flex flex-col justify-center',
        'px-6 sm:px-10 lg:px-16',
        /* Set padY={false} when a chapter must compose inside a single
           viewport and needs to own its own vertical rhythm. Tailwind
           conflict resolution is source-order based, so an override class
           cannot be relied on here — the class simply must not be emitted. */
        padY && 'py-24 sm:py-28',
        className
      )}
      style={{ zIndex: 'var(--z-content)' }}
      {...rest}
    >
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {backdrop}
        </div>
      )}

      <div className={cn('relative z-10 mx-auto w-full max-w-[1240px]', innerClassName)}>
        {children}
      </div>

      {foreground && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
          {foreground}
        </div>
      )}
    </section>
  );
});
