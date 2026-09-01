/* ══════════════════════════════════════════════════════════════════
   All chapter copy, kept out of the components.

   Names are interpolated from site.config.js rather than typed out, so
   `site.name` and `site.signature` are the only places they are defined.
   The wording itself is placeholder and is yours to rewrite.
   ══════════════════════════════════════════════════════════════════ */

import { site } from './site.config.js';

export const copy = {
  entrance: {
    lines: [
      'Some people enter our lives quietly\u2026',
      '\u2026and somehow make ordinary moments feel different.',
    ],
    welcome: `Welcome, ${site.name} \u{1F339}`,
    cta: 'Enter Your Little World',
    hint: 'Best with sound on',
  },
  garden: {
    eyebrow: 'Chapter 02 — Rose Garden',
    title: 'A little world\nmade for you.',
    sub: 'Because some people deserve more than an ordinary birthday wish.',
    cta: 'Wander a little',
  },
  starmap: {
    eyebrow: 'Chapter 03 — Star Map',
    title: 'Things I notice',
    sub: 'Nine of them. Touch one.',
    progress: (found, total) => `${found} of ${total} found`,
    complete: 'That is the shape of you, roughly.',
  },
  film: {
    eyebrow: 'Chapter 04 — Memory Film',
    title: 'Moments worth\nremembering',
    sub: 'Scroll through the reel.',
  },
  little: {
    eyebrow: 'Chapter 05 — Little Things',
    title: 'Things I notice\u2026',
    sub: 'Touch a thought to read it.',
  },
  letter: {
    eyebrow: 'Chapter 06 — Secret Letter',
    title: 'Something I wrote down',
    cta: 'Open the letter',
  },
  song: {
    eyebrow: 'Chapter 07 — The Song Room',
    title: 'One song.\nOne little feeling.',
    sub: 'Take the record off the shelf.',
  },
  reveal: {
    eyebrow: 'Chapter 08',
    prompt: 'One last thing\u2026',
    cta: 'Pick a rose',
    payoff: `Happy Birthday, ${site.name} \u{1F339}`,
  },
  final: {
    title: `Happy Birthday,\n${site.name} \u{1F339}`,
    wish: 'May this year bring you more beautiful moments,\nmore reasons to smile,\nand everything your heart quietly wishes for.',
    thanks: 'Thank you for being you.',
    signature: `\u2014 ${site.signature}`,
    replay: 'Play it again',
  },
};
