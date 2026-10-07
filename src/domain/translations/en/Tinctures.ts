import { Colours, Furs, Metals, Tincture } from '../../models/Tinctures';
import { parker } from '../Sources';
import { Translation } from '../Translation';
import { Word } from '../Word';

export const EnglishMetals: Translation<Metals> = {
  [Metals.or]: new Word('or', {
    value:
      'Gold, painted yellow. The French for gold, and never the conjunction the same two letters spell.',
    sources: [parker('Or')],
  }),
  [Metals.argent]: new Word('argent', {
    value: 'Silver, or plain white. It carries no hatching at all: the bare paper is the metal.',
    sources: [parker('Argent')],
  }),
};

export const EnglishColours: Translation<Colours> = {
  [Colours.azure]: new Word('azure', {
    value: 'Blue.',
    sources: [parker('Azure')],
  }),
  [Colours.gules]: new Word('gules', {
    value: 'Red. From the fur-trimmed throat of a garment, not from any word for red.',
    sources: [parker('Gules')],
  }),
  [Colours.sable]: new Word('sable', {
    value: 'Black.',
    sources: [parker('Sable')],
  }),
  [Colours.vert]: new Word('vert', {
    value: 'Green.',
    sources: [parker('Vert')],
  }),
  // Parker: "this colour, as it is considered by some, but tincture as it is
  // allowed to be by others, is found but rarely in early rolls of arms ... The
  // terms plumby and porprin occur." Both are left out: they are other words and
  // not spellings of this one, and no armorial here writes either.
  [Colours.purpure]: new Word('purpure', {
    value: 'Purple. Rare in the early rolls, and a colour rather than a metal.',
    sources: [parker('Purpure')],
  }),
};

export const EnglishFurs: Translation<Furs> = {
  [Furs.ermine]: new Word('ermine', {
    value: 'A white pelt strewn with black tails.',
    sources: [parker('Ermine')],
  }),
  [Furs.vair]: new Word('vair', {
    value:
      'Squirrel fur, argent and azure, cut into bells and set in alternating rows. It carries its pair with it: a blazon naming it names no tinctures after it.',
    sources: [parker('Vair')],
  }),
};

export const EnglishTinctures: Translation<Tincture> = {
  ...EnglishMetals,
  ...EnglishColours,
  ...EnglishFurs,
};
