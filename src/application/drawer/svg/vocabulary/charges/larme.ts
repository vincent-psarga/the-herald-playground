import { tear } from '../../shapes/tear';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';

/**
 * A tear, the tail uppermost. Borne in number oftener than alone — "à trois
 * larmes d'argent" is how the armorials that bear it bear it — and sown over a
 * whole field as readily, which is the drop's habit too.
 */
export const larme: ChargeFigure = charge(({ x, y, size }) => tear(x, y, size));
