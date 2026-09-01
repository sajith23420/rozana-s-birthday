/* ══════════════════════════════════════════════════════════════════
   Secret Letter — one paragraph per line, revealed in sequence.

   The greeting, the signature and the wax-seal initial all derive from
   site.config.js. The body is placeholder text and is yours to rewrite.
   ══════════════════════════════════════════════════════════════════ */

import { site } from './site.config.js';

export const letter = {
  title: 'A Little Note For You',
  greeting: `Happy Birthday, ${site.name}.`,
  paragraphs: [
    'I did not want to give you something ordinary this year.',
    'So I made this little place instead.',
    'Every small detail here was put together with one simple thought — to make you smile today.',
    'I hope this new year of your life brings you beautiful moments, peace in your heart, and countless reasons to smile.',
  ],
  closing: 'Happy Birthday. \u{1F339}',
  signature: site.signature,
  seal: site.signature.charAt(0),
};
