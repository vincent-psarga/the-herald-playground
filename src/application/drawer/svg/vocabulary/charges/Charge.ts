import { Attribute } from '../../../../../domain/models/Attributes';
import { Modifier } from '../../../../../domain/models/Modifier';
import { Shape } from '../../shapes/Shape';
import { ChargeFigure } from '../Figures';
import { Spot, spots, strewing } from './disposition';

/**
 * A charge, built from the one thing that is its own: what it looks like at a
 * spot, in a size.
 *
 * Where the spots are is the disposition's business and not the figure's. A
 * counted few are ranged in ranks and drawn large; a field sown with them is
 * covered edge to edge in small ones past counting. The shape is the same
 * either way, which is why a semy needs no second drawing of anything.
 *
 * A modifier changes that one thing and nothing else, so what it is given is
 * another drawing at a spot and what it gets back is another charge, built the
 * same way and placed by the same dispositions. Which modifiers a charge will
 * take is the model's to say; what one leaves of the figure can only be drawn
 * here, figure by figure, there being no way to take the middle out of a shape
 * that has already forgotten what shape it was.
 *
 * A part takes nothing away and is drawn over the whole figure in a paint of its
 * own, so it is another drawing at the same spot and is built the same way
 * again: what sets it apart from a modifier is that both are laid, one over the
 * other, where a modifier's drawing stands in the plain one's place.
 */
export function charge(
  at: (spot: Spot) => Shape,
  modified: Readonly<Partial<Record<Modifier, (spot: Spot) => Shape>>> = {},
  parts: Readonly<Partial<Record<Attribute, (spot: Spot) => Shape>>> = {}
): ChargeFigure {
  return {
    at,
    shapes: (frame, count) => spots(frame, count).map(at),
    strewn: (frame) => strewing(frame).map(at),
    modified: Object.fromEntries(
      Object.entries(modified).map(([modifier, drawn]) => [modifier, charge(drawn)])
    ) as ChargeFigure['modified'],
    parts: Object.fromEntries(
      Object.entries(parts).map(([attribute, drawn]) => [attribute, charge(drawn)])
    ) as ChargeFigure['parts'],
  };
}
