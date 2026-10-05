import { Frame } from '../Ground';
import { Shape, all } from './Shape';
import { polygon } from './polygon';
import { rectangle } from './rectangle';
import { Cut, DOWNWARD, Point, SIDEWAYS, pointsOf, square, toothed } from './teeth';

/** A band's place across the room it crosses: where it begins, and how far it runs. */
export type Band = readonly [at: number, across: number];

/** A band straight across the frame. */
export const across =
  (frame: Frame) =>
  ([at, span]: Band): Shape =>
    rectangle(0, at, frame.width, span);

/** A band straight down the frame. */
export const down =
  (frame: Frame) =>
  ([at, span]: Band): Shape =>
    rectangle(at, 0, span, frame.height);

/**
 * A band running corner to corner, given where it cuts the top edge.
 *
 * Its width is measured across the frame rather than square to the band: the
 * diagonal is drawn by sliding the top and bottom edges sideways, which keeps
 * the arithmetic in whole numbers.
 */
export const inBend =
  ({ width, height }: Frame) =>
  ([at, span]: Band): Shape =>
    polygon(`${at},0 ${at + span},0 ${width + at + span},${height} ${width + at},${height}`);

export const inBendSinister =
  ({ width, height }: Frame) =>
  ([at, span]: Band): Shape =>
    polygon(`${width + at},0 ${width + at + span},0 ${at + span},${height} ${at},${height}`);

/** How far a bent band's limbs climb from the edge of the frame to its point. */
export const RISE = 100;

/** A band bent to a point, given where its upper edge reaches that point. */
export const bent =
  ({ width }: Frame) =>
  ([at, span]: Band): Shape =>
    polygon(
      `0,${at + RISE} ${width / 2},${at} ${width},${at + RISE} ` +
        `${width},${at + RISE + span} ${width / 2},${at + span} 0,${at + RISE + span}`
    );

/** How much of a twinned band's room is bar rather than the gap between the pair. */
const BAR_OF_THE_PAIR = 3 / 8;

/**
 * A pair of narrow bars in the room one band would have taken: three parts bar,
 * two parts field, three parts bar.
 *
 * The gap inside the pair is narrower than the field left around it, which is
 * what makes the two read as one thing rather than as two bars that happen to
 * lie close together.
 */
export const twinned =
  (frame: Frame) =>
  ([at, span]: Band): Shape => {
    const bar = Math.round(span * BAR_OF_THE_PAIR);
    return all([
      rectangle(0, at, frame.width, bar),
      rectangle(0, at + span - bar, frame.width, bar),
    ]);
  };

/**
 * A band whose two edges are cut along a modified line: the line it is drawn
 * along, the way across to its other edge, the way the teeth reach, and the cut
 * they are cut with.
 *
 * Both edges are cut alike and in step, so a band cut by a saw keeps the width
 * it had — it is the line the band follows that was modified, not the band's
 * size — and what is drawn is one ribbon of teeth rather than a row of
 * triangles. A band cut by a hollow is in step too, and so is widest at its
 * points and narrowest between them: the hollows are bitten out of each edge
 * from the field side, which is what engrailing is and what the two edges have
 * to be told apart for.
 *
 * Which side each edge faces is read off the way across rather than off the way
 * the teeth reach, the two not always agreeing: a diagonal is slid sideways to
 * its other edge but cut square to its own slant.
 */
const toothedBand = (
  line: readonly Point[],
  [acrossX, acrossY]: Point,
  [wayX, wayY]: Point,
  cut: Cut
): Shape => {
  const way: Point = [wayX, wayY];
  const facing = Math.sign(wayX * acrossX + wayY * acrossY) || 1;
  return polygon(
    pointsOf([
      ...toothed(line, way, cut, -facing),
      ...[
        ...toothed(
          line.map(([x, y]): Point => [x + acrossX, y + acrossY]),
          way,
          cut,
          facing
        ),
      ].reverse(),
    ])
  );
};

/** A band straight across the frame, its edges cut along a modified line. */
export const acrossCut =
  (frame: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    toothedBand(
      [
        [0, at],
        [frame.width, at],
      ],
      [0, span],
      DOWNWARD,
      cut
    );

/**
 * A band across the top of the frame with its lower edge alone cut, the upper
 * one being the shield's own and not the band's to cut.
 *
 * It is what a chief needs and no band crossing the field does. A band with two
 * free edges keeps its width, both edges being cut alike; this one is deeper
 * where a tooth reaches and shallower where a notch does, which is how the
 * armorials draw it and how a bordure — the other single-edged band — is drawn
 * here.
 *
 * Cutting both edges and trusting the outline to hide the upper teeth is what
 * this replaces. It held only while the teeth were smaller than the inset of the
 * shield's own edge: a larger tooth reaches back inside it and bites the top of
 * the shield, which is a line no blazon modifies.
 *
 * The field lies the way the band's depth is measured, the band lying the other
 * way, so that is the side a hollow is bitten from and the side a point reaches
 * into — "le chef ne peut être engrêlé que dans sa ligne basse".
 */
const belowOnly = (
  [from, to]: readonly [Point, Point],
  span: number,
  way: Point,
  cut: Cut
): Shape =>
  polygon(
    pointsOf([
      from,
      to,
      ...[
        ...toothed(
          [
            [to[0] + way[0] * span, to[1] + way[1] * span],
            [from[0] + way[0] * span, from[1] + way[1] * span],
          ],
          way,
          cut,
          1
        ),
      ],
    ])
  );

/** A band across the top of the frame, its lower edge alone cut. */
export const acrossCutBelow =
  (frame: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    belowOnly(
      [
        [0, at],
        [frame.width, at],
      ],
      span,
      DOWNWARD,
      cut
    );

/** A band straight down the frame, its edges cut along a modified line. */
export const downCut =
  (frame: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    toothedBand(
      [
        [at, 0],
        [at, frame.height],
      ],
      [span, 0],
      SIDEWAYS,
      cut
    );

/** A band corner to corner, its edges cut square to its own slant. */
export const inBendCut =
  ({ width, height }: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    diagonal([at, 0], [width + at, height], span, cut);

export const inBendSinisterCut =
  ({ width, height }: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    diagonal([width + at, 0], [at, height], span, cut);

/** A band running from one corner of the frame towards another, its edges cut. */
const diagonal = (from: Point, to: Point, span: number, cut: Cut): Shape =>
  toothedBand([from, to], [span, 0], square(from, to), cut);

/** A band bent to a point, its edges cut along both limbs. */
export const bentCut =
  ({ width }: Frame, cut: Cut) =>
  ([at, span]: Band): Shape =>
    toothedBand(
      [
        [0, at + RISE],
        [width / 2, at],
        [width, at + RISE],
      ],
      [0, span],
      DOWNWARD,
      cut
    );
