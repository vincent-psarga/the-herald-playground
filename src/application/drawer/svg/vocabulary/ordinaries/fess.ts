import { spaced } from '../../painting/arrange';
import { across } from '../../shapes/bands';
import { cutAcross } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** A band straight across the middle, a third of the shield. */
export const fess: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.height).map(across(frame)),
  // Compony, cut across from dexter to sinister, the first compon at dexter.
  compons: (frame, count, pieces) =>
    spaced(count, 0, frame.height).flatMap(([at, span]) =>
      cutAcross(frame.encloses, [0, at + span / 2], [frame.width, at + span / 2], span / 2, pieces)
    ),
};
