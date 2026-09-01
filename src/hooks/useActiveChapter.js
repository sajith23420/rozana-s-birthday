import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════════════════
   Which chapter owns the viewport right now. Drives the progress
   rail. One observer for all sections — no scroll listener.

   Later chapters are code-split, so several of these ids simply do
   not exist in the DOM on first run. A MutationObserver re-attaches
   as each lazy chapter arrives; without it the rail would latch onto
   whichever chapter happened to be mounted at startup and never move
   again.
   ══════════════════════════════════════════════════════════════════ */
export function useActiveChapter(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let io = null;
    let attachedCount = -1;

    const attach = () => {
      const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
      if (nodes.length === attachedCount) return;
      attachedCount = nodes.length;

      io?.disconnect();
      if (!nodes.length) return;

      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActive(visible.target.id);
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
      );
      nodes.forEach((n) => io.observe(n));
    };

    attach();

    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [ids]);

  return active;
}
