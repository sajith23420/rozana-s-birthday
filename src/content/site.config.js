/* ══════════════════════════════════════════════════════════════════
   ★ IDENTITY & CONFIGURATION — the single source of truth.

   Names, the signature, the birthday, the song and the chapter list all
   live here. Everything else in the project reads from this file rather
   than repeating a name in its own strings, so changing a value here
   changes it everywhere it appears.

   The one exception is `index.html`, which is static markup and cannot
   import JavaScript — the <title> and the social meta tags there must be
   edited by hand if `title` or `description` below changes.
   ══════════════════════════════════════════════════════════════════ */

export const site = {
  /* The nickname — what the little world calls her, and the identity
     the site is branded with. */
  name: 'Rozy',
  /* Her real name. Used where the writing turns intimate rather than
     playful: the two birthday climaxes. */
  fullName: 'Rozana',
  /* Signs the letter and the closing frame. */
  signature: 'Sajith',

  /* The date this is for. Structured rather than a formatted string so a
     chapter can present it however it likes later. Nothing displays it
     yet — that is a deliberate decision to be made in a later phase. */
  birthday: {
    day: 2,
    month: 'September',
    /* Convenience for anywhere that wants it as one string. */
    get label() {
      return `${this.month} ${this.day}`;
    },
  },

  /* Mirrored by hand in index.html — see the note above. */
  title: 'ROZY — A Little World Made For You',
  description: 'A little world, made for one person.',
};

/* ══════════════════════════════════════════════════════════════════
   AUDIO — replacing the song is a one-line change.

   Drop the new file into /public/, then update `src`, `title` and
   `artist` below. No component anywhere names an audio file; the
   provider reads `src` from here and nothing else touches it.
   ══════════════════════════════════════════════════════════════════ */

export const audio = {
  src: '/Our_Song (1).mp3',      // ← placeholder, carried over. Replace this.
  title: 'One Song',             // ← shown on the vinyl label
  artist: '',                    // ← optional; shown under the title when set
  subtitle: `for ${site.name}`,
  defaultVolume: 0.55,
};

/* The spine of the experience. Order here is order on screen. */
export const chapters = [
  { id: 'garden',  index: '02', label: 'Rose Garden' },
  { id: 'starmap', index: '03', label: 'Star Map' },
  { id: 'film',    index: '04', label: 'Memory Film' },
  { id: 'little',  index: '05', label: 'Little Things' },
  { id: 'letter',  index: '06', label: 'Secret Letter' },
  { id: 'song',    index: '07', label: 'The Song Room' },
  { id: 'reveal',  index: '08', label: 'The Rose Reveal' },
  { id: 'final',   index: '09', label: 'Birthday' },
];
