import { motion } from 'framer-motion';
import { EASE } from '../../lib/easing.js';

/* Eyebrow + a hairline that draws itself. The signature mark that
   opens every chapter. */
export function Eyebrow({ children, align = 'left', className = '' }) {
  const origin = align === 'center' ? 'center' : 'left';

  return (
    <div className={`flex flex-col gap-3 ${align === 'center' ? 'items-center' : 'items-start'} ${className}`}>
      <motion.span
        className="t-eyebrow"
        initial={{ opacity: 0, letterSpacing: '0.85em' }}
        whileInView={{ opacity: 1, letterSpacing: '0.42em' }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: EASE.silk }}
      >
        {children}
      </motion.span>
      <motion.span
        className="hairline block w-24"
        style={{ transformOrigin: origin }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, delay: 0.15, ease: EASE.silk }}
      />
    </div>
  );
}
