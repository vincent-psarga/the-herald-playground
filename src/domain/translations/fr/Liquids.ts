import { ChargeType } from '../../models/Charge';
import { Colours, Furs, Metals } from '../../models/Tinctures';
import { Liquids } from '../Liquids';
import { blasonArmoiries } from '../Sources';
import { FrenchWord } from './FrenchWord';

// Only the drop is poured: a band or a lozenge is a drop of nothing.
const DROPS = [ChargeType.goutte];

/**
 * The liquids French names a drop by, which are three and are read without being
 * written.
 *
 * Au blason des armoiries has it that "on doit exprimer l'émail des Gouttes ;
 * quelques auteurs veulent que les Gouttes rouges soient appelées Gouttes de
 * sang ; les noires, gouttes de poix ; les blanches, Gouttes d'eau, etc." So the
 * tincture is what French writes, and the liquids are what some authors write
 * instead: a blazon naming one is understood, and comes back under the tincture.
 * That is why the French writer is given none of these.
 *
 * The three the dictionary names are the three read. Its "etc." is not a list,
 * and the larmes, oils and golds English pours are not taken across on its
 * strength — French keeps larme for a figure of its own.
 */
export const FrenchLiquids: Liquids<FrenchWord> = {
  [Metals.or]: undefined,
  [Metals.argent]: new FrenchWord(
    'eau',
    {
      value: 'Water: gouttes d’argent, named for what they are drops of.',
      sources: [blasonArmoiries('Goutte, goutté', 'goutte')],
    },
    { isFeminine: true, saidOf: DROPS }
  ),
  [Colours.azure]: undefined,
  [Colours.gules]: new FrenchWord(
    'sang',
    {
      value: 'Blood: gouttes de gueules, named for what they are drops of.',
      sources: [blasonArmoiries('Goutte, goutté', 'goutte')],
    },
    { saidOf: DROPS }
  ),
  [Colours.sable]: new FrenchWord(
    'poix',
    {
      value: 'Pitch: gouttes de sable, named for what they are drops of.',
      sources: [blasonArmoiries('Goutte, goutté', 'goutte')],
    },
    { isFeminine: true, saidOf: DROPS }
  ),
  [Colours.vert]: undefined,
  [Colours.purpure]: undefined,
  [Furs.ermine]: undefined,
  [Furs.vair]: undefined,
};
