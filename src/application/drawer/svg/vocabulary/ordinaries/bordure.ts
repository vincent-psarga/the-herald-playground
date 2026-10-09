import { Frame } from '../../Ground';
import { corners, stroked } from '../../shapes/path';
import { Shape, all } from '../../shapes/Shape';
import { Cut, toothedInside } from '../../shapes/teeth';
import { OrdinaryFigure } from '../Figures';
import { alongLines } from '../lines';

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
  modified: alongLines((cut) => ({
    shapes: (frame) => [cutInside(frame, cut)],
    // The band the teeth stand on is the band inside the cut, which is the one
    // thing here that was already being reckoned: a bordure is drawn as that
    // band plus its teeth, so painting the line is simply a matter of laying the
    // band again, in its own tincture, over teeth laid in the line's.
    within: (frame) => [stroked(frame.path, beneathOf(frame, cut) * 2)],
  })),
};

/**
 * The same band with its inner edge cut along a modified line, the outer one
 * being the shield's own and not the band's to cut.
 *
 * It is the one cut figure whose two edges do not answer alike, and the only
 * figure it could be: a bordure is the edge of the shield, so what a blazon
 * modifies is where the band ends and not where it begins. The band is therefore
 * deeper where a tooth reaches and shallower where a notch does, which is what
 * the armorials draw — every other cut band keeps its width, both its edges
 * being free.
 *
 * It is the plain band, drawn shallower, with the teeth laid on it: a stroke
 * follows the curve of the base and miters its own corners, which is the whole
 * reason the plain bordure is one, and the teeth are painted in the same
 * tincture and so simply join it.
 */
function cutInside(frame: Frame, cut: Cut): Shape {
  const { beneath, teeth } = toothedInside(corners(frame.path), frame.width * DEEP, cut);
  return all([stroked(frame.path, beneath * 2), ...teeth]);
}

/** How deep the band beneath the teeth runs, which is where the line notches. */
function beneathOf(frame: Frame, cut: Cut): number {
  return toothedInside(corners(frame.path), frame.width * DEEP, cut).beneath;
}
