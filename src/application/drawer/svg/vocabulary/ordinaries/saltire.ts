import { inBend, inBendSinister } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';

/** Limbs that cross are narrower than a band that does not, being two. */
const LIMB = 26;

/** The two diagonals crossing, which are one charge and not two bands. */
export const saltire: OrdinaryFigure = {
  shapes: (frame) => [inBend(frame)([-LIMB, LIMB * 2]), inBendSinister(frame)([-LIMB, LIMB * 2])],
  // Nothing: the model gives this band no modified line, so there is no second
  // drawing to hold. See OrdinaryDefinitions for why.
  modified: {},
};
