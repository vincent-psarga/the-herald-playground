import { corners, part } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut from sinister chief to dexter base, which is the bend's line
 * mirrored. The half in chief is the one that reaches the top of the field, as
 * it is there.
 */
export const bendSinister: DivisionFigure = {
  parts: (frame) => {
    const { width, height } = frame;
    const across = width / 2;
    const down = height / 2;
    return [
      part(
        frame,
        corners([
          [0, 0],
          [width, 0],
          [0, height],
        ]),
        [0, 0, across, down]
      ),
      part(
        frame,
        corners([
          [width, 0],
          [width, height],
          [0, height],
        ]),
        [across, down, across, down]
      ),
    ];
  },
};
