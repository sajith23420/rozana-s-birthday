import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';
import { useIsTouch } from '../../hooks/useMediaQuery.js';

/* ══════════════════════════════════════════════════════════════════
   The one button style in the experience.

   Phase 2: Magnetic movement on desktop — the button drifts toward
   the cursor within proximity. Soft outer glow strengthened. Spring
   physics on release. Disabled on touch.
   ══════════════════════════════════════════════════════════════════ */

export function PremiumButton({
  children,
  onClick,
  variant = 'outline',
  size = 'md',
  className = '',
  ...rest
}) {
  const isTouch = useIsTouch();
  const ref = useRef(null);

  /* Magnetic pull — the button drifts toward the pointer. */
  const onMove = useCallback((e) => {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.18;
    const dy = (e.clientY - cy) * 0.18;
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }, [isTouch]);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  const sizes = {
    md: 'min-h-[48px] px-8 text-[0.6875rem]',
    lg: 'min-h-[56px] px-10 sm:px-14 text-[0.75rem]',
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full',
        'font-sans font-medium uppercase tracking-[0.3em]',
        'transition-[transform] duration-300 ease-out',
        sizes[size],
        variant === 'outline' &&
          'border border-champagne/35 text-champagne hover:text-void',
        variant === 'solid' &&
          'border border-transparent bg-champagne text-void',
        variant === 'ghost' &&
          'border border-paper/15 text-paper-dim hover:text-paper',
        /* Chapter 01's masthead palette: a rose hairline rather than
           a champagne one, and no fill — the glow does the work. */
        variant === 'rose' &&
          'border border-rose-soft/45 text-rose-mist hover:border-rose-soft/80 hover:text-paper',
        className
      )}
      {...rest}
    >
      {/* Centre-out fill */}
      {variant === 'outline' && (
        <span
          className="absolute inset-0 origin-center scale-x-0 bg-champagne transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-active:scale-x-100"
          aria-hidden="true"
        />
      )}
      {/* Soft outer glow. Every variant lifts it on hover; the rose
          one is already faintly lit at rest. */}
      <span
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 group-hover:opacity-100',
          variant === 'rose' ? 'opacity-55' : 'opacity-0'
        )}
        style={{
          boxShadow: variant === 'rose'
            ? '0 0 34px -4px rgba(232, 160, 176, 0.65)'
            : '0 0 40px -4px rgba(217, 190, 142, 0.6)',
        }}
        aria-hidden="true"
      />
      <span className="relative z-10 whitespace-nowrap">{children}</span>
    </motion.button>
  );
}
