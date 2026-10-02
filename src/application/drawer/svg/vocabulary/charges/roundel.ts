import { Modifier } from '../../../../../domain/models/Modifier';
import { disc } from '../../shapes/disc';
import { ChargeFigure } from '../Figures';
import { annulet } from './annulet';
import { charge } from './Charge';

/**
 * A plain disc, filled: a besant, a plate, a tourteau, and every other name the
 * armorials gave the same circle for the sake of its tincture.
 *
 * It is drawn to the room a charge is given entire, being round and therefore
 * already narrower than the square it stands in — where a lozenge is drawn a
 * little narrow so as not to look swollen beside one.
 *
 * Voided, it is the annulet, and is drawn as one rather than as some second ring
 * of its own: heraldry says the same thing twice here, and a drawing that said
 * it twice differently would be saying something heraldry does not.
 */
export const roundel: ChargeFigure = charge(({ x, y, size }) => disc(x, y, Math.round(size / 2)), {
  modified: {
    [Modifier.voided]: annulet.at,
  },
});
