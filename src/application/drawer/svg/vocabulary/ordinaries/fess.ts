import { spaced } from '../../painting/arrange';
import { across, acrossCut, acrossWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';

/** A band straight across the middle, a third of the shield. */
export const fess: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.height).map(across(frame)),
  // The band the armorials cut oftenest, and the same band still: it lies where
  // the plain fess lay and keeps its width, its two edges cut alike.
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, 0, frame.height).map(acrossCut(frame, cut)),
    within: (frame, count) => spaced(count, 0, frame.height).map(acrossWithin(frame, cut)),
  })),
};
