import { all } from '../../../shapes/Shape';
import { polygon } from '../../../shapes/polygon';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut corner to corner both ways at once, into four triangles meeting
 * at the middle: the first tincture takes the one in chief and the one in base,
 * the second the two at the flanks.
 *
 * The lines are the bend's and the bend sinister's, and they meet where those
 * two cross — so the middle is read off them rather than chosen, and a shield
 * whose diagonals move moves all three partitions at once.
 *
 * Each tincture's two triangles are handed over as one shape, as the quarters of
 * a per cross field are: painted alike and outlined together, so no line is
 * drawn through the point where they touch.
 */
export const saltire: DivisionFigure = {
  halves: ({ width, height }) => {
    const middle = `${width / 2},${height / 2}`;
    return [
      all([
        polygon(`0,0 ${width},0 ${middle}`),
        polygon(`0,${height} ${width},${height} ${middle}`),
      ]),
      all([
        polygon(`0,0 0,${height} ${middle}`),
        polygon(`${width},0 ${width},${height} ${middle}`),
      ]),
    ];
  },
};
