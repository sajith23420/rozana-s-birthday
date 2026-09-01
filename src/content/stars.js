/* Star Map — observations, not compliments.
   x / y are percentages of the sky container.
   `link` indices draw the constellation, in order.

   `m` is the same sky read for a narrow one: below `lg` the map has
   the full width of the screen rather than the right two thirds of a
   desktop, and the scattered arrangement above puts labels on top of
   each other there. The mobile reading keeps every star, every note
   and the same constellation order — it simply walks the chain down
   the screen instead of across it, alternating which side of each
   star its label hangs on so two can never meet. */

export const stars = [
  { id: 's1', x: 14, y: 26, mag: 1.0, m: { x: 26, y: 5, side: 'r' }, title: 'The way you tell a story',
    note: 'You always start in the middle, then go back for the beginning. I have never once minded.' },
  { id: 's2', x: 29, y: 14, mag: 0.7, m: { x: 70, y: 16, side: 'l' }, title: 'Late conversations',
    note: 'The ones that were supposed to last ten minutes.' },
  { id: 's3', x: 44, y: 30, mag: 1.2, m: { x: 32, y: 27, side: 'r' }, title: 'Your timing',
    note: 'You say the right thing at the moment nobody else thought to say anything.' },
  { id: 's4', x: 61, y: 18, mag: 0.8, m: { x: 72, y: 38, side: 'l' }, title: 'Ordinary days',
    note: 'You have a habit of making them feel like they counted.' },
  { id: 's5', x: 74, y: 34, mag: 1.0, m: { x: 26, y: 48, side: 'r' }, title: 'The small kindnesses',
    note: 'The ones you do quietly and then never mention again.' },
  { id: 's6', x: 86, y: 22, mag: 0.6, m: { x: 68, y: 59, side: 'l' }, title: 'How you notice things',
    note: 'Details other people walk straight past.' },
  { id: 's7', x: 55, y: 52, mag: 1.1, m: { x: 34, y: 70, side: 'r' }, title: 'Your stubbornness',
    note: 'Yes, this one is a compliment. You do not fold easily.' },
  { id: 's8', x: 33, y: 60, mag: 0.9, m: { x: 70, y: 81, side: 'l' }, title: 'The way you say my name',
    note: 'Slightly differently than everyone else does.' },
  { id: 's9', x: 70, y: 66, mag: 0.75, m: { x: 28, y: 92, side: 'r' }, title: 'Your quiet moods',
    note: 'You do not need filling. That is a rare thing.' },
];

export const constellation = [0, 1, 2, 3, 4, 5, 2, 6, 7, 6, 8];
