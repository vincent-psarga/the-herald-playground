import { polygon } from './polygon';
import { Shape } from './Shape';

/** A point, as a pair: across, then down. */
export type Point = readonly [x: number, y: number];

/** Far enough that a cut reaches past every edge of any frame drawn here. */
const FAR = 1000;

/**
 * A length cut square across into equal pieces, every other one of them kept:
 * the second, the fourth, and so on, the first being left to whatever lies
 * beneath.
 *
 * Each piece reaches far out to either side of the line, being meant to be cut
 * again to whatever runs along it.
 */
export function stripsAlong(from: Point, to: Point, pieces: number): readonly Shape[] {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy);
  const [sideX, sideY] = [(-dy / length) * FAR, (dx / length) * FAR];
  const at = (piece: number): Point => [
    from[0] + (dx * piece) / pieces,
    from[1] + (dy * piece) / pieces,
  ];
  const kept: Shape[] = [];
  for (let piece = 1; piece < pieces; piece += 2) {
    const [[x0, y0], [x1, y1]] = [at(piece), at(piece + 1)];
    kept.push(
      polygon(
        `${x0 + sideX},${y0 + sideY} ${x1 + sideX},${y1 + sideY} ` +
          `${x1 - sideX},${y1 - sideY} ${x0 - sideX},${y0 - sideY}`
      )
    );
  }
  return kept;
}

/**
 * The turn about a point cut into equal wedges, every other one of them kept:
 * the second, the fourth, and so on, counted from straight up and turning to
 * the left, the first being left to whatever lies beneath.
 *
 * Each wedge reaches far out from the point, being meant to be cut again to
 * whatever runs round it.
 */
export function wedgesAround([x, y]: Point, pieces: number): readonly Shape[] {
  const towards = (piece: number): Point => {
    const angle = -Math.PI / 2 - (2 * Math.PI * piece) / pieces;
    return [x + Math.cos(angle) * FAR, y + Math.sin(angle) * FAR];
  };
  const kept: Shape[] = [];
  for (let piece = 1; piece < pieces; piece += 2) {
    const [[x0, y0], [x1, y1]] = [towards(piece), towards(piece + 1)];
    kept.push(polygon(`${x},${y} ${x0},${y0} ${x1},${y1}`));
  }
  return kept;
}
