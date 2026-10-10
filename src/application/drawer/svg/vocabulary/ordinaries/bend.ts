import { spaced } from '../../painting/arrange';
import { inBend, inBendCut, inBendWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';
import { cutAcross } from '../../shapes/cuts';
import { Frame } from '../../Ground';

/**
 * The room the diagonals share, measured across the top edge of the field. It is
 * wider than the field because a diagonal crosses it at a slant: a single bend
 * takes the middle third of this, which is the third of the field it should be.
 */
export const DIAGONALS = 240;

/**
 * How wide a diagonal band is square across it, given how wide it is along the
 * top edge: narrower by the slant it runs at.
 */
export function squareAcross({ width, height }: Frame, span: number): number {
  return span * (height / Math.hypot(width, height));
}

/**
 * A band from dexter chief to sinister base.
 *
 * Compony, each bend is cut square across its middle line into equal compons
 * over the length of it the shield shows, the first at the chief end: the
 * curve of the base cuts the band off well before the corner the line runs to,
 * and compons measured to the corner would leave the last of them out of
 * sight.
 */
export const bend: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBend(frame)),
  // The teeth are cut sideways, as the band's own width is measured sideways: a
  // bend is drawn by sliding its edges across the field rather than square to
  // itself, and a tooth reckoned otherwise would leave it wider in places.
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendCut(frame, cut)),
    within: (frame, count) =>
      spaced(count, -DIAGONALS / 2, DIAGONALS).map(inBendWithin(frame, cut)),
  })),
  compons: (frame, count, pieces) =>
    spaced(count, -DIAGONALS / 2, DIAGONALS).flatMap(([at, span]) =>
      cutAcross(
        frame.encloses,
        [at + span / 2, 0],
        [frame.width + at + span / 2, frame.height],
        squareAcross(frame, span),
        pieces
      )
    ),
};
