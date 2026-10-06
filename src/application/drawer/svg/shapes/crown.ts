import { Shape } from './Shape';
import { placed } from './path';

/**
 * A ducal coronet: a circlet with three points rising from it.
 *
 * Which crown a blazon means when it names none is settled by the dictionaries —
 * "this word occurring in blazon without any addition usually implies a ducal
 * coronet without the cap" — so this is the one drawn, and the day a blazon can
 * name another it will want a figure of its own beside this.
 *
 * Three points and not five, because three is what a coronet shows from the
 * front: the circlet is a band seen edge on, and the leaves behind it are hidden
 * by the ones in front. What a jeweller would make of the leaves is lost at the
 * size a beast wears one, so they are drawn as the points they read as.
 *
 * Written about its own centre in a box one unit across, so that whatever places
 * it need only say where and how wide. Its own height follows from the drawing
 * and is about three quarters of that.
 */
const CORONET =
  // The circlet, and up its sinister edge.
  'M-0.5 0.381 L0.5 0.381 L0.5 0.085' +
  // The three points, dipping between them to the rim of the circlet.
  ' L0.33 -0.377 L0.16 0.025' +
  ' L0 -0.381 L-0.16 0.025' +
  ' L-0.33 -0.377 L-0.5 0.085 Z';

/** A ducal coronet about a centre, drawn that many units across. */
export const ducalCoronet = (x: number, y: number, size: number): Shape =>
  placed(CORONET, x, y, size);
