import { corners, part } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut from dexter chief to sinister base. The half in chief is the
 * triangle on the far side of the line from where it starts, being the one that
 * reaches the top of the field.
 *
 * Each half is given the quarter of the field its own triangle holds whole — the
 * upper at sinister, the lower at dexter — so that what it bears stands where
 * the part actually is rather than in the middle of a field it only half covers.
 */
export const bend: DivisionFigure = {
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
          [width, height],
        ]),
        [across, 0, across, down]
      ),
      part(
        frame,
        corners([
          [0, 0],
          [width, height],
          [0, height],
        ]),
        [0, down, across, down]
      ),
    ];
  },
};
