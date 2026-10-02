import { spaced } from '../../painting/arrange';
import { down, downCut } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';

/** A band straight down the middle, a third of the shield. */
export const pale: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.width).map(down(frame)),
  modified: alongLines((cut) => ({
    shapes: (frame, count) => spaced(count, 0, frame.width).map(downCut(frame, cut)),
  })),
};
