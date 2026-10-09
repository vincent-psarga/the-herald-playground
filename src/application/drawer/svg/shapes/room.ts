import { Frame } from '../Ground';
import { FieldPart } from '../vocabulary/Figures';
import { rectangleOutline } from './rectangle';

/** A box within a frame: where it begins, and how far it runs each way. */
export type Box = readonly [x: number, y: number, width: number, height: number];

/**
 * A part of a divided field: what it covers, and the room it gives whatever it
 * bears.
 *
 * The two are not the same shape and are not meant to be. What the part covers
 * is painted and clipped by, so it is the whole of the part, drawn past the
 * frame's own edge and left to the frame's clip — a straight cut runs to the
 * corners of the box, and a diagonal one to the corners of its triangle. The
 * room is a box inside that, because a figure laid in a part has to be told how
 * much of it there is: three lilies in the half at dexter stand in the half, and
 * a figure that measured itself against the whole field would stand half outside
 * the part and be cut in two by the clip.
 */
export function part(frame: Frame, covers: string, [x, y, width, height]: Box): FieldPart {
  return { covers, room: room(frame, x, y, width, height), at: [x, y] };
}

/** A part that covers a box of the field, which is what a straight cut leaves. */
export function boxed(frame: Frame, box: Box): FieldPart {
  return part(frame, rectangleOutline(...box), box);
}

/**
 * A run of corners written as a path, which is what a diagonal cut leaves: the
 * triangle on one side of the line.
 */
export function corners(points: readonly (readonly [x: number, y: number])[]): string {
  return `${points.map(([x, y], corner) => `${corner === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')} Z`;
}

/**
 * The frame a part gives what it bears, in the part's own coordinates.
 *
 * Everything drawn in it measures itself against its own corner, exactly as
 * everything drawn on the shield measures itself against the shield's — so the
 * room is given as though it were a little shield, and the painter puts it where
 * it belongs.
 *
 * How far the field reaches is carried in and cut down to the box, a part of a
 * shield reaching no further than the shield does: the room at dexter of a
 * shield inset six from its box is inset six on that side and inset nothing on
 * the side where the line cut it.
 *
 * Its outline is the box, which is the field's own edge on the sides the line
 * did not cut and is nothing of the sort on the others. A band that follows its
 * frame's outline therefore follows the box: a bordure borne on a part runs down
 * the line the part was cut along, where heraldry ends it there, and it knows
 * nothing of the curve at the base of a shield. Everything else drawn in a part
 * is measured rather than followed, and is measured against the room it stands
 * in, which is the whole point of giving it one.
 */
function room(frame: Frame, x: number, y: number, width: number, height: number): Frame {
  return {
    width,
    height,
    path: rectangleOutline(0, 0, width, height),
    top: Math.max(0, frame.top - y),
    base: Math.min(height, frame.base - y),
    dexter: Math.max(0, frame.dexter - x),
    sinister: Math.min(width, frame.sinister - x),
    // A line in bend cuts the top edge of a box wherever it likes within a width
    // either side; further out and it passes the box by altogether. The shield
    // itself is reckoned more closely, the curve of its base deciding rather
    // than any corner, but a room is a box and a box has corners.
    bendFrom: -width,
    bendTo: width,
  };
}
