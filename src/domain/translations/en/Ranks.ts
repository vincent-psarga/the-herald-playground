import { RankWords } from '../Ranks';
import { parker } from '../Sources';
import { Word } from '../Word';

// English ranks the parts of a divided field with a bare ordinal and no article,
// which is what Parker writes under Quarterly: "Quarterly; first and fourth
// gules, three cinquefoils, in fesse point a mullet argent; second gules, three
// cinquefoils argent, in fesse point a heart or; third gules, within a border
// argent, three doves close of the second". Several ranks to a phrase are joined
// by the conjunction that joins anything else — "first and fourth" — and the
// figures are read as readily, a number in figures being read wherever a number
// is.
//
// Parker ranks quarters. He does not rank the halves of a partition, English
// setting two whole coats side by side another way — "It is necessary always to
// mention the dexter shield first and to say impaled with" — so a ranked half is
// this vocabulary lending the quarters' form to a field Parker never writes that
// way. It is lent rather than invented, and it is lent because the alternative
// is writing arms that read back as different arms: the unranked form puts what
// the second half bears on the shield instead.
//
// No Roman numerals. French writes them and English does not, here or in Parker.
export const EnglishRanks: RankWords<Word> = {
  1: new Word('first', {
    value:
      'The first part of a divided field: the one in chief, or at dexter. Whatever is blazoned after it is laid in that part. Written "first", and in figures: "1".',
    sources: [parker('Quarterly')],
  }),
  2: new Word('second', {
    value:
      'The second part of a divided field, named after the first: at sinister where the parts stand square, at dexter where four stand on their points.',
    sources: [parker('Quarterly')],
  }),
  3: new Word('third', {
    value:
      'The third part of a divided field, which only a quartered field has: at dexter in base where the quarters stand square, at sinister where they stand on their points.',
    sources: [parker('Quarterly')],
  }),
  4: new Word('fourth', {
    value:
      'The last part of a quartered field: at sinister in base where the quarters stand square, in base where they stand on their points. It stands corner to corner with the first.',
    sources: [parker('Quarterly')],
  }),
};
