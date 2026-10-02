import { Modifier } from '../../../../../domain/models/Modifier';
import { hollowRectangle, piercedRectangle, rectangle } from '../../shapes/rectangle';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';

/** A billet is a rectangle standing on end, half as wide as it is tall. */
const WIDE = 0.5;

/**
 * How much of a voided billet is the line rather than the field showing through
 * it, reckoned across the narrow way.
 *
 * It is the annulet's own proportion, measured the same way: what a reader
 * should see is one weight of line throughout the drawing, and a band reckoned
 * off the height would leave a billet with barely a hole in it.
 */
const BAND = 0.22;

/**
 * How wide the hole in a pierced billet is, against the room the figure has for
 * one.
 *
 * Half of it, which is every pierced charge's proportion: what is pierced keeps
 * its shape and loses a bite out of the middle, where what is voided keeps
 * nothing but its outline, so the hole has to leave plainly more charge than
 * hole. The room is the distance from the middle to the nearest side, which for
 * a billet is half its width — reckoned across rather than down for the same
 * reason the band is, the billet standing twice as tall as it is wide.
 */
const HOLE = 0.5;

/** An upright rectangle: the little billet, a note or a log. */
export const billet: ChargeFigure = charge(
  ({ x, y, size }) => {
    const across = Math.round(size * WIDE);
    return rectangle(x - Math.round(across / 2), y - Math.round(size / 2), across, size);
  },
  {
    modified: {
      [Modifier.voided]: ({ x, y, size }) => {
        const across = Math.round(size * WIDE);
        return hollowRectangle(
          x - Math.round(across / 2),
          y - Math.round(size / 2),
          across,
          size,
          Math.round(across * BAND)
        );
      },
      [Modifier.pierced]: ({ x, y, size }) => {
        const across = Math.round(size * WIDE);
        return piercedRectangle(
          x - Math.round(across / 2),
          y - Math.round(size / 2),
          across,
          size,
          Math.round((across * HOLE) / 2)
        );
      },
    },
  }
);
