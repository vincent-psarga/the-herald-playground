import { Attribute } from '../../models/Attributes';
import { ChargeType } from '../../models/Charge';
import { Modifier } from '../../models/Modifier';
import { COLOURS, METALS, Metals, PELTS } from '../../models/Tinctures';
import { blasonArmoiries } from '../Sources';
import { Translation } from '../Translation';
import { FrenchWord } from './FrenchWord';

// French calls a charge a meuble, and names these after the things they are
// pictures of: a little ring, a little log, a diamond, a coin or a cake.
//
// Gender is what the article agrees with — "à la billette", "à la losange" — so
// each name carries it, and so is elision: "annelet" begins on a vowel, and the
// article elides before it exactly as "de" does.
//
// Blazon kept the feminine losange where modern French went masculine, and the
// armorials are written both ways, so it is read under either article and
// written back out feminine, which is what the heraldic dictionaries give.
//
// The roundel has two names and no third, where English has one for every
// tincture: French tells the metal disc from the coloured one and stops there. A
// besant is the gold coin of Byzantium, and is understood to be gold when the
// blazon says no more; a tourteau is the cake, which has no one colour and must
// therefore always be told. Either may be cut from a fur, an armorial being free
// to blazon "un besant d'hermine".
export const FrenchChargeType: Translation<ChargeType, FrenchWord> = {
  // The ring is named twice, and the second name is the ring with something in
  // it: "lorsque ce meuble est représenté avec un chaton, il se nomme anneau".
  // So an anneau says the stone by being written, as a besant says gold — and
  // what colour the stone is drawn is still owed after the name, which no besant
  // ever is.
  //
  // Parker files the two together — the annulet is "(fr. Anneau and Anelet)" —
  // and the French dictionary does not, so the French page keeps them apart.
  // Bague is left out: the dictionary calls it "rare en armoiries" and glosses it
  // a gold ring for the finger, which is a figure rather than a third name.
  [ChargeType.annulet]: [
    new FrenchWord('annelet', {
      value:
        'A plain ring. What it encloses is the field showing through, not its own tincture. Shown with a stone in it, the figure is an anneau.',
      sources: [blasonArmoiries('Annelet')],
    }),
    new FrenchWord(
      'anneau',
      {
        value:
          'A ring with a chaton — the claw setting a stone sits in — and the stone in it, standing on the hoop in chief. The stone takes the hoop’s tincture where the blazon names it none.',
        sources: [blasonArmoiries('Annelet')],
      },
      { plural: 'anneaux', defaultAttribute: Attribute.stoned }
    ),
  ],
  [ChargeType.billet]: new FrenchWord(
    'billette',
    {
      value:
        'An upright rectangle, twice as tall as it is wide. The name is the little billet — a note, or a log.',
      sources: [blasonArmoiries('Billette')],
    },
    { isFeminine: true }
  ),
  // French names the modified lozenge twice over as English does, and keeps the
  // genders apart: la macle and le rustre. Each says what was done to the charge
  // by being the word it is, so nothing is written after it.
  [ChargeType.lozenge]: [
    new FrenchWord(
      'losange',
      {
        value:
          'A diamond standing on one of its points, taller than it is wide. Set square it would be a square; laid on its side it would be something else again. Blazon kept the word feminine where modern French went masculine, so it is read under either article. Vidée or percée it has a name of its own, so this word is the plain figure.',
        sources: [blasonArmoiries('Losange')],
      },
      {
        isFeminine: true,
        acceptsBothGender: true,
      }
    ),
    new FrenchWord(
      'macle',
      {
        value:
          'A losange vidée: the middle taken out, and the field showing through the outline. Vidée by being a macle, so the blazon writes nothing after it.',
        sources: [blasonArmoiries('Macle')],
      },
      { isFeminine: true, defaultModifier: Modifier.voided }
    ),
    new FrenchWord(
      'rustre',
      {
        value:
          'A losange percée: a round hole punched through the middle, the rest of the figure left as it was. It is not the macle, which keeps nothing but its outline. Masculine, where the macle and the losange are feminine.',
        sources: [blasonArmoiries('Rustre')],
      },
      { defaultModifier: Modifier.pierced }
    ),
  ],
  [ChargeType.roundel]: [
    new FrenchWord(
      'besant',
      {
        value:
          'A plain disc borne in metal, named for the gold coin of Byzantium: gold by being a besant, so nothing is written after it where the blazon means gold. It answers for either metal, and for a disc cut from a fur.',
        sources: [blasonArmoiries('Besant')],
      },
      {
        allowedTinctures: [...METALS, ...PELTS],
        defaultTincture: Metals.or,
      }
    ),
    new FrenchWord(
      'tourteau',
      {
        value:
          'A plain disc borne in colour, named for the cake. No one colour is a tourteau’s own, so it is owed its tincture every time it is borne.',
        sources: [blasonArmoiries('Tourteau')],
      },
      {
        plural: 'tourteaux',
        allowedTinctures: [...COLOURS, ...PELTS],
      }
    ),
  ],
  [ChargeType.goutte]: new FrenchWord(
    'goutte',
    {
      value:
        'A drop, point upwards: a pear-shape drawn out to a point, with the sides curving in before they swell. Heraldry names the liquid where it can — goutté d’eau for the silver drops, de sang for the red — which is a vocabulary of waters and bloods this does not read, so a field sown with them is sown in as many words.',
      sources: [blasonArmoiries('Goutte, goutté', 'goutte')],
    },
    { isFeminine: true }
  ),
  // "Sa figuration ordinaire comporte cinq pointes que l'on appelle rais", which
  // is the number English understands of a mullet too, so the one figure serves
  // both tongues and neither counts the rays.
  // The star is named twice as well, and the second name is a thing rather than a
  // star: a molette is the rowel of a spur, which is what a pierced star is a
  // picture of. English has no word for it and blazons the star and the piercing
  // separately.
  [ChargeType.mullet]: [
    new FrenchWord(
      'étoile',
      {
        value:
          'A star of five straight rays, which the dictionaries call rais. Five is understood wherever the blazon counts none. The rays are straight: drawn wavy, and of six, the figure would be another one altogether. Percée it is a molette, so this word is the plain star and the vidée one.',
        sources: [blasonArmoiries('Étoile')],
      },
      { isFeminine: true }
    ),
    new FrenchWord(
      'molette',
      {
        value:
          'An étoile percée: a star with a round hole through the middle, which is the rowel of a spur — a molette d’éperon. Pierced by being a molette, so the blazon writes nothing after it.',
        sources: [blasonArmoiries('Molette d’éperon', 'molette-d-eperon')],
      },
      { isFeminine: true, defaultModifier: Modifier.pierced }
    ),
  ],
  // The lily, spelled four ways by armorials that agree about everything else:
  // with the hyphens or without, and ending in either letter. All four are read
  // and the first is written, which is how the armorials here spell it.
  //
  // "De" inside the name is the same word the grammar reads as an article
  // everywhere else; what tells them apart is that this one has a name around it.
  [ChargeType.fleurDeLis]: new FrenchWord(
    'fleur de lys',
    {
      value:
        'The lily, not as it grows but as the smiths forged it: a middle petal rising to a point, two falling away either side, and a band across the three. Armorials spell it four ways, with the hyphens or without and ending in either letter, and all four are read.',
      sources: [blasonArmoiries('Fleur-de-lys')],
    },
    {
      plural: 'fleurs de lys',
      isFeminine: true,
      alternateWording: {
        'fleur-de-lys': { plural: 'fleurs-de-lys' },
        'fleur de lis': { plural: 'fleurs de lis' },
        'fleur-de-lis': { plural: 'fleurs-de-lis' },
      },
    }
  ),
  // The little cross, where the croix is the band laid across the shield. One
  // word where English needs two, French having made a noun of the small one.
  [ChargeType.crossCouped]: new FrenchWord(
    'croisette',
    {
      value:
        'The little cross: four equal arms of equal length, stopping short of every edge, where the croix is laid across the whole shield.',
      sources: [blasonArmoiries('Croisette')],
    },
    { isFeminine: true }
  ),
  [ChargeType.crescent]: new FrenchWord('croissant', {
    value:
      'A half-moon with the horns uppermost, which is where a croissant’s horns stand unless a blazon says otherwise — and no blazon can say otherwise here, the increscent and the decrescent being turnings this does not read.',
    sources: [blasonArmoiries('Croissant')],
  }),
};
