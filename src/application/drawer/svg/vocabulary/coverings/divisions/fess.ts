import { boxed } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/** The field cut straight across the waist: the half in chief first. */
export const fess: DivisionFigure = {
  parts: (frame) => {
    const half = frame.height / 2;
    return [boxed(frame, [0, 0, frame.width, half]), boxed(frame, [0, half, frame.width, half])];
  },
};
