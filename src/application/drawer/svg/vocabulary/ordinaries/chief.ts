import { acrossCutBelow } from '../../shapes/bands';
import { rectangle } from '../../shapes/rectangle';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';

/** A chief takes a third of the shield, as every single band does. */
const DEEP = 80;

/**
 * The top of the shield itself rather than a band laid anywhere on it, which is
 * why there is one of them however many a blazon asks for.
 */
export const chief: OrdinaryFigure = {
  shapes: ({ width }) => [rectangle(0, 0, width, DEEP)],
  // One of the two bands with a single free edge, the bordure being the other:
  // its upper edge is the top of the shield, which no blazon modifies, so only
  // the edge along the base is cut and the chief is deeper where a tooth reaches
  // and shallower where a notch does.
  modified: alongLines((cut) => ({ shapes: (frame) => [acrossCutBelow(frame, cut)([0, DEEP])] })),
};
