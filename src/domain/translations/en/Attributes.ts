import { Attribute } from '../../models/Attributes';
import { parker } from '../Sources';
import { Translation } from '../Translation';
import { Word } from '../Word';

// English says the part in one word standing after the charge and its tincture,
// with the part's own tincture after that: "Gules, three gem-rings argent stoned
// azure". It agrees with nothing, as a modifier does not, so the plural is
// declared to be the word itself rather than left to the "-s" a noun would take.
//
// Parker gives three words for the one part — a gem-ring is "sometimes described
// as stoned, gemmed, or jewelled of another tincture" — and one of them is read.
// The other two say exactly this and are left out until an armorial here writes
// one: a word put in is carried for ever, and none of the three is owed to the
// blazons this vocabulary reads.
export const EnglishAttributes: Translation<Attribute> = {
  [Attribute.stoned]: new Word(
    'stoned',
    {
      value:
        'The stone set in a ring, painted apart from the hoop. Its tincture follows the word: stoned azure is a blue stone.',
      sources: [parker('Stoned')],
    },
    { plural: 'stoned' }
  ),
  [Attribute.armed]: new Word(
    'armed',
    {
      value:
        'The claws of a beast, painted apart from the rest of it. Parker says it of teeth and talons and horns as well; here it is the claws, the beasts with the rest of them being yet to come.',
      sources: [parker('Armed')],
    },
    { plural: 'armed' }
  ),
  [Attribute.langued]: new Word(
    'langued',
    {
      value:
        'The tongue of a beast, painted apart from the rest of it. English says it of the birds as readily as of the beasts, where French keeps lampassé for the four-footed.',
      sources: [parker('Langued'), parker('Lampasse')],
    },
    { plural: 'langued' }
  ),
  [Attribute.crowned]: new Word(
    'crowned',
    {
      value:
        'The crown a beast wears, painted apart from the rest of it. A ducal coronet unless a blazon names another, and none can be named here.',
      sources: [parker('Crown')],
    },
    { plural: 'crowned' }
  ),
};
