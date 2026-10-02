import { Shape } from './Shape';
import { polygon } from './polygon';

/** A corner of a line, or of the outline of something. */
export type Point = readonly [x: number, y: number];

/**
 * How a modified line is cut: how far apart its points stand, measured along the
 * line, and how far its teeth reach across it.
 *
 * The tooth is fixed rather than reckoned off what is being cut, so that a fess,
 * a bend and the edge of the shield are cut with the same teeth — which is what
 * makes a line recognisable wherever it is drawn. What a blazon chose between is
 * exactly these two numbers: a tooth is a triangle, and a triangle is settled by
 * how long it is and how deep.
 *
 * Between them they settle the angle at the point, which is what the dictionaries
 * actually compare: a tooth longer than it is deep comes to a sharp point, and
 * one as long as it is deep comes to a right angle.
 *
 * A line is cut into whole teeth, so the length asked for is rarely the length
 * cut: what is kept is the shape of the tooth rather than its size, and both
 * numbers are scaled together to whatever the line came out at. A vivré cut a
 * tenth short is a right angle still, which it would not be if the depth stood
 * while the length gave way.
 */
export interface Cut {
  /** How far along the line one tooth reaches, which is half of its period. */
  readonly tooth: number;
  /** How far across the line the teeth reach, from the point to the notch. */
  readonly bite: number;
}

/**
 * The small-toothed line — "notched after the manner of dancetty, but with
 * smaller teeth". Half a dozen of them cross the field, which is what the
 * armorials draw.
 */
export const INDENTED: Cut = { tooth: 20, bite: 10 };

/**
 * The same teeth cut larger, and so fewer: three of them cross a fess, which is
 * the count Parker draws and what tells a dancetty from an indented at sight.
 * Deeper than it is long, which brings the point to the acute angle Parker says
 * the armorials usually draw this line with.
 */
export const DANCETTY: Cut = { tooth: 35, bite: 40 };

/**
 * The dancetty's teeth with the angle at the point opened to a right one, which
 * is the vivré: as deep as it is long, which is exactly what makes the angle
 * square.
 *
 * It is the point that is square and not the tooth. Parker's "appearance of
 * rectangular steps" is what a right-angled zigzag looks like when the band it
 * is cut in runs at a slant — on a bend the limbs of each tooth stand upright
 * and flat, and the band reads as a staircase. Across a fess the same cut is a
 * zigzag of right angles and nothing stair-like at all.
 */
export const VIVRE: Cut = { tooth: 35, bite: 35 };

/** The two ways a tooth reaches from a line that runs flat, or from one that stands. */
export const DOWNWARD: Point = [0, 1];
export const SIDEWAYS: Point = [1, 0];

/**
 * The way a tooth reaches when it is cut square to the line it is cut in, which
 * is what a line running neither flat nor upright needs.
 *
 * A diagonal band's own width is measured across the field rather than square to
 * itself, so teeth reckoned the same way would lie along the field and read as
 * steps rather than as teeth. Both edges are pushed alike whichever way is
 * chosen, so the band keeps its width either way; this is the way that looks
 * like the line it is.
 *
 * It comes back as a direction and not a distance, as the other two do: how far
 * the tooth reaches is the cut's to say.
 */
export const square = ([fromX, fromY]: Point, [toX, toY]: Point): Point => {
  const run = Math.hypot(toX - fromX, toY - fromY);
  return [-(toY - fromY) / run, (toX - fromX) / run];
};

/**
 * A line run in teeth rather than straight: every other point along it pushed
 * half a tooth one way and the rest half a tooth the other, so that the teeth
 * stand about the line the band would have had rather than to one side of it.
 *
 * The line is given as the corners it turns, so that a band bent to a point is
 * cut along both its limbs and keeps its point: each limb is cut into an even
 * number of steps, which leaves every corner on the line it was on and lets the
 * teeth carry on past it without a half tooth at the bend.
 *
 * How the tooth reaches is handed in rather than reckoned square to the line,
 * because a band's own width may be measured that way: a bend is drawn by
 * sliding its edges sideways, so its teeth are cut sideways too, and the band
 * keeps the width it would have had.
 */
export function toothed(
  line: readonly Point[],
  [wayX, wayY]: Point,
  { tooth, bite }: Cut
): readonly Point[] {
  const cut: Point[] = [];
  const at = (x: number, y: number, deep: number, point: number): Point => [
    x + wayX * deep * pushed(point),
    y + wayY * deep * pushed(point),
  ];
  for (let corner = 1; corner < line.length; corner += 1) {
    const [fromX, fromY] = line[corner - 1];
    const [toX, toY] = line[corner];
    const run = Math.hypot(toX - fromX, toY - fromY);
    const teeth = Math.max(1, Math.round(run / (2 * tooth)));
    const points = 2 * teeth;
    const deep = bite * (run / points / tooth);
    for (let point = corner === 1 ? 0 : 1; point <= points; point += 1) {
      const along = point / points;
      cut.push(at(fromX + (toX - fromX) * along, fromY + (toY - fromY) * along, deep, point));
    }
  }
  return cut;
}

