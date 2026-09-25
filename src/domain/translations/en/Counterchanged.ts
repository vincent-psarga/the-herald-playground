import { parker } from '../Sources';
import { Word } from '../Word';

/**
 * The word English paints a band with the field's own two tinctures by,
 * reversed: "per pale or and sable, a bordure counterchanged".
 *
 * One word where French has two phrases and argues about them, and one word that
 * covers both of the cases French tries to tell apart: Parker's rule is about
 * "the charges, or parts of charges", so a band cut by the partition and a band
 * lying wholly in one half are the same word saying the same thing.
 */
export const EnglishCounterchanged = new Word('counterchanged', {
  value:
    'Said in place of a tincture, of a band laid on a field divided by one of the lines of partition: the parts of it lying on the metal are of the colour, and the parts lying on the colour are of the metal. A band crossing the partition is therefore cut by it, and one lying wholly in a half comes out wholly of the other half’s tincture. The field must be divided in two, or the blazon is refused: there is nothing to reverse on a field of one tincture. It is the French “de l’un en l’autre”, which Parker calls practically equivalent.',
  sources: [parker('Counter')],
});
