import { Colours, Furs, Metals, Tincture } from '../../models/Tinctures';
import { blasonArmoiries } from '../Sources';
import { Translation } from '../Translation';
import { FrenchWord } from './FrenchWord';

export const FrenchMetals: Translation<Metals, FrenchWord> = {
  [Metals.or]: new FrenchWord('or', {
    value: 'Gold, painted yellow. Never the conjunction the same two letters spell.',
    sources: [blasonArmoiries('Or')],
  }),
  [Metals.argent]: new FrenchWord('argent', {
    value: 'Silver, or plain white. It carries no hatching at all: the bare paper is the metal.',
    sources: [blasonArmoiries('Argent')],
  }),
};

export const FrenchColours: Translation<Colours, FrenchWord> = {
  [Colours.azure]: new FrenchWord('azur', {
    value: 'Blue.',
    sources: [blasonArmoiries('Azur')],
  }),
  [Colours.gules]: new FrenchWord('gueules', {
    value: 'Red. From the fur-trimmed throat of a garment, not from any word for red.',
    sources: [blasonArmoiries('Gueules')],
  }),
  [Colours.sable]: new FrenchWord('sable', {
    value: 'Black.',
    sources: [blasonArmoiries('Sable')],
  }),
  [Colours.vert]: new FrenchWord('sinople', {
    value: 'Green.',
    sources: [blasonArmoiries('Sinople')],
  }),
  // "Une des couleurs du blason ; c'est le violet, composé d'azur et de
  // gueules", and a masculine noun, so "de pourpre" and "au lion de pourpre".
  [Colours.purpure]: new FrenchWord('pourpre', {
    value: 'Purple: the violet heraldry mixes from azure and gules. A colour, never a metal.',
    sources: [blasonArmoiries('Pourpre')],
  }),
};

export const FrenchFurs: Translation<Furs, FrenchWord> = {
  // The h of hermine is mute, so "de" elides before it as it would before a vowel.
  [Furs.ermine]: new FrenchWord(
    'hermine',
    {
      value:
        'A white pelt strewn with black tails. Its h is mute, so the article elides before it: d’hermine.',
      sources: [blasonArmoiries('Hermine', 'hermine-fourrure')],
    },
    { isFeminine: true, needsElision: true }
  ),
  [Furs.vair]: new FrenchWord('vair', {
    value:
      'Squirrel fur, argent and azure, cut into bells and set in alternating rows. It carries its pair with it: a blazon naming it names no tinctures after it.',
    sources: [blasonArmoiries('Vair')],
  }),
};

export const FrenchTinctures: Translation<Tincture, FrenchWord> = {
  ...FrenchMetals,
  ...FrenchColours,
  ...FrenchFurs,
};