/** Which side of the line a point of it is pushed to, the teeth alternating. */
function pushed(point: number): number {
  return point % 2 === 0 ? -1 / 2 : 1 / 2;
}
/**
 * A band that follows an outline, with its inner edge cut along a modified line:
 * how deep the plain band beneath the teeth runs, and the teeth standing on it.
 *
 * This is what a band following the edge of the shield needs and no band
 * crossing the field does. The outer edge of such a band is the outline itself
 * and is not the band's to cut, so the teeth are all on the one side, and the
 * band is deeper where a tooth reaches and shallower where a notch does. That is
 * how the armorials draw it; every other band cut along a line keeps its width,
 * both its edges being free.
 *
 * It comes back as a band and a row of teeth rather than as one outline, because
 * an outline brought inside a corner crosses itself there — the two sides reach
 * past one another — and a crossing is a hole in anything painted by the even-odd
 * rule. Teeth laid on a band can only add paint, so the corner is left to the
 * band, which is a stroke and miters its own corners, and no arithmetic here has
 * to know what a corner is.
 *
 * Each tooth is set a little way into the band rather than stood on top of it. A
 * tooth stands on a straight line between two points of the outline, and where
 * the outline curves that line falls inside the band's own edge — by a couple of
 * hairs on the curve of a shield's base, which is enough for the field to show
 * between the band and its teeth. So the tooth reaches back past where the band
 * ends, which changes nothing about the part of it that shows.
 *
 * The teeth are counted round the whole outline and spaced by the length of it,
 * so that they come out even wherever it is measured from: a line that closes on
 * itself has no end to leave a half tooth at, and an odd count would set a tooth
 * against a tooth where it came round.
 *
 * Which way is inwards is read off the outline rather than assumed: a frame is
 * free to be drawn either way round, and a guess would set the teeth outside the
 * shield.
 */
export interface Toothed {
  /** How deep the band the teeth stand on runs, which is shallower than the whole. */
  readonly beneath: number;
  /** The teeth, each standing on that band and reaching a bite deeper. */
  readonly teeth: readonly Shape[];
}

/**
 * How far back into the band a tooth reaches, as a part of its bite, which is
 * more than any curve of the outline it stands on.
 */
const ROOT = 1 / 2;

export function toothedInside(
  outline: readonly Point[],
  depth: number,
  { tooth: along, bite }: Cut
): Toothed {
  const walked = walking(outline);
  // A band with one free edge has only its own depth to spend, and a cut deeper
  // than the band would leave nothing of it between the notches. So a tooth too
  // big for the band is scaled down whole rather than trimmed: it keeps the
  // angle at its point, which is what the line is, and loses the size, which is
  // what the band cannot carry. Every line is cut smaller round a bordure than
  // across a fess, and each is cut smaller than the next by the same measure.
  const fits = Math.min(1, depth / bite);
  const cut = { along: along * fits, bite: bite * fits };
  const count = Math.max(1, Math.round(walked.length / (2 * cut.along)));
  const points = 2 * count;
  const inward = turning(outline);
  // Scaled again to the teeth the outline came out with, as a band's are, so
  // that the point of a tooth is the same angle round a bordure as across a fess.
  const deep = cut.bite * (walked.length / points / cut.along);
  const beneath = depth - deep / 2;
  const root = beneath - deep * ROOT;
  const at = (point: number, deep: number): Point => {
    const [[x, y], [alongX, alongY]] = walked.at((point * walked.length) / points);
    return [x - inward * alongY * deep, y + inward * alongX * deep];
  };
  // Each tooth stands on the whole of its period, so that the teeth meet where
  // they come down and the edge is a saw with no flat in it.
  const toothed = (tooth: number): readonly Point[] => [
    at(2 * tooth, beneath),
    at(2 * tooth + 1, beneath + deep),
    at(2 * tooth + 2, beneath),
    at(2 * tooth + 1, root),
  ];
  return {
    beneath,
    teeth: Array.from({ length: count }, (_, tooth) => polygon(pointsOf(toothed(tooth)))),
  };
}

/** An outline written as a polygon's points, which is how a band is painted. */
export function pointsOf(outline: readonly Point[]): string {
  return outline.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

/** Whole numbers where the drawing allows them, and a tenth where it does not. */
function round(measure: number): number {
  return Math.round(measure * 10) / 10;
}

/** An outline measured, so that any distance round it can be asked for. */
interface Walked {
  /** How far it is round the whole of it. */
  readonly length: number;
  /** Where a given distance round it falls, and which way the line runs there. */
  readonly at: (distance: number) => readonly [Point, Point];
}

/**
 * An outline measured once so that it can be walked many times.
 *
 * What comes back at each distance is the place and the way the line runs there,
 * because a line is cut square to itself and the only thing that knows which way
 * square is, is the line.
 */
function walking(outline: readonly Point[]): Walked {
  const reached: number[] = [0];
  for (let corner = 1; corner <= outline.length; corner += 1) {
    const [fromX, fromY] = outline[corner - 1];
    const [toX, toY] = outline[corner % outline.length];
    reached.push(reached[corner - 1] + Math.hypot(toX - fromX, toY - fromY));
  }
  const length = reached[outline.length];
  return {
    length,
    at: (distance) => {
      const gone = ((distance % length) + length) % length;
      const corner = Math.max(0, reached.findIndex((reached) => reached > gone) - 1);
      const [fromX, fromY] = outline[corner];
      const [toX, toY] = outline[(corner + 1) % outline.length];
      const run = Math.hypot(toX - fromX, toY - fromY) || 1;
      const along = (gone - reached[corner]) / run;
      return [
        [fromX + (toX - fromX) * along, fromY + (toY - fromY) * along],
        [(toX - fromX) / run, (toY - fromY) / run],
      ];
    },
  };
}

/**
 * Which way round an outline is drawn, as the sign to turn its own direction by
 * to face inwards.
 *
 * Twice the area it encloses, which comes out positive one way round and
 * negative the other. A shape is drawn whichever way its author drew it, and
 * nothing here may assume one.
 */
function turning(outline: readonly Point[]): number {
  let twiceTheArea = 0;
  for (let corner = 0; corner < outline.length; corner += 1) {
    const [fromX, fromY] = outline[corner];
    const [toX, toY] = outline[(corner + 1) % outline.length];
    twiceTheArea += fromX * toY - toX * fromY;
  }
  return twiceTheArea >= 0 ? 1 : -1;
}
