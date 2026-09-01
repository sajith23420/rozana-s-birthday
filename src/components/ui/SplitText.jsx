import { motion } from 'framer-motion';
import { EASE } from '../../lib/easing.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { splitGlyphs } from '../../lib/glyphs.jsx';

/* ══════════════════════════════════════════════════════════════════
   Masked line reveal — each line rises from behind a clip edge.
   Newlines in `text` become separate lines. Every display headline
   in the experience uses this, so they all enter identically.

   The viewport check lives on the heading, never on the lines.
   A line starts translated fully below its own `overflow-hidden`
   parent, so an observer attached to the line would measure zero
   intersection, never fire, and leave the headline invisible for
   good. Parent-driven variants avoid that deadlock entirely.
   ══════════════════════════════════════════════════════════════════ */

export function SplitText({
  text,
  className = '',
  lineClassName = '',
  accent = null,
  accentClassName = '',
  delay = 0,
  stagger = 0.14,
  duration = 1.15,
  once = true,
  as = 'h2',
}) {
  const reduced = useReducedMotion();
  const lines = String(text).split('\n');
  const Tag = motion[as] ?? motion.h2;

  /* `lineClassName` may be a function of the line index, so a headline
     can colour its lines differently without being split into several
     SplitTexts — which would break the shared stagger. */
  const lineClass = typeof lineClassName === 'function'
    ? lineClassName
    : () => lineClassName;

  /* An optional accent: one substring of one line, given its own
     class. Off by default, so every headline that does not ask for
     one renders exactly as before. */
  const renderLine = (line) => {
    const at = accent ? line.indexOf(accent) : -1;
    if (at < 0) return splitGlyphs(line);
    return (
      <>
        {splitGlyphs(line.slice(0, at))}
        <span className={accentClassName}>{splitGlyphs(accent)}</span>
        {splitGlyphs(line.slice(at + accent.length))}
      </>
    );
  };

  const lineVariants = {
    hidden: reduced ? { opacity: 0 } : { y: '108%', opacity: 0 },
    show: (i) => ({
      ...(reduced ? { opacity: 1 } : { y: '0%', opacity: 1 }),
      transition: {
        duration: reduced ? 0.4 : duration,
        delay: delay + i * stagger,
        ease: EASE.silk,
      },
    }),
  };

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className={`block ${lineClass(i)}`}
            variants={lineVariants}
            custom={i}
          >
            {renderLine(line)}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
