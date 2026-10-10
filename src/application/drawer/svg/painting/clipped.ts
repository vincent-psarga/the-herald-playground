import { Painter } from '../Ground';
import { Shape, all } from '../shapes/Shape';

/**
 * What the shapes are painted in where they stand for themselves rather than for
 * a figure: white, which is what shows a mask through entire.
 */
const SHOWN = { fill: '#ffffff' };

/**
 * A painting cut to a set of shapes: what falls outside them is not drawn.
 *
 * Cut by a mask rather than by a clip path, though a clip path is the plainer
 * way of saying it, because a clip path is made of geometry alone and one of
 * these shapes has none to speak of: a bordure is the frame's own outline drawn
 * as a thick stroke, and a stroke is no part of the shape a clip path would cut
 * to — the cut would fall on the whole shield the outline encloses, and a
 * bordure would take the field. A mask is made of painting rather than geometry,
 * so it takes the shapes exactly as the drawing takes them, stroked or filled.
 *
 * The shapes are painted white into it, white being what a mask shows through
 * entire, and the very brush they are painted with elsewhere carries it: what
 * fills a filled shape strokes a stroked one, so neither has to be asked which
 * it is.
 *
 * A mask is never rendered where it stands, so it is written where it is used
 * rather than gathered elsewhere and referred to from afar — and it is named
 * after its own shapes rather than after whatever asked for it. Two drawings
 * inlined in one page share an id space, so a name taken from the shapes is one
 * that two identical masks can share and two different ones can never collide
 * over.
 */
export const clipped =
  (shapes: readonly Shape[], painter: Painter): Painter =>
  (ground) => {
    const cut = all(shapes)(SHOWN);
    const id = named(cut);
    const { width, height } = ground.frame;
    return (
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">` +
      `${cut}</mask><g mask="url(#${id})">${painter(ground)}</g>`
    );
  };

/**
 * A name for a mask, taken from the shapes it shows: the same shapes are always
 * the same name, and two sets differing anywhere differ here.
 *
 * FNV-1a, which is short enough to read in the markup and spreads well enough
 * that two figures of one page never meet in the one name.
 */
function named(cut: string): string {
  let hash = 0x811c9dc5;
  for (let at = 0; at < cut.length; at += 1) {
    hash = Math.imul(hash ^ cut.charCodeAt(at), 0x01000193);
  }
  return `blason-cut-${(hash >>> 0).toString(36)}`;
}
