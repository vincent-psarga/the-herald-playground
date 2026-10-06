import { Ground, Ink, Painter } from '../Ground';
import { Shape, all } from '../shapes/Shape';
import { escapeAttribute } from '../escaping';

/**
 * Shapes painted alike on a given ground: the outline of them all laid down
 * first, and the fills over it.
 *
 * There is an outline only where the colouring has an ink to draw one in. A
 * colouring that paints in colour has none and wants none — its tinctures tell
 * themselves apart — so what it draws here is what it drew before this existed,
 * shape for shape. A colouring that rules its tinctures has one and needs it:
 * ruling laid against ruling reads as neither, which is why the engravers drew
 * a line round every shape, and it is theirs this follows.
 *
 * The outline is the same shapes over again, swollen past their own edges and
 * painted in that ink, with the fills covering them back to those edges. Laid
 * under all the fills rather than round each shape, it leaves a line outside
 * the figure they make together and none inside it — which is what a cross
 * wants, being a pale and a fess crossing.
 */
export const inked =
  (shapes: readonly Shape[], ink: Ink): Painter =>
  (ground) =>
    outlining(shapes, ground) + all(shapes)({ fill: ink(ground) });

/**
 * The outline under such a set of shapes, and nothing where the colouring draws
 * none.
 *
 * Laid apart from the fills as well as under them, for the paintings that do not
 * fill the shapes with one ink: a figure painted out of the ground it is laid on
 * is outlined exactly as this outlines one, and then filled with something this
 * knows nothing about.
 */
export function outlining(shapes: readonly Shape[], { colours }: Ground): string {
  return colours.ink === undefined
    ? ''
    : all(shapes)({ fill: escapeAttribute(colours.ink), swollen: true });
}
