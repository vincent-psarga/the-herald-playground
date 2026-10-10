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
  // A field sown with drops. Parker files it "Guttée, gutty" and gives "the more
  // frequent form" as "gutté, or gutty, goutty, gouté", so there are two words
  // here as there are for vair: gutty is English, gutté the French participle
  // English borrowed, and telling a reader they were one spelling would be
  // false. Goutty and gouté are the same two with a letter changed.
  //
  // Neither carries a tincture. What follows it is the liquid the drops are of —
  // gutté d'eau, gutté de sang — which is a tincture under another name, kept
  // with the liquids and said of the drop wherever it is poured. A tincture with
  // no liquid is written as a tincture: gutté purpure.
  //
  // Gutté is written back, being the form Parker's table of liquids is written
  // in, and the liquids being French reads best after the French participle.
  [ChargeType.goutte]: [
    new Word(
      'gutté',
      {
        value:
          'A field sown with gouttes, from the French participle. The drops are named by their liquid where there is one: gutté de sang is gules, gutté d’eau argent.',
        sources: [parker('Gouttes')],
      },
      { alternateWording: { gouté: {}, guttée: {} } }
    ),
    new Word(
      'gutty',
      {
        value:
          'A field sown with gouttes, taking the same liquids as gutté: gutty d’eau, goutty de larmes.',
        sources: [parker('Gouttes')],
      },
      { alternateWording: { goutty: {} } }
    ),
  ],
  // English names no strewing of tears, having no name for the figure itself:
  // gutté is the drop's word, and says what the drop is of rather than what it
  // looks like. Sown in as many words.
  [ChargeType.larme]: undefined,
  [ChargeType.mullet]: undefined,
  // The arms of France before they were reduced to three, and the one strewing
  // English names after the figure rather than after an adjective made of it.
  // Crusily is not this. Parker has it as "semé of cross crosslet" — the cross
  // with crossed arms — so a field sown with plain ones is no crusily, and
  // borrowing the word would promise a figure this does not draw.
  [ChargeType.crossCouped]: undefined,
  [ChargeType.crescent]: undefined,
  // Neither tongue names a field sown with lions, the beast being borne rather
  // than sown: a shield covered in them would be blazoned semy of lions in as
  // many words, and no armorial here writes even that.
  [ChargeType.lion]: undefined,
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
