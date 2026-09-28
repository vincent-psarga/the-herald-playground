import { all } from '../../../shapes/Shape';
import { rectangle } from '../../../shapes/rectangle';
import { DivisionFigure } from '../../Figures';

/**
 * The field cut down the middle and straight across at once, into four quarters
 * numbered from dexter chief: the first tincture takes the first and the fourth,
 * which stand corner to corner, and the second takes the two between them.
 *
 * The lines are drawn where the parti and the coupé draw theirs, this being
 * those two cuts made together rather than a cut of its own — so a shield whose
 * middle or whose waist moves moves all three of them at once.
 *
 * Each tincture's two quarters are handed over as one shape rather than two,
 * which is what the painting wants: shapes painted alike are outlined together,
 * so the line is left round the pair and not drawn through the point where they
 * touch.
 */
export const cross: DivisionFigure = {
  halves: ({ width, height }) => [
    all([
      rectangle(0, 0, width / 2, height / 2),
      rectangle(width / 2, height / 2, width / 2, height / 2),
    ]),
    all([
      rectangle(width / 2, 0, width / 2, height / 2),
      rectangle(0, height / 2, width / 2, height / 2),
    ]),
  ],
};
