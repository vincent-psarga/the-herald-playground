import { stroked } from '../../shapes/path';
import { wedgesAround } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** How far a bordure reaches in from the edge: an eighth of the field, as armorials draw it. */
const DEEP = 1 / 8;

/**
 * A band following the whole edge of the shield, inside it.
 *
 * It is the frame's own outline drawn as a thick stroke, which the clip path then
 * halves — so the band keeps the asked-for width and follows the curve of the
 * base, which nothing built out of rectangles would do.
 *
 * The bordure crosses the field nowhere: it follows the edge, and a shield has
 * one edge, so there is nothing for a count to narrow or space out.
 */
export const bordure: OrdinaryFigure = {
  shapes: ({ path, width }) => [stroked(path, width * DEEP * 2)],
  // Compony, cut "gyronwise", as Parker has it: into wedges about the middle of
  // the shield, a seam at the middle of the chief and the first compon to its
  // dexter.
  compons: ({ width, top, base }, _, pieces) => wedgesAround([width / 2, (top + base) / 2], pieces),
};
