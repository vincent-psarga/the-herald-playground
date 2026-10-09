import { spaced } from '../../painting/arrange';
import { inBendSinister } from '../../shapes/bands';
import { cutAcross } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';
import { DIAGONALS, squareAcross } from './bend';

/** The mirror of a bend, from sinister chief. */
export const bendSinister: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendSinister(frame)),
  // Compony, cut as the bend is, the first compon at the chief end.
  compons: (frame, count, pieces) =>
    spaced(count, -DIAGONALS / 2, DIAGONALS).flatMap(([at, span]) =>
      cutAcross(
        frame.encloses,
        [frame.width + at + span / 2, 0],
        [at + span / 2, frame.height],
        squareAcross(frame, span) / 2,
        pieces
      )
    ),
};
