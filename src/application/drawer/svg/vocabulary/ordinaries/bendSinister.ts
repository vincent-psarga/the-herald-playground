import { spaced } from '../../painting/arrange';
import { inBendSinister, inBendSinisterCut, inBendSinisterWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';
import { DIAGONALS, squareAcross } from './bend';
import { cutAcross } from '../../shapes/cuts';

/** The mirror of a bend, from sinister chief. */
export const bendSinister: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinister(frame)),
  modified: alongLines((cut) => ({
    shapes: (frame, count) =>
      spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinisterCut(frame, cut)),
    within: (frame, count) =>
      spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinisterWithin(frame, cut)),
  })),
  // Compony, cut as the bend is, the first compon at the chief end.
  compons: (frame, count, pieces) =>
    spaced(count, -DIAGONALS / 2, DIAGONALS).flatMap(([at, span]) =>
      cutAcross(
        frame.encloses,
        [frame.width + at + span / 2, 0],
        [at + span / 2, frame.height],
        squareAcross(frame, span),
        pieces
      )
    ),
};
