import { spaced } from '../../painting/arrange';
import { down } from '../../shapes/bands';
import { cutAcross } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** A band straight down the middle, a third of the shield. */
export const pale: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.width).map(down(frame)),
  // Compony, cut across from chief to base, the first compon in chief.
  compons: (frame, count, pieces) =>
    spaced(count, 0, frame.width).flatMap(([at, span]) =>
      cutAcross(frame.encloses, [at + span / 2, 0], [at + span / 2, frame.height], span / 2, pieces)
    ),
};
