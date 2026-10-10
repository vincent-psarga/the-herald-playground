import { Frame } from '../Ground';

const WIDTH = 200;
const HEIGHT = 240;

/** A heater shield, inset far enough that its own outline is not clipped away. */
const SHIELD = 'M6 6 H194 V128 C194 186 150 220 100 234 C50 220 6 186 6 128 Z';

/** Where the straight flanks give way to the curves of the base. */
const FLANKS = 128;

/**
 * How far the sinister curve of the base stands from the middle at a given
 * height — its first curve, the dexter one being the same turned over.
 *
 * The curve's height climbs steadily from the end of the flank to the point,
 * so the place on it at that height is found by halving: thirty halvings put it
 * well inside a hair's breadth.
 */
function halfWidthAt(y: number): number {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = [194, FLANKS, 194, 186, 150, 220, 100, 234];
  const at = (t: number, a: number, b: number, c: number, d: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
  let [low, high] = [0, 1];
  for (let halving = 0; halving < 30; halving += 1) {
    const middle = (low + high) / 2;
    if (at(middle, y0, y1, y2, y3) < y) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return at(low, x0, x1, x2, x3) - WIDTH / 2;
}

/**
 * The frame a whole coat of arms is drawn in.
 *
 * The first four reaches are the path's own numbers. The last two are the
 * furthest a line in bend can be pushed either way and still cross the shield,
 * which the curve of the base decides rather than any corner. What the shield
 * encloses is the path read back: straight flanks, and below them the two
 * curves meeting at the point.
 */
export const SHIELD_FRAME: Frame = {
  width: WIDTH,
  height: HEIGHT,
  path: SHIELD,
  top: 6,
  base: 234,
  dexter: 6,
  sinister: 194,
  bendFrom: -131,
  bendTo: 189,
  encloses: (x, y) =>
    y >= 6 && y <= 234 && Math.abs(x - WIDTH / 2) <= (y <= FLANKS ? WIDTH / 2 - 6 : halfWidthAt(y)),
};
