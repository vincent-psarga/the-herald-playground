import { Shape } from './Shape';
import { placed } from './path';

/**
 * A tear: a round foot with a point drawn out of the top of it and bent over,
 * "la partie supérieure en pointe, devient ondoyante, s'élargit et se termine en
 * rond".
 *
 * It is not the drop, and the difference is where the wave is. A drop falls
 * straight to its point and keeps its flanks either side of it; a tear keeps a
 * foot all but circular and sends a slender tail up out of it, necking in and
 * hooking over at the tip. So the two are told apart at the top and not at the
 * bottom, which is why they are two shapes here and not one shape twice.
 *
 * Drawn about its own centre in a box one unit across and one tall, as the drop
 * is, so that whatever places it need only say where and how big.
 */
const TEAR =
  'M0.1 -0.5' +
  // Down the sinister edge of the stem: the tip hooks over to one side and the
  // stem beneath it leans back to the other. That turn is the wave.
  ' C0.02 -0.44 -0.02 -0.38 -0.01 -0.3' +
  ' C0 -0.22 0.08 -0.16 0.17 -0.12' +
  // Out of the stem into the shoulder, and on round the foot, which is a circle
  // but for where the stem leaves it.
  ' C0.26 -0.06 0.31 0.03 0.31 0.19' +
  ' C0.31 0.36 0.17 0.5 0 0.5' +
  ' C-0.17 0.5 -0.31 0.36 -0.31 0.19' +
  // And back up the dexter edge, the foot narrowing into the stem and the stem
  // leaning after the tip: the same wave, read the other way.
  ' C-0.31 0.05 -0.24 -0.06 -0.15 -0.13' +
  ' C-0.11 -0.19 -0.1 -0.26 -0.09 -0.32' +
  ' C-0.08 -0.4 0 -0.45 0.1 -0.5 Z';

/** A tear about a centre, standing that many units tall. */
export const tear = (x: number, y: number, size: number): Shape => placed(TEAR, x, y, size);
