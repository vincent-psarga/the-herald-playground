import { DivisionType, FieldType } from '../../models/Field';
import { parker } from '../Sources';
import { Translation } from '../Translation';
import { Word } from '../Word';

// English names a partition after the line that divides the field, as French
// does, but spells it out: "per pale" where French says "parti".
export const EnglishDivisionType: Translation<DivisionType> = {
  [FieldType.pale]: new Word('per pale', {
    value:
      'The field cut straight down the middle, along the line a pale would occupy. The first tincture named takes the half at dexter, the viewer’s left.',
    sources: [parker('Party')],
  }),
  [FieldType.fess]: new Word('per fess', {
    value:
      'The field cut straight across, along the line of a fess. The first tincture named takes the chief, the upper half.',
    sources: [parker('Party')],
  }),
  [FieldType.bend]: new Word('per bend', {
    value:
      'Cut from dexter chief to sinister base — from the top left, as you look at it — along the line of a bend.',
    sources: [parker('Party')],
  }),
  [FieldType.bendSinister]: new Word('per bend sinister', {
    value:
      'Cut from sinister chief to dexter base — from the top right, as you look at it — along the line of a bend sinister. Sinister means the bearer’s left, never yours.',
    sources: [parker('Party')],
  }),
  // The one partition English does not spell out with a "per": Parker glosses it
  // "party per cross", but the armorials write "quarterly" and that is the word
  // read and written here. Only the two-tincture blazon is read: the shield
  // marshalling a coat to each quarter asks for a field this model cannot hold.
  [FieldType.cross]: new Word('quarterly', {
    value:
      'The field cut per pale and per fess at once, into four quarters. The first tincture takes the quarter at dexter chief and the one opposite. Quarterly also introduces a shield marshalling a coat in each quarter.',
    sources: [parker('Quarterly'), parker('Quartered')],
  }),
  // Named with a "per" like the first four, quarterly being the word English
  // keeps for the other cut. Parker writes "quarterly per saltire" too and says
  // in the same breath that it is not needed, so it is not read.
  [FieldType.saltire]: new Word('per saltire', {
    value:
      'The field cut per bend and per bend sinister at once, into four triangles meeting at the centre. The first tincture takes the triangle in chief and the one in base, the second those at dexter and at sinister.',
    sources: [parker('Party')],
  }),
};
