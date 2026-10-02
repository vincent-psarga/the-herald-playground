import { Shape, swelling } from './Shape';
import { circleOutline } from './disc';
import { hollow } from './hollow';

export const rectangle =
  (x: number, y: number, width: number, height: number): Shape =>
  (brush) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${brush.fill}"${swelling(brush)}/>`;

/**
 * The outline of such a rectangle, written as a path so it can enclose another —
 * or clip whatever is drawn into it, a part of a divided field being a box like
 * any other.
 */
export const rectangleOutline = (x: number, y: number, width: number, height: number): string =>
  `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;

/**
 * The same rectangle with its middle out, the band an even thickness all the way
 * round: the corners are square, so the inner outline is simply the outer one
 * brought in by the band on every side.
 */
export const hollowRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  band: number
): Shape =>
  hollow(
    rectangleOutline(x, y, width, height),
    rectangleOutline(
      x + band,
      y + band,
      Math.max(0, width - 2 * band),
      Math.max(0, height - 2 * band)
    )
  );

/**
 * The same rectangle with a round hole punched through the middle of it, the
 * rest of it left painted.
 *
 * It is not the hollow one with a rounder hole. What a voided figure leaves is
 * its own outline, the band following every side; what a pierced one leaves is
 * the figure itself, short of what the hole took out — so the hole is reckoned
 * off the rectangle rather than the band, and is drawn small enough that the
 * charge is still plainly the charge.
 */
export const piercedRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): Shape =>
  hollow(
    rectangleOutline(x, y, width, height),
    circleOutline(x + Math.round(width / 2), y + Math.round(height / 2), radius)
  );
