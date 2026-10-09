import { spaced } from '../../painting/arrange';
import { inBend } from '../../shapes/bands';
import { Point, stripsAlong } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/**
 * The room the diagonals share, measured across the top edge of the field. It is
 * wider than the field because a diagonal crosses it at a slant: a single bend
 * takes the middle third of this, which is the third of the field it should be.
 */
export const DIAGONALS = 240;

/** How finely the length of a bend is searched for where the shield shows it. */
const STEPS = 400;

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
  compons: (frame, count, pieces) =>
    spaced(count, -DIAGONALS / 2, DIAGONALS).flatMap(([at, span]) => {
      const along = (step: number): Point => [
        at + span / 2 + (frame.width * step) / STEPS,
        (frame.height * step) / STEPS,
      ];
      const shown: Point[] = [];
      for (let step = 0; step <= STEPS; step += 1) {
        const point = along(step);
        if (frame.encloses(...point)) {
          shown.push(point);
        }
      }
      return shown.length < 2 ? [] : stripsAlong(shown[0], shown[shown.length - 1], pieces);
    }),
};
