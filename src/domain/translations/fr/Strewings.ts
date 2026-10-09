import { ChargeType } from '../../models/Charge';
import { COLOURS, METALS, Metals, PELTS } from '../../models/Tinctures';
import { blasonArmoiries } from '../Sources';
import { Strewings } from '../Strewings';
import { FrenchWord } from './FrenchWord';

/**
 * French names a strewing with the past participle of the figure it sows, as it
 * names a varied field with the participle of the band it repeats: the billette
 * gives billeté, the besant besanté.
 *
 * The roundel keeps the split it keeps everywhere else. Besanté is sown with the
 * metal disc and tourtelé with the coloured one, so the two words carry the same
 * tinctures the two charges do, and a besanté that says no more is gold.
 *
 * Two of the four have no word, and are sown in as many words instead. Losangé
 * is not a field sown with lozenges but a field cut into them, which is another
 * term altogether and would be a lie here; the annelet the armorials sow has no
 * participle they sow it by.
 *
 * Nothing here agrees with an article: the word follows the field's own tincture
 * and stands before the tincture it is sown in.
 */
export const FrenchStrewings: Strewings<FrenchWord> = {
  [ChargeType.annulet]: undefined,
  [ChargeType.billet]: new FrenchWord('billeté', {
    value:
      'A field sown with billettes: the figure repeated small over the whole of it, running off every edge and past counting. French would rather name such a field than describe it, and this is the name — semé de billettes says no more.',
    sources: [blasonArmoiries('Billeté', 'billetee')],
  }),
  [ChargeType.lozenge]: undefined,
  [ChargeType.roundel]: [
    new FrenchWord(
      'besanté',
      {
        value:
          'A field sown with besants. The word carries the metal exactly as the charge does: a besanté that says no more is gold, and a field sown with silver discs says so — besanté d’argent.',
        sources: [blasonArmoiries('Besanté')],
      },
      {
        allowedTinctures: [...METALS, ...PELTS],
        defaultTincture: Metals.or,
      }
    ),
    new FrenchWord(
      'tourtelé',
      {
        value:
          'A field sown with tourteaux, and owed its colour every time, as the tourteau itself is.',
        sources: [blasonArmoiries('Tourtelé', 'tourtelee')],
      },
      { allowedTinctures: [...COLOURS, ...PELTS] }
    ),
  ],
  // "Lorsqu'un écu en est semé on le dit Goutté en blasonnant" — Duhoux
  // d'Argicourt, quoted by Au blason des armoiries, which quotes another author
  // too who would rather say semé de gouttes. The named word is written, as it
  // is wherever French has one.
  //
  // It takes its tincture as any strewing does: goutté de gueules. Some authors
  // pour the drops instead — goutté de sang — and that is read, with the
  // liquids, and written back as the tincture.
  [ChargeType.goutte]: new FrenchWord('goutté', {
    value: 'A field sown with gouttes, owed its tincture as any strewing is: goutté de gueules.',
    sources: [blasonArmoiries('Goutte, goutté', 'goutte')],
  }),
  // The larme has no participle of its own, and the armorials ask for none: a
  // field sown with tears is written "semé de larmes", which is the long way
  // round already. Goutté will not stand in for it — that word is the drop's,
  // and the dictionary keeps the two figures apart.
  [ChargeType.larme]: undefined,
  [ChargeType.mullet]: undefined,
  // "Fleurdelisé" is not this. It says a figure ends in fleurs-de-lis — the
  // escarboucle fleurdelisée, whose arms finish in them — and borrowing it for a
  // field sown with them would say something else entirely. French sows this one
  // in as many words, as its armorials do.
  // French names no strewing of croisettes that the dictionaries settle, so this
  // one is sown in as many words like the rest.
  [ChargeType.crossCouped]: undefined,
  [ChargeType.crescent]: undefined,
  [ChargeType.fleurDeLis]: undefined,
};

/**
 * How French says a field is sown with a figure it has no word of its own for.
 *
 * It is a word of the vocabulary like any other — it says what has happened to
 * the field — so it is kept here with what it means, and the grammar reads it
 * off this rather than out of a string of its own.
 */
export const SOWN = new FrenchWord('semé', {
  value:
    'The field sown with a figure French has no single word for: semé d’annelets, semé de fleurs de lys. What is sown is drawn small, runs off every edge and is past counting — the field’s own state rather than something it bears, so a band blazoned after it covers the sowing exactly as it covers the tincture beneath. Where French does have a word — billeté, besanté, tourtelé — that word is written instead.',
  sources: [blasonArmoiries('Semé')],
});
