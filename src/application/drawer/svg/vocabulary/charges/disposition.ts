import { Frame } from '../../Ground';

/**
 * How far the room the charges share is inset from what the field reaches: clear
 * of the edges on every side, and clearer still of the point at the base.
 *
 * A charge is not measured against a line the way a band is, so nothing decides
 * its place but the room left for it. The room is the same whatever is borne, and
 * the charges are fitted into it: what a count changes is how small they are
 * drawn, exactly as it changes how narrow a band is drawn.
 *
 * It is reckoned off the frame rather than written down, because the frame is
 * not always the shield: a part of a divided field is a frame of its own, and
 * three lilies in the half at dexter are fitted into that half — drawn small
 * enough for it and standing where it is — rather than laid out for a field
 * twice the size and cut in two by the line.
 */
const INSET = 20;
const INSET_TOP = 18;
const INSET_BASE = 38;

/** How many charges stand side by side, at most. */
const ABREAST = 2;

/**
 * How big a single charge is drawn, whatever room it has.
 *
 * A lone charge fills the shield the way a band does — about a third of it —
 * rather than swelling to whatever box it was given. What multiplies it shrinks
 * it; nothing enlarges it.
 */
const ALONE = 88;

/** How much of the room it is given a charge actually takes, leaving the rest around it. */
const OF_ITS_ROOM = 0.66;

/** Where one charge stands, and how big it is drawn there. */
export type Spot = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
};

/**
 * How many charges stand in each rank, from chief to base.
 *
 * Two abreast, the odd one last — which is what heraldry does when a blazon
 * names a number and no disposition: three are two in chief and one in base, and
 * six are three ranks of two. Where an armorial would have laid five out two,
 * one and two, this lays them two, two and one, which is a stand-in and is
 * blazoned no differently until dispositions are read.
 */
function ranks(count: number): readonly number[] {
  const rows = Math.ceil(count / ABREAST);
  return Array.from({ length: rows }, (_, row) => Math.min(ABREAST, count - row * ABREAST));
}

/**
 * Where a given number of charges stand in the room they share.
 *
 * The ranks share the height between them and each charge its rank's share of
 * the width, every charge taking the same part of its own cell so that all of
 * them are drawn alike however many there are. A rank of one is centred, which
 * is what puts the odd charge under the pair above it.
 */
export function spots(frame: Frame, count: number): readonly Spot[] {
  const rows = ranks(count);
  const fromX = frame.dexter + INSET;
  const toX = frame.sinister - INSET;
  const fromY = frame.top + INSET_TOP;
  const cell = (toX - fromX) / Math.min(count, ABREAST);
  const rank = (frame.base - INSET_BASE - fromY) / rows.length;
  const size = Math.round(Math.min(ALONE, cell * OF_ITS_ROOM, rank * OF_ITS_ROOM));

  return rows.flatMap((abreast, row) => {
    const y = Math.round(fromY + (row + 0.5) * rank);
    return Array.from({ length: abreast }, (_, along) => ({
      x: Math.round((fromX + toX) / 2 + (along - (abreast - 1) / 2) * cell),
      y,
      size,
    }));
  });
}

/**
 * How big a sown figure is drawn: "drawn small and without any reference to the
 * number", which is what tells a semy from a count of charges at a glance.
 */
const SOWN = 26;

/** How far apart the sown figures stand, centre to centre, along each row. */
const APART = 48;

/** How far one row stands below the last. */
const BETWEEN_ROWS = 34;

/**
 * Where the figures of a semy stand.
 *
 * Reckoned from the frame's own corner rather than the drawing's, as a pelt is:
 * a heater is inset from the box it is drawn in, and a lattice started at the
 * box has its first row swallowed by the chief. Every other row is shifted half
 * a step so the rows fall between one another rather than under.
 *
 * It is laid a row above and a column either side of what the frame covers, and
 * the shield's own edge cuts whatever runs past it — which is how heraldry draws
 * a semy, the figures "seeming to continue beyond the boundaries".
 */
export function strewing(frame: Frame): readonly Spot[] {
  const rows = Math.ceil((frame.base - frame.top) / BETWEEN_ROWS) + 1;
  const across = Math.ceil((frame.sinister - frame.dexter) / APART) + 1;

  return Array.from({ length: rows }, (_, row) => {
    const y = Math.round(frame.top + row * BETWEEN_ROWS);
    const from = frame.dexter + (row % 2 === 0 ? 0 : APART / 2) - APART / 2;
    return Array.from({ length: across + 1 }, (_, along) => ({
      x: Math.round(from + along * APART),
      y,
      size: SOWN,
    }));
  }).flat();
}
