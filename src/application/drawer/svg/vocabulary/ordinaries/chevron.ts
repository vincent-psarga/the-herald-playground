import { spaced } from '../../painting/arrange';
import { RISE, bent } from '../../shapes/bands';
import { Point, cutFromTheMeeting } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** The room the chevrons share, measured down the field from their highest point. */
const CHEVRONS_FROM = 8;
const CHEVRONS = 180;

/** An inverted V, its point towards the chief and its limbs running to the base. */
export const chevron: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, CHEVRONS_FROM, CHEVRONS).map(bent(frame)),
  // Compony, a compon at the point and each limb cut across from there down to
  // where the shield stops showing it.
  compons: (frame, count, pieces) =>
    spaced(count, CHEVRONS_FROM, CHEVRONS).flatMap(([at, span]) => {
      const meeting: Point = [frame.width / 2, at + span / 2];
      // The limbs fall a rise for every half-width they run, so the band's
      // height is cut down by the slant to give its width square across.
      const halfWidth = (span / 2) * (frame.width / 2 / Math.hypot(frame.width / 2, RISE));
      const fall = meeting[1] + 2 * RISE;
      return cutFromTheMeeting(
        frame.encloses,
        meeting,
        [
          { towards: [-frame.width / 2, fall], halfWidth },
          { towards: [(frame.width * 3) / 2, fall], halfWidth },
        ],
        pieces
      );
    }),
};
