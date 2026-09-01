import { motion } from 'framer-motion';
import { EASE } from '../../lib/easing.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/* Scroll-reveal primitive. Blur + rise, once. Under reduced motion
   it becomes a plain fade so nothing is lost, only stilled. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  blur = 10,
  duration = 1.05,
  once = true,
  amount = 0.35,
  as = 'div',
  className = '',
  ...rest
}) {
  const reduced = useReducedMotion();
  const M = motion[as] ?? motion.div;

  return (
    <M
      className={className}
      initial={reduced
        ? { opacity: 0 }
        : { opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={reduced
        ? { opacity: 1 }
        : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: reduced ? 0.4 : duration, delay, ease: EASE.silk }}
      {...rest}
    >
      {children}
    </M>
  );
}
