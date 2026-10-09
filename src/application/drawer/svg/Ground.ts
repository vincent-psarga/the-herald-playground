import { ColorModel } from '../../../domain/services/IBlazonDrawer';

/**
 * Where a figure is drawn.
 *
 * Nothing in the vocabulary knows where on the page it sits: it is handed a
 * frame and measures itself against that. Today there is one — the shield — but
 * a quarter is the same frame made smaller, and a charged band is a frame turned
 * to its own angle, so a figure that measured itself against the drawing would
 * have to be rewritten the day either arrives.
 */
export type Frame = {
  readonly width: number;
  readonly height: number;
  /**
   * The outline enclosing it: what clips whatever is drawn into it, and what a
   * bordure follows round.
   */
  readonly path: string;
  /**
   * How far the enclosed shape reaches inside the box, which is not how far the
   * box does: a heater is inset from the edges and comes to a point, so three
   * corners of the box it is drawn in are not on it at all.
   *
   * A field cut into pieces cuts the shape rather than the box, so its pieces
   * are measured across these. Measured across the box, a piece can fall
   * entirely on ground the shape never covers — the lowest stripe of a bendy
   * lies where a square shield would have a corner and a heater has only its
   * point — and a field blazoned in six would be drawn in five.
   */
  readonly top: number;
  readonly base: number;
  readonly dexter: number;
  readonly sinister: number;
  /**
   * The furthest a line in bend can be pushed either way and still cross the
   * shape, which the curve of the base decides rather than any corner. A bend
   * line is placed by where it cuts the top edge, so these are read on that
   * scale too.
   */
  readonly bendFrom: number;
  readonly bendTo: number;
  /**
   * Whether a point lies inside the enclosed shape: where a band that runs off
   * the edge is still seen, and so where whatever is measured along it has to
   * fit. A bend compony is cut into its compons over the length of it the shield
   * shows, which the curve of the base cuts short well before any corner.
   */
  readonly encloses: (x: number, y: number) => boolean;
};

/**
 * What a figure is given to draw itself: where it is drawn, and what the
 * tinctures are painted with there.
 *
 * The colouring travels with the frame because only the colouring knows what its
 * own tinctures are made of — a hatched shield cuts its figures out of ruling
 * where a coloured one cuts them out of colour — and because heraldry fixes no
 * shade, so no figure may assume one.
 */
export type Ground = {
  readonly frame: Frame;
  readonly colours: ColorModel;
};

/** What one tincture is painted with on the ground it is asked about. */
export type Ink = (ground: Ground) => string;

/** Something that covers some of the ground it is given. */
export type Painter = (ground: Ground) => string;
