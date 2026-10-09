import { blasonArmoiries } from '../Sources';
import { FrenchWord } from './FrenchWord';

/**
 * The word French cuts a band into compons by: "à la bordure componée de gueules
 * et d'argent", the two tinctures following it as a varied field's follow its
 * name.
 *
 * It stands where a tincture stands, as "de l'un à l'autre" does, and agrees
 * with the band as a modifier does — "à la bande componée", "au pal componé" —
 * the participle borrowing its gender from the noun.
 *
 * Au blason des armoiries files it under "Componné" and spells it so
 * throughout; the armorials, the Encyclopédie and Wiktionnaire write
 * "componé". Both are read, and "componé" is written: it is what the armorials
 * this vocabulary reads write — see the conventions page.
 */
export const FrenchCompony = new FrenchWord(
  'componé',
  {
    value:
      'Said in place of a tincture, of a band cut across into squares, the compons, of two tinctures laid alternately: “à la bordure componée de gueules et d’argent”. The first tincture named takes the first compon, at the band’s upper end.',
    sources: [blasonArmoiries('Componné', 'compone')],
  },
  { alternateWording: { componné: {} } }
);
