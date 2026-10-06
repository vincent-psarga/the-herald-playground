import { ChargeType } from '../../models/Charge';
import { Metals } from '../../models/Tinctures';
import { parker } from '../Sources';
import { Strewings } from '../Strewings';
import { Word } from '../Word';

/**
 * English names a strewing by turning the figure it sows into an adjective —
 * billetty from the billet, bezanty from the bezant — which is the same move
 * French makes with its participles, arrived at from the other end.
 *
 * The bezant carries its tincture into the strewing as it carries it into the
 * charge: a bezanty field is gold-sown by being bezanty, and a field sown with
 * silver discs is no bezanty but a field semy of plates. English named no
 * adjective for the plate, so that one is sown in as many words.
 *
 * The annulet and the lozenge have none either. "Lozengy" is a field cut into
 * lozenges rather than sown with them, and is a varied field in its own right —
 * not this, and not to be borrowed for it.
 */
export const EnglishStrewings: Strewings = {
  [ChargeType.annulet]: undefined,
  [ChargeType.billet]: new Word('billetty', {
    value:
      'A field sown with billets: the figure repeated small over the whole of it, running off every edge and past counting. Heraldry would rather name such a field than describe it, and Parker calls the special term preferable — semy of billets says no more.',
    sources: [parker('Billetty')],
  }),
  [ChargeType.lozenge]: undefined,
  [ChargeType.roundel]: new Word(
    'bezanty',
    {
      value:
        'A field sown with bezants, and gold by being bezanty: nothing is written after the word. A field sown with silver discs is no bezanty at all but semy of plates, English having named no adjective for that one.',
      sources: [parker('Bezanty')],
    },
    { defaultTincture: Metals.or }
  ),
  // A field sown with drops has a word — gutté, gutty — and the word does not
  // take a tincture. Parker names the liquid instead: "when argent, gutté d'eau
  // ... when gules, gutté de sang", which is a second vocabulary of waters and
  // bloods and pitches that nothing here reads. So a sown goutte is sown in as
  // many words, where "gutty argent" would be a form no armorial writes.
  [ChargeType.goutte]: undefined,
  // English names no strewing of tears, having no name for the figure itself:
  // gutty is the drop's word, and names a liquid where this would need a
  // tincture. Sown in as many words, as the drop is.
  [ChargeType.larme]: undefined,
  [ChargeType.mullet]: undefined,
  // The arms of France before they were reduced to three, and the one strewing
  // English names after the figure rather than after an adjective made of it.
  // Crusily is not this. Parker has it as "semé of cross crosslet" — the cross
  // with crossed arms — so a field sown with plain ones is no crusily, and
  // borrowing the word would promise a figure this does not draw.
  [ChargeType.crossCouped]: undefined,
  [ChargeType.crescent]: undefined,
  [ChargeType.fleurDeLis]: new Word(
    'semy-de-lis',
    {
      value:
        'A field sown with fleurs-de-lis: the arms of France before they were reduced to three. It is the one strewing English names after the figure itself rather than after an adjective made of it.',
      sources: [parker('Seme')],
    },
    {
      alternateWording: {
        'semy-de-lys': {},
        'semé-de-lis': {},
        'semy de lis': {},
      },
    }
  ),
};

/**
 * How English says a field is sown with a figure it has no word of its own for.
 *
 * Parker writes the French participle and notes it is "sometimes written semy";
 * the English spelling is the one written back out, and both are read. They are
 * words of the vocabulary like any other — they say what has happened to the
 * field — so they are kept here with what they mean, and the grammar reads them
 * off this rather than out of strings of its own.
 */
export const SOWN: readonly Word[] = [
  new Word('semy', {
    value:
      'The field sown with a figure English has no single word for: semy of annulets, semy of mullets. What is sown is drawn small, runs off every edge and is past counting — the field’s own state rather than something it bears, so a band blazoned after it covers the sowing exactly as it covers the tincture beneath. Where English does have a word — billetty, bezanty, semy-de-lis — that word is written instead.',
    sources: [parker('Seme')],
  }),
  new Word(
    'semé',
    {
      value:
        'The field sown with a figure English has no single word for, drawn small, running off every edge and past counting. This is the French participle English took the word from, written with its accent or with the accent spelled out.',
      sources: [parker('Seme')],
    },
    { alternateWording: { semee: {} } }
  ),
];

/** What stands between the sowing and the figure sown: "semy of billets". */
export const OF = 'of';
