import { corners, part } from '../../../shapes/room';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut corner to corner both ways at once, into four triangles meeting
 * in the middle and ranked as Au blason des armoiries ranks them: "le premier
 * Quartier est en haut, le second à dextre, le troisième à senestre et le
 * quatrième en pointe". So the first and the fourth stand across the middle from
 * each other, as the first and the fourth of a quarterly field do.
 *
 * The lines are the bend's and the bend sinister's, and they meet where those
 * two cross — so the middle is read off them rather than chosen, and a shield
 * whose diagonals move moves all three partitions at once.
 *
 * Each triangle is given the half of the field it is inscribed in, there being
 * no quarter it holds whole: a triangle running the width of the chief and
 * closing to a point in the middle covers half the field and fills none of its
 * boxes. So a charge laid in one is drawn to that half and can reach past the
 * triangle near the corners, where the part's own outline cuts it off — which is
 * what the clip is for, and is the same thing that ends a band at the line.
 */
export const saltire: DivisionFigure = {
  parts: (frame) => {
    const { width, height } = frame;
    const across = width / 2;
    const down = height / 2;
    const middle: readonly [number, number] = [across, down];
    return [
      part(frame, corners([[0, 0], [width, 0], middle]), [0, 0, width, down]),
      part(frame, corners([[0, 0], [0, height], middle]), [0, 0, across, height]),
      part(frame, corners([[width, 0], [width, height], middle]), [across, 0, across, height]),
      part(frame, corners([[0, height], [width, height], middle]), [0, down, width, down]),
    ];
  },
};
