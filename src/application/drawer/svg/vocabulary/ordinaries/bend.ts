import { spaced } from '../../painting/arrange';
import { inBend, inBendCut } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';

/**
 * The room the diagonals share, measured across the top edge of the field. It is
 * wider than the field because a diagonal crosses it at a slant: a single bend
 * takes the middle third of this, which is the third of the field it should be.
 */
export const DIAGONALS = 240;

/** A band from dexter chief to sinister base. */
export const bend: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBend(frame)),
  // The teeth are cut sideways, as the band's own width is measured sideways: a
  // bend is drawn by sliding its edges across the field rather than square to
  // itself, and a tooth reckoned otherwise would leave it wider in places.
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendCut(frame, cut)),
  })),
};
