import { Colours, Furs, Metals, Tincture } from '../../../../../domain/models/Tinctures';
import { Ink } from '../../Ground';
import { argent } from './metals/argent';
import { or } from './metals/or';
import { azure } from './colors/azure';
import { gules } from './colors/gules';
import { sable } from './colors/sable';
import { vert } from './colors/vert';
import { purpure } from './colors/purpure';
import { tincture } from './paint';

/**
 * What each tincture is painted with. Being keyed on Tincture, a tincture added
 * to the vocabulary breaks this until it is given one.
 */
export const INKS: Record<Tincture, Ink> = {
  [Metals.or]: or,
  [Metals.argent]: argent,
  [Colours.azure]: azure,
  [Colours.gules]: gules,
  [Colours.sable]: sable,
  [Colours.vert]: vert,
  [Colours.purpure]: purpure,
  // A fur is drawn rather than painted, so its ink is the pelt the drawer cuts
  // from the pair it is understood to have — see furs/ermine.ts and furs/vair.ts
  // — rather than a shade the colouring was asked for.
  [Furs.ermine]: tincture(Furs.ermine),
  [Furs.vair]: tincture(Furs.vair),
};
