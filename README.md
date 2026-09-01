# ROZY — A Little World Made For You

A cinematic, nine-chapter interactive birthday experience.
React 19 + Vite + Tailwind v4 + Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

---

## Replacing the placeholder photos

Every image in the site is declared in exactly one file:
**`src/content/images.js`**. No component hardcodes a path.

1. Drop your photos into `public/images/`.
2. Edit only the `src` strings to match your filenames:

```js
rozy01: {
  src: '/images/rozy-01.jpg',   // ← the only line you usually change
  ratio: '3/4',                 // '3/4' portrait · '4/3' or '3/2' landscape
  focus: 'center',              // object-position: 'top', '50% 30%', …
  alt: 'A portrait of Rozy',
  caption: 'A moment I still remember.',
},
```

3. `ratio` reserves the space before the file loads, so nothing shifts.
   `focus` keeps a face from being cropped out.
4. `filmReel` at the bottom of the same file sets the order of the
   Memory Film chapter. Reorder or add keys freely.

The current `.svg` files are neutral generated placeholders — dark
gradients with a rose motif. They contain no photographic content.

**Recommended:** export at ~1600px on the long edge as `.webp`, under
about 250 KB each. Everything below the first two frames is lazy-loaded.

---

## Where the words live

| File | Holds |
|---|---|
| `src/content/copy.js` | Every chapter's headline, eyebrow and CTA |
| `src/content/letter.js` | The letter, its signature and the wax seal initial |
| `src/content/stars.js` | The nine Star Map observations + constellation order |
| `src/content/littleThings.js` | The floating fragments |
| `src/content/images.js` | All images and captions |
| `src/content/site.config.js` | Name, signature, audio track, chapter list |

To swap the song, replace the file and update `audio.src` in
`site.config.js`.

---

## Structure

```
src/
├── App.jsx              orchestration only — the gate and the chapter list
├── chapters/            one file per chapter, 01 → 09
├── components/
│   ├── layout/          Chapter shell, chapter rail, grain + vignette
│   ├── ui/              Reveal, SplitText, Eyebrow, PremiumButton
│   ├── media/           SmartImage (lazy, blur-up, ratio-reserved)
│   └── fx/              Rose, ParticleField, PetalFall, Fireflies
├── content/             all copy and configuration
├── hooks/               audio, reduced motion, pointer, chapter tracking
├── lib/                 easing vocabulary, small helpers
└── styles/              tokens · base · keyframes
```

### The chapters

| | | |
|---|---|---|
| 01 | The Entrance | dark screen, a bud, three lines, a door |
| 02 | Rose Garden | four parallax planes, pointer-driven camera |
| 03 | Star Map | nine stars; the constellation draws as you find them |
| 04 | Memory Film | a pinned reel that advances frame by frame |
| 05 | Little Things | fragments that expand in place |
| 06 | Secret Letter | envelope opens in 3D, the page rises out |
| 07 | The Song Room | the record *is* the player; ring is the scrubber |
| 08 | The Rose Reveal | the turn — bloom, petals, light, payoff |
| 09 | Final Moment | the last held frame, and the way back |

---

## Notes for future edits

- **Colours, type and easing** are tokens in `src/styles/tokens.css`.
  Change them there and the whole site follows.
- **All custom CSS is inside `@layer`.** Tailwind v4 emits into cascade
  layers, and unlayered CSS outranks every layer — an unlayered
  `button { border: 0 }` would silently kill button borders site-wide.
- **`prefers-reduced-motion` is honoured everywhere.** The Memory Film
  swaps its pinned reel for a vertical archive rather than degrading.
- **Audio** is one element behind `AudioProvider`. Playback is armed by
  the click on "Enter Your Little World", because browsers require a
  gesture. If that is refused, the next real interaction unlocks it.
- **`public/1.png` … `11.png`** are archived assets from the previous
  version of this project. Nothing references them. They are kept on
  disk only, and must not be reintroduced into the UI.
