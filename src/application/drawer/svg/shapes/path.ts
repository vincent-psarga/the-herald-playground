import { Brush, Shape, swelling, swollenBy } from './Shape';
import { Point } from './teeth';

/** A path filled: the whole of whatever it encloses. */
export const filled =
  (path: string): Shape =>
  (brush) =>
    `<path d="${path}" fill="${brush.fill}"${swelling(brush)}/>`;

/**
 * A path drawn about its own origin in a box one unit across, put where it
 * belongs and drawn that many units tall.
 *
 * A figure whose shape is its own — a drop, a lily — is written once at a size
 * that can be read and argued with, and placed by scaling its numbers rather
 * than by wrapping it in a transform. A transform would scale what fills the
 * shape along with the shape, and a figure filled with hatching would have its
 * ruling blown up until the whole figure was one stripe of it.
 *
 * Only M, L, C and Z are written in such a path, and every number in them is a
 * coordinate — x first, y second, over and over, each command taking an even
 * number of them — so placing the figure is counting them.
 */
export const placed = (path: string, x: number, y: number, size: number): Shape => {
  let along = 0;
  return filled(
    path.replace(/-?\d*\.?\d+/g, (number) => {
      const placed = Number(number) * size + (along % 2 === 0 ? x : y);
      along += 1;
      // Tenths: finer than any shield is drawn, and short enough to read.
      return `${Math.round(placed * 10) / 10}`;
    })
  );
};

/**
 * A path drawn as a thick line rather than filled.
 *
 * A stroke straddles the line it follows, so half of one drawn along the edge of
 * a frame falls outside it and is clipped away: what is left is a band of half
 * the asked-for width lying inside the edge, and following it round whatever
 * curve it has — which nothing built out of rectangles would do.
 *
 * A band has no inside for a fill to cover an outline back to, so it is not
 * swollen by a second stroke but drawn the wider by one: the fill laid over it
 * afterwards leaves exactly the two lines either side of the band.
 */
export const stroked =
  (path: string, width: number): Shape =>
  (brush: Brush) =>
    `<path d="${path}" fill="none" stroke="${brush.fill}" stroke-width="${swollenBy(width, brush)}"/>`;

/** How many straight steps a curve is walked in: fine enough that no eye counts them. */
const STEPS = 24;

/**
 * A path read back as the corners it turns, the curves walked in short straight
 * steps.
 *
 * A path is written to be painted, and painting is all most of the drawing asks
 * of it. A band that follows the edge of the shield asks something else: where
 * that edge runs, and which way, so that a line can be drawn a measured distance
 * inside it. The shape is written once, as the path, and this reads it rather
 * than having it written a second time in another form to drift from the first.
 *
 * Only what a frame's own outline is written in is read — M, L, H, V, C and Z,
 * absolute — and anything else is refused by name rather than quietly dropped: a
 * frame whose outline came back short by a curve would be bordered wrongly, and
 * nothing about the drawing would say so.
 */
export function corners(path: string): readonly Point[] {
  // A path is written with its numbers running into the letter before them —
  // "M6 6 H194" — so it is cut into letters and numbers rather than into words.
  const words = path.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
  const walked: Point[] = [];
  let at: Point = [0, 0];
  let word = 0;
  const number = (): number => {
    const read = Number(words[word]);
    word += 1;
    if (Number.isNaN(read)) {
      throw new Error(`A path is read in numbers: "${words[word - 1]}" is not one`);
    }
    return read;
  };
  const reach = (point: Point): void => {
    walked.push(point);
    at = point;
  };
  while (word < words.length) {
    const command = words[word];
    word += 1;
    switch (command) {
      case 'M':
      case 'L':
        reach([number(), number()]);
        break;
      case 'H':
        reach([number(), at[1]]);
        break;
      case 'V':
        reach([at[0], number()]);
        break;
      case 'C': {
        const curve: readonly [Point, Point, Point, Point] = [
          at,
          [number(), number()],
          [number(), number()],
          [number(), number()],
        ];
        for (let step = 1; step <= STEPS; step += 1) {
          reach(bent(curve, step / STEPS));
        }
        break;
      }
      // The closing needs no corner of its own: an outline is closed by being an
      // outline, and repeating the first point would put a step of no length in
      // the middle of it.
      case 'Z':
        break;
      default:
        throw new Error(`A frame's outline is not written with "${command}"`);
    }
  }
  return walked;
}

/** Where a cubic curve has reached, so far of the way along it. */
function bent(
  [[fromX, fromY], [firstX, firstY], [secondX, secondY], [toX, toY]]: readonly [
    Point,
    Point,
    Point,
    Point,
  ],
  along: number
): Point {
  const left = 1 - along;
  const of = (from: number, first: number, second: number, to: number): number =>
    left * left * left * from +
    3 * left * left * along * first +
    3 * left * along * along * second +
    along * along * along * to;
  return [of(fromX, firstX, secondX, toX), of(fromY, firstY, secondY, toY)];
}
