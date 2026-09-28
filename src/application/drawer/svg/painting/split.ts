import { Frame, Ink, Painter } from '../Ground';
import { Shape } from '../shapes/Shape';
import { inked } from './inked';

/**
 * The ground cut in two, each half in an ink of its own.
 *
 * The halves are drawn past the edges they meet and left to the clip path, so
 * the line keeps its own angle instead of being fitted to whatever curve the
 * frame has.
 *
 * Each half is outlined on its own account rather than the pair together, which
 * is what puts a line along the cut where the colouring draws in marks: the
 * half in base is laid over the half in chief, and its outline over that half's
 * fill.
 */
export const split =
  (halves: (frame: Frame) => readonly [Shape, Shape], first: Ink, second: Ink): Painter =>
  (ground) => {
    const [inChief, inBase] = halves(ground.frame);
    return inked([inChief], first)(ground) + inked([inBase], second)(ground);
  };
