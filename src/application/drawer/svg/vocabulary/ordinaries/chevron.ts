import { spaced } from '../../painting/arrange';
import { RISE, bent, bentCut, bentWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';
import { Point, cutFromTheMeeting } from '../../shapes/cuts';

/** The room the chevrons share, measured down the field from their highest point. */
const CHEVRONS_FROM = 8;
const CHEVRONS = 180;

/** An inverted V, its point towards the chief and its limbs running to the base. */
export const chevron: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, CHEVRONS_FROM, CHEVRONS).map(bent(frame)),
  // Both limbs are cut, and the point between them is left where it was: the
  // teeth are counted along each limb rather than along the whole line, so
  // neither limb ends on half a tooth and the chevron keeps its point.
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, CHEVRONS_FROM, CHEVRONS).map(bentCut(frame, cut)),
    within: (frame, count) => spaced(count, CHEVRONS_FROM, CHEVRONS).map(bentWithin(frame, cut)),
  })),
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
          { towards: [-frame.width / 2, fall], halfWidth, reach: halfWidth * 2 },
          { towards: [(frame.width * 3) / 2, fall], halfWidth, reach: halfWidth * 2 },
        ],
        pieces
      );
    }),
};
