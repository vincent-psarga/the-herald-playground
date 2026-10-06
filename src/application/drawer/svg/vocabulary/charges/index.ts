import { ChargeType } from '../../../../../domain/models/Charge';
import { ChargeFigure } from '../Figures';
import { annulet } from './annulet';
import { billet } from './billet';
import { crescent } from './crescent';
import { crossCouped } from './crossCouped';
import { fleurDeLis } from './fleurDeLis';
import { goutte } from './goutte';
import { larme } from './larme';
import { lion } from './lion';
import { lozenge } from './lozenge';
import { mullet } from './mullet';
import { roundel } from './roundel';

/**
 * The shape each charge is drawn as, wherever it is put: at the places and the
 * size a count was given, or sown small over the whole field.
 *
 * Being keyed on ChargeType, a charge added to the vocabulary breaks this until
 * it is given a shape.
 */
export const CHARGES: Record<ChargeType, ChargeFigure> = {
  [ChargeType.annulet]: annulet,
  [ChargeType.billet]: billet,
  [ChargeType.lozenge]: lozenge,
  [ChargeType.roundel]: roundel,
  [ChargeType.goutte]: goutte,
  [ChargeType.mullet]: mullet,
  [ChargeType.fleurDeLis]: fleurDeLis,
  [ChargeType.crossCouped]: crossCouped,
  [ChargeType.crescent]: crescent,
  [ChargeType.larme]: larme,
  [ChargeType.lion]: lion,
};
