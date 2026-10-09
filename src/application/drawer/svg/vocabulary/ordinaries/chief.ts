import { rectangle } from '../../shapes/rectangle';
import { cutAcross } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** A chief takes a third of the shield, as every single band does. */
const DEEP = 80;

/**
 * The top of the shield itself rather than a band laid anywhere on it, which is
 * why there is one of them however many a blazon asks for.
 */
export const chief: OrdinaryFigure = {
  shapes: ({ width }) => [rectangle(0, 0, width, DEEP)],
  // Compony, cut across from dexter to sinister as a fess is, the first compon
  // at dexter.
  compons: (frame, _, pieces) =>
    cutAcross(frame.encloses, [0, DEEP / 2], [frame.width, DEEP / 2], DEEP / 2, pieces),
};
