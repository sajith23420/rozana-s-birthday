/* Star Map — observations, not compliments.
   x / y are percentages of the sky container.
   `link` indices draw the constellation, in order. */

export const stars = [
  { id: 's1', x: 14, y: 26, mag: 1.0, title: 'The way you tell a story',
    note: 'You always start in the middle, then go back for the beginning. I have never once minded.' },
  { id: 's2', x: 29, y: 14, mag: 0.7, title: 'Late conversations',
    note: 'The ones that were supposed to last ten minutes.' },
  { id: 's3', x: 44, y: 30, mag: 1.2, title: 'Your timing',
    note: 'You say the right thing at the moment nobody else thought to say anything.' },
  { id: 's4', x: 61, y: 18, mag: 0.8, title: 'Ordinary days',
    note: 'You have a habit of making them feel like they counted.' },
  { id: 's5', x: 74, y: 34, mag: 1.0, title: 'The small kindnesses',
    note: 'The ones you do quietly and then never mention again.' },
  { id: 's6', x: 86, y: 22, mag: 0.6, title: 'How you notice things',
    note: 'Details other people walk straight past.' },
  { id: 's7', x: 55, y: 52, mag: 1.1, title: 'Your stubbornness',
    note: 'Yes, this one is a compliment. You do not fold easily.' },
  { id: 's8', x: 33, y: 60, mag: 0.9, title: 'The way you say my name',
    note: 'Slightly differently than everyone else does.' },
  { id: 's9', x: 70, y: 66, mag: 0.75, title: 'Your quiet moods',
    note: 'You do not need filling. That is a rare thing.' },
];

export const constellation = [0, 1, 2, 3, 4, 5, 2, 6, 7, 6, 8];
