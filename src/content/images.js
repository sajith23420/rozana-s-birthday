/* ══════════════════════════════════════════════════════════════════
   ★ IMAGE CONFIGURATION — the only place images are declared.
   ══════════════════════════════════════════════════════════════════

   These are the eight real photographs of the Memory Film, in story
   order. `ratio` on each entry matches the file's true pixel
   dimensions, so nothing is cropped in the reel; `focus` is set
   anyway, from where the faces or subject actually sit in the frame,
   so a face survives if any layout ever does crop.

   TO SWAP A PHOTO LATER:

   1. Put the new file in  /public/images/
   2. Change `src` here, and `ratio` to match its real dimensions
      ('3/4' portrait · '4/3' landscape · '3/2' wide)
   3. Set `focus` (object-position) to wherever the subject sits

   Every consumer reads from this file. No component hardcodes a path.
   ══════════════════════════════════════════════════════════════════ */

import { site } from './site.config.js';

export const images = {
  /* 01 · 1086 × 1448 — face sits high and just left of centre */
  memory01: {
    src: '/images/memory-01.png',
    ratio: '3/4',
    focus: '50% 28%',
    alt: `${site.name} in a blush off-shoulder dress, standing among red roses and candles under warm string lights at night`,
    caption: 'A beautiful moment, just you.',
  },

  /* 02 · 1448 × 1086 — two faces across the upper middle */
  memory02: {
    src: '/images/memory-02.png',
    ratio: '4/3',
    focus: '50% 35%',
    alt: 'The two of us together at night, warm string lights blurred behind',
    caption: 'One of those nights I’ll always remember.',
  },

  /* 03 · 1536 × 1024 — the hands sit low and right of centre */
  memory03: {
    src: '/images/memory-03.png',
    ratio: '3/2',
    focus: '55% 62%',
    alt: 'Two hands held together on a lamp-lit garden path at night',
    caption: 'Just holding your hand was enough.',
  },

  /* 04 · 1086 × 1448 — face high, left of centre */
  memory04: {
    src: '/images/memory-04.png',
    ratio: '3/4',
    focus: '42% 26%',
    alt: `${site.name} in a red floral dress on a balcony at sunset, string lights strung behind`,
    caption: 'You looked beautiful without even trying.',
  },

  /* 05 · 1086 × 1448 — both faces in the upper third */
  memory05: {
    src: '/images/memory-05.png',
    ratio: '3/4',
    focus: '55% 32%',
    alt: 'The two of us on a wooden deck, looking at each other in warm afternoon light',
    caption: 'That look between us.',
  },

  /* 06 · 1448 × 1086 — she stands well left of centre */
  memory06: {
    src: '/images/memory-06.png',
    ratio: '4/3',
    focus: '34% 26%',
    alt: `${site.name} outdoors on a dirt path in a turquoise top and denim skirt, greenery behind her`,
    caption: 'Your little moments became my memories.',
  },

  /* 07 · 1086 × 1448 — two faces across the middle */
  memory07: {
    src: '/images/memory-07.png',
    ratio: '3/4',
    focus: '50% 38%',
    alt: 'The two of us on a wooden deck surrounded by sunlit greenery',
    caption: 'Everywhere feels better with you.',
  },

  /* 08 · 1448 × 1086 — two faces just above centre */
  memory08: {
    src: '/images/memory-08.png',
    ratio: '4/3',
    focus: '48% 35%',
    alt: 'The two of us close together at golden hour, pink petals in the air',
    caption: 'And somehow, my favourite memories became the ones with you. ❤️',
  },
};

/* Ordered reel for the Memory Film chapter — this is the story order. */
export const filmReel = [
  'memory01', 'memory02', 'memory03', 'memory04',
  'memory05', 'memory06', 'memory07', 'memory08',
].map((key) => ({ key, ...images[key] }));
