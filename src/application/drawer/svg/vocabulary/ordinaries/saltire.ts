import { inBend, inBendSinister } from '../../shapes/bands';
import { cutFromTheMeeting } from '../../shapes/cuts';
import { squareAcross } from './bend';
import { OrdinaryFigure } from '../Figures';

/** Limbs that cross are narrower than a band that does not, being two. */
const LIMB = 26;

/** The two diagonals crossing, which are one charge and not two bands. */
export const saltire: OrdinaryFigure = {
  shapes: (frame) => [inBend(frame)([-LIMB, LIMB * 2]), inBendSinister(frame)([-LIMB, LIMB * 2])],
  // Compony as the cross is, the middle one compon and each limb cut across from
  // it out to the edge. The limbs are measured across the top edge, so their
  // width square across them is narrower by the slant.
  compons: (frame, _, pieces) => {
    const { width, height } = frame;
    const halfWidth = squareAcross(frame, LIMB * 2) / 2;
    return cutFromTheMeeting(
      frame.encloses,
      [width / 2, height / 2],
      [
        { towards: [-width / 2, -height / 2], halfWidth },
        { towards: [(width * 3) / 2, -height / 2], halfWidth },
        { towards: [(width * 3) / 2, (height * 3) / 2], halfWidth },
        { towards: [-width / 2, (height * 3) / 2], halfWidth },
      ],
      pieces
    );
  },
};
