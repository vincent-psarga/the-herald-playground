import { Modifier } from '../../../../../domain/models/Modifier';
import { diamond, hollowDiamond, piercedDiamond, roomInDiamond } from '../../shapes/diamond';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';

/** A lozenge is a diamond standing on end, and stands a little less narrow than a billet. */
const WIDE = 0.75;

/**
 * How much of a voided lozenge is the line rather than the field showing through
 * it, reckoned across the narrow way — the annulet's own proportion, measured
 * the same way.
 */
const BAND = 0.22;

/**
 * How wide the hole in a pierced lozenge is, against the room the figure has for
 * one: half of it, as every pierced charge is reckoned. The mascle and the
 * rustre are two figures and this is the second of them.
 */
const HOLE = 0.5;

/** How far a lozenge stands across and down, which every drawing of it begins from. */
const spread = (size: number) => ({
  across: Math.round((size * WIDE) / 2),
  tall: Math.round(size / 2),
});

/** A diamond standing on one of its points, taller than it is wide. */
export const lozenge: ChargeFigure = charge(
  ({ x, y, size }) => {
    const { across, tall } = spread(size);
    return diamond(x, y, across, tall);
  },
  {
    modified: {
      [Modifier.voided]: ({ x, y, size }) => {
        const { across, tall } = spread(size);
        return hollowDiamond(x, y, across, tall, Math.round(size * WIDE * BAND));
      },
      [Modifier.pierced]: ({ x, y, size }) => {
        const { across, tall } = spread(size);
        return piercedDiamond(x, y, across, tall, Math.round(roomInDiamond(across, tall) * HOLE));
      },
    },
  }
);
