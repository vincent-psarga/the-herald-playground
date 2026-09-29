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
};
