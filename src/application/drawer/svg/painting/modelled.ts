import { Frame, Painter } from '../Ground';
import { Shape, all } from '../shapes/Shape';

/**
 * The paint a figure is modelled in, which is no tincture and never will be.
 *
 * Grey rather than a darker or lighter cast of the tincture underneath, and laid
 * through rather than over it: a wash of middle grey moves gold towards grey and
 * sable towards grey too, so the marks tell on a light tincture and a dark one
 * alike. A black wash would vanish on sable and a white one on argent, and a
 * figure whose modelling disappeared on two of the eight tinctures would be a
 * figure drawn differently for different arms.
 *
 * It says nothing. Heraldry knows two dimensions and a flat paint, and a blazon
 * that named this would be naming something no armorial ever blazoned — so what
 * it is worth is that a beast reads as a beast rather than as a blot of one
 * colour, and no more than that.
 */
const WASH = '#808080';

/** How much of it is laid on, the rest being the tincture showing through. */
const THROUGH = 0.35;

/**
 * Shapes washed over a figure already painted, in no tincture of the blazon's.
 *
 * Not outlined, where everything a tincture paints is: an outline parts two
 * paints that mean different things, and these mean nothing apart from the paint
 * they lie on. Gathered under one group so that the wash is laid once however
 * many marks there are — laid mark by mark, every place two of them overlapped
 * would come out darker than the rest.
 *
 * Nothing at all where the colouring rules its tinctures rather than painting
 * them. Hatching is a way of reproducing arms in one ink and it has no shades in
 * it: every mark on a hatched shield is a tincture being named, so a grey laid
 * over the ruling would be a mark that named none — and it would hide the very
 * ruling the reader is reading. The same test the outline is drawn by, and for
 * the same reason: what a colouring is made of is the colouring's to say.
 */
export const modelled =
  (shapes: (frame: Frame) => readonly Shape[]): Painter =>
  (ground) =>
    ground.colours.ink === undefined
      ? `<g fill-opacity="${THROUGH}">${all(shapes(ground.frame))({ fill: WASH })}</g>`
      : '';
