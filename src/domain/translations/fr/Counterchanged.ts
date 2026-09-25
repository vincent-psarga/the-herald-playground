import { blasonArmoiries, laLangueDuBlason } from '../Sources';
import { FrenchWord } from './FrenchWord';

/**
 * The phrase French paints a band with the field's own two tinctures by,
 * reversed: "parti d'or et de sable, à la bordure de l'un à l'autre", whose
 * bordure is sable against the gold half and gold against the sable.
 *
 * It stands where a tincture stands and answers the same question, so the
 * grammar reads it there; but it names no tincture and cannot, what it comes out
 * as being the field's to settle.
 *
 * French writes it two ways, and they are two spellings of the one phrase here
 * rather than two phrases. The dictionaries do try to divide them, and disagree
 * flatly about which way round. Au blason des armoiries keeps "l'un à l'autre"
 * for figures "posés sur les partitions" — standing on the line — and "l'un en
 * l'autre" for figures "au centre des divisions", standing to one side of it; La
 * langue du blason has the two exactly the other way about; and the Manuel du
 * blason calls telling them apart "une chinoiserie" and keeps only "l'un en
 * l'autre". Parker, reading both from the outside, says "de l'un en l'autre (or
 * de l'un à l'autre)" and treats the pair as one word.
 *
 * So both are read and "de l'un à l'autre" is written, and what the dictionaries
 * were trying to say with two phrases is said instead by the drawing: a band
 * crossing the line comes out cut by it, and a band lying wholly in a half comes
 * out wholly of the other half's tincture. Neither case is told the rule; both
 * fall out of where the figure happens to lie — see the conventions page.
 *
 * Read as a phrase rather than as a word, half of it being articles the lexer
 * does not read as words at all.
 */
export const FrenchCounterchanged = new FrenchWord(
  "de l'un à l'autre",
  {
    value:
      'Said in place of a tincture, of a band laid on a divided field: it takes the field’s own two tinctures, reversed — where the field is gold the band is sable, and where the field is sable the band is gold. A band crossing the partition is therefore cut by it, and one lying wholly in a half comes out wholly of the other half’s tincture. The field must be divided in two, or the blazon is refused: there is nothing to reverse on a field of one tincture. “De l’un en l’autre” is read for it too — the dictionaries variously make that phrase this same one or its opposite — and “de l’un à l’autre” is what comes back.',
    sources: [
      blasonArmoiries("L'un à l'autre", 'l-un-a-l-autre'),
      laLangueDuBlason(
        '« de l’un en l’autre »',
        '2012/09/de-lun-en-lautre-en-langue-du-blason.html'
      ),
    ],
  },
  { alternateWording: { "de l'un en l'autre": {} } }
);
