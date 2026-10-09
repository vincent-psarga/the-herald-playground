import { polygon } from './polygon';
import { Shape } from './Shape';

/** A point, as a pair: across, then down. */
export type Point = readonly [x: number, y: number];

/** Far enough that a cut reaches past every edge of any frame drawn here. */
const FAR = 1000;

/** How finely a line is searched for the stretch of it a shape shows. */
const STEPS = 400;

/** How a length is cut, beyond how many pieces it is cut into. */
export type Cutting = {
  /**
   * How far each piece reaches to either side of the line. Far past every edge
   * by default, to be cut again to whatever runs along it; a limb that meets
   * others gives its own half-width, so that its pieces stay on it.
   */
  readonly reach?: number;
  /** Whether the first piece is kept, rather than the second. */
  readonly keepFirst?: boolean;
};

/**
 * A length cut square across into equal pieces, every other one of them kept:
 * the second, the fourth, and so on, the first being left to whatever lies
 * beneath — or the first, the third, and so on, where the cutting says so.
 */
export function stripsAlong(
  from: Point,
  to: Point,
  pieces: number,
  { reach = FAR, keepFirst = false }: Cutting = {}
): readonly Shape[] {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy);
  const [sideX, sideY] = [(-dy / length) * reach, (dx / length) * reach];
  const at = (piece: number): Point => [
    from[0] + (dx * piece) / pieces,
    from[1] + (dy * piece) / pieces,
  ];
  const kept: Shape[] = [];
  for (let piece = keepFirst ? 0 : 1; piece < pieces; piece += 2) {
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
 * The stretch of a line a shape shows: from the first point of it the shape
 * encloses to the last, or nothing where it encloses none.
 *
 * Searched rather than solved, the shape being whatever the frame says it is:
 * a heater's base is a pair of curves, and a band running off the shield is
 * cut short by them well before any corner.
 */
export function shownBetween(
  encloses: (x: number, y: number) => boolean,
  from: Point,
  to: Point
): readonly [Point, Point] | undefined {
  const shown: Point[] = [];
  for (let step = 0; step <= STEPS; step += 1) {
    const point: Point = [
      from[0] + ((to[0] - from[0]) * step) / STEPS,
      from[1] + ((to[1] - from[1]) * step) / STEPS,
    ];
    if (encloses(...point)) {
      shown.push(point);
    }
  }
  return shown.length < 2 ? undefined : [shown[0], shown[shown.length - 1]];
}

/**
 * A straight band cut across into equal pieces over the stretch of it a shape
 * shows, the first at the end it is drawn from.
 *
 * The pieces reach no further than the band's own width, so that where several
 * bands are borne the pieces of one are never laid over the next: the outer of
 * three pales is cut short by the base sooner than the middle one, and its
 * compons are shorter for it.
 */
export function cutAcross(
  encloses: (x: number, y: number) => boolean,
  from: Point,
  to: Point,
  halfWidth: number,
  pieces: number
): readonly Shape[] {
  const shown = shownBetween(encloses, from, to);
  return shown === undefined
    ? []
    : stripsAlong(shown[0], shown[1], pieces, { reach: halfWidth + 1 });
}

/** A limb running out from where it meets the others, and how wide it is. */
export type Limb = {
  /** Which way it runs from the meeting, as a point it heads for past the edge. */
  readonly towards: Point;
  /** Half its width, measured square across it. */
  readonly halfWidth: number;
};

/**
 * Limbs meeting at a point, each cut across into equal pieces from where it
 * leaves the others to where the shape stops showing it.
 *
 * Where the limbs meet is one piece of its own — the first, left to whatever
 * lies beneath — and every limb starts with the second: so a cross of nine is
 * the middle and two along each arm. The meeting reaches along each limb as far
 * as the others still cover it, which for limbs square to each other is half
 * their width and for limbs crossing at a slant is further: the overlap of two
 * slanting bands is a lozenge, not a square.
 */
export function cutFromTheMeeting(
  encloses: (x: number, y: number) => boolean,
  meeting: Point,
  limbs: readonly Limb[],
  pieces: number
): readonly Shape[] {
  const each = (pieces - 1) / limbs.length;
  return limbs.flatMap((limb) => {
    const [ux, uy] = unit(meeting, limb.towards);
    const leaves = limbs
      .filter((other) => other !== limb)
      .reduce((furthest, other) => {
        const [vx, vy] = unit(meeting, other.towards);
        const sine = Math.abs(ux * vy - uy * vx);
        const cosine = Math.abs(ux * vx + uy * vy);
        // Limbs running the one line, as a cross's opposite arms do, never
        // cover each other beyond the meeting.
        return sine < 1e-6
          ? furthest
          : Math.max(furthest, (other.halfWidth + limb.halfWidth * cosine) / sine);
      }, 0);
    const from: Point = [meeting[0] + ux * leaves, meeting[1] + uy * leaves];
    const shown = shownBetween(encloses, from, limb.towards);
    return shown === undefined
      ? []
      : stripsAlong(shown[0], shown[1], each, { reach: limb.halfWidth + 1, keepFirst: true });
  });
}

function unit(from: Point, to: Point): Point {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy);
  return [dx / length, dy / length];
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
