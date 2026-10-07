import { ChargeType } from '../../models/Charge';
import { Modifier } from '../../models/Modifier';
import { Colours, Metals } from '../../models/Tinctures';
import { parker } from '../Sources';
import { Translation } from '../Translation';
import { Word } from '../Word';

// English names the first three after the things they are pictures of, and
// spells them as the armorials do. The annulet is the first term in the
// vocabulary to begin on a vowel, so it is the first to be borne as "an" rather
// than "a".
//
// The roundel is the odd one: English gives the disc a name of its own for every
// tincture it may be drawn in, each named after a round thing of that colour —
// the gold coin of Byzantium, a silver plate, a red cake, a blue bruise, a black
// shot, a green apple. Each of those names is the tincture as well as the shape,
// so a blazon that writes one need not write the other, and a blazon that writes
// both must write the one the name already means: a besant is never argent.
//
// The plain "roundel" keeps none of that, and is the word left for the tinctures
// English gave no name to — the furs — and for a blazon that would rather say
// the tincture out loud.
export const EnglishChargeType: Translation<ChargeType> = {
  [ChargeType.annulet]: new Word('annulet', {
    value:
      'A plain ring. What it encloses is the field showing through, not its own tincture, which is what makes it an annulet rather than a roundel.',
    sources: [parker('Annulet')],
  }),
  [ChargeType.billet]: new Word('billet', {
    value:
      'An upright rectangle, twice as tall as it is wide. The name is the little billet — a note, or a log.',
    sources: [parker('Billet')],
  }),
  // The lozenge is the other charge English names more than one way, and it
  // names the modified figures rather than the tinctures: a voided one is a
  // mascle and a pierced one a rustre. Each of those names says what was done to
  // the charge as well as which charge it is, so a blazon that writes one need
  // not write the modifier, and a blazon that writes both must write the one the
  // name already means — a mascle is never pierced.
  //
  // The pierced mullet English leaves unnamed: molette is the French word, and
  // the English cognate molet is an old spelling of the mullet itself rather
  // than of the pierced one. So a pierced star is blazoned in the ordinary way,
  // which is what a tongue with no name for a figure does.
  [ChargeType.lozenge]: [
    new Word(
      'lozenge',
      {
        value:
          'A diamond standing on one of its points, taller than it is wide. Set square it would be a square; laid on its side it would be something else again. Voided or pierced it has a name of its own, so this word is the plain figure.',
        sources: [parker('Lozenge')],
      },
      { plural: 'lozenges' }
    ),
    new Word(
      'mascle',
      {
        value:
          'A lozenge voided: the middle taken out, and the field showing through the outline. Voided by being a mascle, so the blazon writes no modifier after it.',
        sources: [parker('Mascle')],
      },
      { defaultModifier: Modifier.voided }
    ),
    new Word(
      'rustre',
      {
        value:
          'A lozenge pierced: a round hole punched through the middle, the rest of the figure left as it was. It is not the mascle, which keeps nothing but its outline.',
        sources: [parker('Rustre')],
      },
      { defaultModifier: Modifier.pierced }
    ),
  ],
  [ChargeType.roundel]: [
    new Word('roundel', {
      value:
        'A plain disc, named without its tincture. English keeps a name apiece for the colours it is drawn in, so this word is what is left for the tinctures it named none for — the furs — and for a blazon that would rather say the tincture out loud. Written in a tincture that has its own name, it comes back under that name.',
      sources: [parker('Roundles')],
    }),
    // The commoner spelling is the z, and the s is the one written back, French
    // calling the same coin a besant.
    new Word(
      'besant',
      {
        value:
          'A plain disc borne or, named for the gold coin of Byzantium: gold by being a besant, so the blazon writes no tincture after it.',
        sources: [parker('Bezant')],
      },
      { defaultTincture: Metals.or, alternateWording: { bezant: {} } }
    ),
    new Word(
      'plate',
      {
        value:
          'A plain disc borne argent, named for the silver plate. The name says the tincture, so the blazon does not.',
        sources: [parker('Plates')],
      },
      { defaultTincture: Metals.argent }
    ),
    new Word(
      'torteau',
      {
        value:
          'A plain disc borne gules, named for the red cake. The name says the tincture, so the blazon does not.',
        sources: [parker('Torteau')],
      },
      { plural: 'torteaux', defaultTincture: Colours.gules }
    ),
    new Word(
      'hurt',
      {
        value:
          'A plain disc borne azure, named for a bruise. The name says the tincture, so the blazon does not.',
        sources: [parker('Hurt')],
      },
      { defaultTincture: Colours.azure }
    ),
    new Word(
      'pellet',
      {
        value:
          'A plain disc borne sable, named for a cannon shot. The name says the tincture, so the blazon does not.',
        sources: [parker('Pellet')],
      },
      { defaultTincture: Colours.sable }
    ),
    new Word(
      'pomme',
      {
        value:
          'A plain disc borne vert, named for an apple. The name says the tincture, so the blazon does not.',
        sources: [parker('Pomeis')],
      },
      { defaultTincture: Colours.vert }
    ),
    // "An heraldic term used for the roundle, when it is of the tincture of
    // purpure ... It is scarcely over used."
    new Word(
      'golpe',
      {
        value:
          'A plain disc borne purpure, named, Parker supposes, for an old Spanish word for a wound. The name says the tincture, so the blazon does not.',
        sources: [parker('Golpe')],
      },
      { defaultTincture: Colours.purpure }
    ),
  ],
  // A drop, and a word English took from French whole. Parker spells the charge
  // goutte and the field it is sown over gutté or gutty.
  [ChargeType.goutte]: new Word('goutte', {
    value:
      'A drop, point upwards: a pear-shape drawn out to a point, with the sides curving in before they swell. Its tincture is often named by its liquid: gouttes de sang are gules.',
    sources: [parker('Gouttes')],
  }),
  // The five-pointed star of the spur rowel. "It usually has five points, and
  // this number is always to be understood when no other is mentioned."
  [ChargeType.mullet]: new Word('mullet', {
    value:
      'A star of five straight rays, the rowel of a spur. Five is understood wherever the blazon counts none. It is not the estoile, which has six rays and draws them wavy: where the rays are straight the figure is a mullet, whatever its name sounds like.',
    sources: [parker('Mullet')],
  }),
  // The lily. English keeps the French name and hyphenates it, and the plural
  // is French too — the flowers are several, not the lily.
  //
  // The hyphens are not settled and neither is the last letter, so the armorials
  // are read however they spell it and written back Parker's way.
  [ChargeType.fleurDeLis]: new Word(
    'fleur-de-lis',
    {
      value:
        'The lily, not as it grows but as the smiths forged it: a middle petal rising to a point, two falling away either side, and a band across the three. The plural counts the flowers rather than the lily — fleurs-de-lis.',
      sources: [parker('Fleur de lis')],
    },
    {
      plural: 'fleurs-de-lis',
      alternateWording: {
        'fleur-de-lys': { plural: 'fleurs-de-lys' },
        'fleur de lis': { plural: 'fleurs de lis' },
        'fleur de lys': { plural: 'fleurs de lys' },
      },
    }
  ),
  // The ordinary's own figure made small, so English names it by the ordinary
  // and says where it stops. Humetty is the older word for couped and is read
  // too; the noun is what pluralises either way.
  //
  // "Crosslet" is not read for it. Wiktionary has that as "a small cross with
  // crossed arms", which is another figure, and a vocabulary that answered to
  // the word would be promising to draw one.
  [ChargeType.crossCouped]: [
    new Word(
      'cross couped',
      {
        value:
          'A cross of four equal arms, small enough to be borne as a charge and stopping short of every edge — which is what couped means. It is not the crosslet, whose arms are themselves crossed.',
        sources: [parker('Couped')],
      },
      { plural: 'crosses couped' }
    ),
    new Word(
      'cross humetty',
      {
        value:
          'A cross of four equal arms, small enough to be borne as a charge and stopping short of every edge. Humetty is the older word for couped.',
        sources: [parker('Humetty')],
      },
      { plural: 'crosses humetty' }
    ),
  ],
  [ChargeType.crescent]: new Word('crescent', {
    value:
      'A half-moon with the horns uppermost, which is where a crescent’s horns stand unless a blazon says otherwise — and no blazon can say otherwise here, the increscent and the decrescent being turnings this does not read.',
    sources: [parker('Crescent')],
  }),
  // The one figure here English has no name of its own for. Parker files
  // "Larmes, or Larmettes" as nothing but a pointer back to his Gouttes, so
  // where French tells the tear from the drop English tells neither from the
  // other, and the word is taken from French whole — which is how goutte came
  // the other way, and the only honest thing a tongue with no word can do.
  //
  // Larmette is left out. Parker names it in the same breath, but it is the
  // little larme, and a word for a smaller figure would promise a drawing this
  // does not draw.
  [ChargeType.larme]: new Word('larme', {
    value:
      'A tear: a round foot with a point drawn out of the top of it and bent over, so that the tail waves where a goutte falls straight to the point it ends in. English names no such figure of its own — Parker files Larmes as nothing but a pointer to his Gouttes — so the word is taken from French whole, as the goutte was taken the other way.',
    sources: [parker('Larmes')],
  }),
};
