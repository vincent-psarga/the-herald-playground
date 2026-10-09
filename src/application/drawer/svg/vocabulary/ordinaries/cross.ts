import { rectangle } from '../../shapes/rectangle';
import { cutFromTheMeeting } from '../../shapes/cuts';
import { OrdinaryFigure } from '../Figures';

/** Limbs that cross are narrower than a band that does not, being two. */
const ARM = 28;

/**
 * The pale and the fess crossing. One charge for all that it is drawn twice
 * over, which is why a count neither narrows nor spaces it: repeated, a cross
 * becomes crosslets, which are charges strewn on the field.
 */
export const cross: OrdinaryFigure = {
  shapes: ({ width, height }) => [
    rectangle(width / 2 - ARM, 0, ARM * 2, height),
    rectangle(0, height / 2 - ARM, width, ARM * 2),
  ],
  // Nothing: the model gives this band no modified line, so there is no second
  // drawing to hold. See OrdinaryDefinitions for why.
  modified: {},
  // Compony, the middle one compon and each arm cut across from it out to the
  // edge: Rivière de La Mure's cross is "de quatre pièces d'azur et de cinq
  // pièces d'or", the middle and the outer compon of each arm being the one
  // tincture and the four between them the other.
  compons: (frame, _, pieces) => {
    const { width, height } = frame;
    return cutFromTheMeeting(
      frame.encloses,
      [width / 2, height / 2],
      [
        { towards: [width / 2, -height], halfWidth: ARM },
        { towards: [width * 2, height / 2], halfWidth: ARM },
        { towards: [width / 2, height * 2], halfWidth: ARM },
        { towards: [-width, height / 2], halfWidth: ARM },
      ],
      pieces
    );
  },
};
