import { spaced } from '../../painting/arrange';
import { down, downCut, downWithin } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';
import { cutAcross } from '../../shapes/cuts';

/** A band straight down the middle, a third of the shield. */
export const pale: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.width).map(down(frame)),
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, 0, frame.width).map(downCut(frame, cut)),
    within: (frame, count) => spaced(count, 0, frame.width).map(downWithin(frame, cut)),
  })),
  // Compony, cut across from chief to base, the first compon in chief.
  compons: (frame, count, pieces) =>
    spaced(count, 0, frame.width).flatMap(([at, span]) =>
      cutAcross(frame.encloses, [at + span / 2, 0], [at + span / 2, frame.height], span, pieces)
    ),
};
