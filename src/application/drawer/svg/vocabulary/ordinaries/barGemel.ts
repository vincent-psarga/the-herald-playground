import { spaced } from '../../painting/arrange';
import { twinned } from '../../shapes/bands';
import { OrdinaryFigure } from '../Figures';

/**
 * Two narrow bars close together, borne and blazoned as one charge — gemel is
 * twinned.
 *
 * A gemel takes the room of a fess and spends it on two bars, so three of them
 * sit where three fesses would and are drawn as six.
 */
export const barGemel: OrdinaryFigure = {
  shapes: (frame, count) => spaced(count, 0, frame.height).map(twinned(frame)),
  // Nothing: the model gives this band no modified line, so there is no second
  // drawing to hold. See OrdinaryDefinitions for why.
  modified: {},
};
