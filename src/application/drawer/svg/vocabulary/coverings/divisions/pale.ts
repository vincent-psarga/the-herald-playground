import { boxed } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/** The field cut straight down the middle: the half at dexter first. */
export const pale: DivisionFigure = {
  parts: (frame) => {
    const half = frame.width / 2;
    return [boxed(frame, [0, 0, half, frame.height]), boxed(frame, [half, 0, half, frame.height])];
  },
};
