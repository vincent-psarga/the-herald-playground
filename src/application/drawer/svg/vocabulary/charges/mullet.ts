import { Modifier } from '../../../../../domain/models/Modifier';
import { hollowStar, piercedStar, roomInStar, star } from '../../shapes/star';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';

/**
 * How many rays the star is drawn with where the blazon counts none.
 *
 * Five, which both tongues understand: "it usually has five points, and this
 * number is always to be understood when no other is mentioned", and the French
 * étoile's "figuration ordinaire comporte cinq pointes". A blazon may name
 * another number, and cannot yet, so nothing here reads one.
 */
const RAYS = 5;

/**
 * How much of a voided star is the line rather than the field showing through
 * it, reckoned off the whole figure.
 *
 * Thinner than every other voided charge, and not for the look of it: a star has
 * a third of the lozenge's room between its sides and its centre, so the
 * annulet's fifth would leave no hole at all. What is drawn instead is the
 * thickest band that still lets the five rays read as rays.
 */
const BAND = 0.08;

/**
 * How wide the hole in a pierced star is, against the room the figure has for
 * one.
 *
 * More of it than any other pierced charge takes, and for the reason its band
 * takes less: a star has a third of the lozenge's room, so a hole reckoned at
 * the others' half of it is a pin-prick that closes up altogether once three
 * stars are borne and drawn small. What is left over the hole is thin, which is
 * what a molette looks like — the rowel of a spur is mostly its points.
 */
const HOLE = 0.7;

/** A star of five straight rays, one of them upright. */
export const mullet: ChargeFigure = charge(
  ({ x, y, size }) => star(x, y, Math.round(size / 2), RAYS),
  {
    modified: {
      [Modifier.voided]: ({ x, y, size }) =>
        hollowStar(x, y, Math.round(size / 2), RAYS, Math.round(size * BAND)),
      [Modifier.pierced]: ({ x, y, size }) => {
        const radius = Math.round(size / 2);
        return piercedStar(x, y, radius, RAYS, Math.round(roomInStar(radius, RAYS) * HOLE));
      },
    },
  }
);
