/* ══════════════════════════════════════════════════════════════════
   All chapter copy, kept out of the components.

   Names are interpolated from site.config.js rather than typed out, so
   `site.name` and `site.signature` are the only places they are defined.
   `site.name` is the nickname and carries the light, everyday lines;
   `site.fullName` is used where the writing turns intimate — the two
   birthday climaxes.
   The wording itself is placeholder and is yours to rewrite.
   ══════════════════════════════════════════════════════════════════ */

import { site } from './site.config.js';

export const copy = {
  entrance: {
    lines: [
      'Some people enter our lives quietly\u2026',
      '\u2026and somehow make ordinary moments feel different.',
    ],
    welcome: 'A Magical Surprise\u2026',
    cta: 'Open Your Surprise  \u2764\uFE0F',
    hint: 'Crafted with love   \u00B7   Just for you',
  },
  garden: {
    eyebrow: 'Chapter 01 — Our Beginning',
    title: 'A little world\nmade for you.',
    /* The one word the headline colours. Matched as a substring of
       whichever line contains it — see SplitText's `accent` prop. */
    titleAccent: 'you.',
    /* The handwritten line, set in the script face. */
    script: `Happy Birthday ${site.pet}\u2661`,
    sub: 'Because some people deserve more than an ordinary birthday wish.',
    cta: 'Enter Our World',
    scroll: 'Scroll to begin our story',
    /* The masthead. Labels are display text; `to` is the chapter the
       item scrolls to. The rail still reaches every chapter — these
       six are the ones the masthead names. */
    nav: [
      { label: 'Home', to: 'garden' },
      { label: 'Journey', to: 'film' },
      { label: 'Universe', to: 'starmap' },
      { label: 'Moments', to: 'little' },
      { label: 'Letter', to: 'letter' },
      { label: 'Why You', to: 'reveal' },
    ],
    song: 'Our Song',
    /* Repeated, in order, along the bottom rule. */
    ticker: [
      `Happy Birthday ${site.pet}`,
      'You mean the world to me',
      `Happy Birthday ${site.pet}`,
      'Forever & always',
    ],
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
    chapter: 'Chapter 04',
    label: 'Memory Film',
    title: 'Moments\nworth\nremembering',
    body: 'Every smile, every glance, every little moment with you becomes a beautiful memory I hold close to my heart.',
    cta: 'Play our memories',
    sub: 'Scroll through the reel.',
  },
  little: {
    eyebrow: 'Chapter 05 — Little Things',
    title: 'Things I notice\u2026',
    sub: 'Touch a thought to read it.',
  },
  /* Chapter 06 is a composed scene rather than a headline and a
     button, so its furniture lives here too. The letter itself is
     untouched in content/letter.js — none of this replaces it. */
  letter: {
    eyebrow: 'Chapter 06 — Secret Letter',
    /* The label, split for the two-line mark in the top corner. */
    kicker: 'Chapter 06',
    name: 'Secret Letter',
    /* The heading, in two tones: ivory, then dusty rose. */
    title: 'A letter',
    titleAccent: 'just for you',
    intro: 'Some feelings are hard to put into words,\nso I wrote them down.\nFor you, and only you.',
    cta: 'Open my heart',
    /* The three notes down the right-hand side. */
    details: [
      { n: '01', label: 'My Heart',     text: 'A letter filled with\nall my love.' },
      { n: '02', label: 'Just For You', text: 'Words that are\nonly for you.' },
      { n: '03', label: 'Forever',      text: 'Today, tomorrow,\nand always.' },
    ],
    ps: 'You mean the world to me.',
  },
  song: {
    eyebrow: 'Chapter 07 — The Song Room',
    title: 'One song.\nOne little feeling.',
    sub: 'Take the record off the shelf.',
  },
  /* Chapter 08 — the closing scene. The message on the left, then
     the celebration the rose sets off. Her real name is used
     throughout here: this is the most personal writing on the site. */
  reveal: {
    eyebrow: 'Chapter 08',
    kicker: 'Chapter 08',
    name: 'The Final Rose',
    corner: 'Final Moment',
    /* The heading, in two tones: ivory, then rose italic. */
    title: 'One last',
    titleAccent: 'thing…',
    intro: 'Before this little world ends,\nthere is one thing I hope you carry with you.',
    wishHeading: 'One little wish for you.',
    wish: 'Learn to control your ego,\nchoose understanding over pride,\nand give yourself time to grow.',
    wishSoft: 'You are still becoming the person you are meant to be.\nSo be patient with yourself,\nand a little kinder to the people who love you.',
    closing: 'Always keep becoming a better version of yourself.',
    signature: '— Sajith ❤️',
    cta: 'Pick the rose',
    /* The full-viewport celebration the rose sets off. */
    celebration: 'Happy Birthday, Rozana ❤️',
    celebrationWish: 'May you keep growing,\nkeep smiling,\nand keep becoming\nthe beautiful person you are meant to be.',
    celebrationThanks: 'Thank you for being part of my little world.',
    celebrationSignature: '— Sajith',
  },
  /* Chapter 09, the closing frame: a rose, the signature and the way
     back. Its old headline, wish and thanks now live in Chapter 08's
     celebration — the birthday message is deliberately in one place. */
  final: {
    signature: `\u2014 ${site.signature}`,
    replay: 'Play it again',
  },
};
