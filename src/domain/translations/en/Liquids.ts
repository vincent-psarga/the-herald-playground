import { ChargeType } from '../../models/Charge';
import { Colours, Furs, Metals } from '../../models/Tinctures';
import { Liquids } from '../Liquids';
import { parker } from '../Sources';
import { FrenchWord } from '../fr/FrenchWord';

// Only the drop is poured. The liquids are what the drop is a drop of, and a
// band or a lozenge is a drop of nothing.
const DROPS = [ChargeType.goutte];

/**
 * English pours a drop in French. Parker gives the drops "a distinct term ... for
 * each, though this was probably of late introduction":
 *
 *   When argent, gutté d'eau: representing drops of water.
 *   When or, gutté d'or or auré: representing drops of gold.
 *   When azure, gutté de larmes: representing tears.
 *   When sable, gutté de poix: representing drops of pitch.
 *   When gules, gutté de sang: representing drops of blood.
 *   When vert, gutté d'huile, or d'olive: representing drops of oil.
 *
 * The words are French and keep their French article, eliding it before a vowel
 * and before the mute h of huile, so each is a French word even here. The same
 * words stand after drops borne rather than sown — "gouttes de sang", "gouttes
 * d'or" — which is why they are said of the drop and not of the strewing.
 *
 * Auré is left out: it is another word, an adjective standing for the whole
 * phrase, and no armorial here writes it. Purpure is poured with nothing, Parker
 * naming no liquid for it, and the furs are not liquids at all.
 */
export const EnglishLiquids: Liquids<FrenchWord> = {
  [Metals.or]: new FrenchWord(
    'or',
    {
      value: 'Gold, as what a drop is a drop of: gutté d’or, gouttes d’or.',
      sources: [parker('Gouttes')],
    },
    { saidOf: DROPS }
  ),
  [Metals.argent]: new FrenchWord(
    'eau',
    {
      value: 'Water: drops argent. Gutté d’eau.',
      sources: [parker('Gouttes')],
    },
    { saidOf: DROPS }
  ),
  [Colours.azure]: new FrenchWord(
    'larmes',
    {
      value:
        'Tears: drops azure. Gutté de larmes. The drops are still gouttes; the larme is another figure.',
      sources: [parker('Gouttes')],
    },
    { saidOf: DROPS }
  ),
  [Colours.gules]: new FrenchWord(
    'sang',
    {
      value: 'Blood: drops gules. Gutté de sang, gouttes de sang.',
      sources: [parker('Gouttes')],
    },
    { saidOf: DROPS }
  ),
  [Colours.sable]: new FrenchWord(
    'poix',
    {
      value: 'Pitch: drops sable. Gutté de poix.',
      sources: [parker('Gouttes')],
    },
    { saidOf: DROPS }
  ),
  // Two liquids for the one tincture: Parker writes "d'huile, or d'olive", and
  // the oil comes first and is the one written back.
  [Colours.vert]: [
    new FrenchWord(
      'huile',
      {
        value: 'Oil: drops vert. Gutté d’huile: the h is mute, so the article elides.',
        sources: [parker('Gouttes')],
      },
      { saidOf: DROPS, needsElision: true }
    ),
    new FrenchWord(
      'olive',
      {
        value: 'Olive oil: drops vert. Gutté d’olive.',
        sources: [parker('Gouttes')],
      },
      { saidOf: DROPS }
    ),
  ],
  [Colours.purpure]: undefined,
  [Furs.ermine]: undefined,
  [Furs.vair]: undefined,
};
