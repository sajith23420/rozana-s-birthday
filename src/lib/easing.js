/* Shared motion vocabulary. Every chapter borrows from this list so
   the whole experience moves like one object. */

export const EASE = {
  silk: [0.22, 1, 0.36, 1],
  veil: [0.65, 0, 0.35, 1],
  bloom: [0.16, 1, 0.3, 1],
};

export const reveal = {
  hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1.1, ease: EASE.silk },
  },
};

export const revealStatic = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.12) => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});
