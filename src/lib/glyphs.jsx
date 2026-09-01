/* ══════════════════════════════════════════════════════════════════
   Emoji need opting out of two things this design does to text:
   gradient fills (`.text-sheen` paints glyphs transparent, which
   erases a colour emoji entirely) and serif display sizing, where a
   full-size emoji shouts over the letterforms.

   Any styled text that may contain an emoji renders through here.
   ══════════════════════════════════════════════════════════════════ */

const EMOJI = /(\p{Extended_Pictographic}\uFE0F?)/gu;

export function splitGlyphs(text) {
  return String(text).split(EMOJI).map((part, i) => {
    EMOJI.lastIndex = 0;
    return EMOJI.test(part)
      ? <span key={i} className="glyph-plain">{part}</span>
      : part;
  });
}
