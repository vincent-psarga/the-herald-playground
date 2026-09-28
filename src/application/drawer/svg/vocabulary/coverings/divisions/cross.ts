import { boxed } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut down the middle and straight across at once, into four quarters
 * ranked along the chief and then along the base: dexter chief, sinister chief,
 * dexter base, sinister base. So the quarters ranked 1 and 4 stand corner to
 * corner, which is what puts one tincture in both of them.
 *
 * The lines are drawn where the parti and the coupé draw theirs, this being
 * those two cuts made together rather than a cut of its own — so a shield whose
 * middle or whose waist moves moves all three of them at once.
 *
 * Each quarter is a box, as the halves of a straight cut are, and gives what it
 * bears a box's room: a charge laid in a quarter is drawn to the quarter and not
 * to the field, which is the whole reason a quarter is a part rather than a
 * shape.
 */
export const cross: DivisionFigure = {
  parts: (frame) => {
    const across = frame.width / 2;
    const down = frame.height / 2;
    return [
      boxed(frame, [0, 0, across, down]),
      boxed(frame, [across, 0, across, down]),
      boxed(frame, [0, down, across, down]),
      boxed(frame, [across, down, across, down]),
    ];
  },
};
