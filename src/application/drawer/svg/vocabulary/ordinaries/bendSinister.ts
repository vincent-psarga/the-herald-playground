import { spaced } from '../../painting/arrange';
import { inBendSinister, inBendSinisterCut, inBendSinisterWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';
import { DIAGONALS } from './bend';

/** The mirror of a bend, from sinister chief. */
export const bendSinister: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinister(frame)),
  modified: alongLines((cut) => ({
    shapes: (frame, count) =>
      spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinisterCut(frame, cut)),
    within: (frame, count) =>
      spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinisterWithin(frame, cut)),
  })),
};
