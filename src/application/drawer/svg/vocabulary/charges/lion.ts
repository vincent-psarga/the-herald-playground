import { Attribute } from '../../../../../domain/models/Attributes';
import { ducalCoronet } from '../../shapes/crown';
import { lion as rampant, lionClaws, lionModelling, lionTongue } from '../../shapes/lion';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';

/**
 * How much bigger than its spot the beast is drawn.
 *
 * A charge is given a square spot, and the compact figures fill it: a roundel is
 * its width across and a billet nearly so. A lion spends most of its box on the
 * air between its legs and under its tail, so drawn to the spot it stands in it
 * reads as a far smaller charge than a disc of the same measure — and a lion
 * borne alone fills the shield in every armorial there is. It is drawn three
 * fifths bigger to stand as those do, which is the lozenge's own reckoning
 * turned the other way, that one being drawn narrow so as not to look swollen
 * beside a disc.
 *
 * Three fifths and no more, because what it grows into is the room left around
 * it and there is a floor to that. Six borne together are ranged in three ranks,
 * and a beast drawn much larger than this would have the ranks touching; a field
 * sown with them is laid on a lattice of a fixed step, and one drawn larger
 * still would close that lattice up into a thicket.
 */
const SPREAD = 1.6;

/**
 * A lion rampant: reared on its hind paws, head in profile, tail turned up over
 * the back and tufted at the tip.
 *
 * Armed, its claws are painted apart from the rest of it; langued, its tongue
 * is. Both are laid over the whole beast rather than cut out of it, so a lion
 * that is neither is the same drawing with nothing over it — which is what
 * heraldry means by saying the claws are the beast's own tincture unless a
 * blazon says otherwise.
 */
/**
 * Where the coronet sits, and how wide it is drawn: measured against the beast's
 * own figure rather than the spot it stands in, so that it rides the head
 * wherever the head goes.
 *
 * The head is at the chief and to dexter, the beast looking up and away, and the
 * crown rests on the skull between the brow and the ear — read off the folio's
 * own drawing, the same landmarks the trace was taken from.
 */
const CROWN = { x: 0.009, y: -0.455, across: 0.118 };

export const lion: ChargeFigure = charge(({ x, y, size }) => rampant(x, y, size * SPREAD), {
  parts: {
    [Attribute.armed]: ({ x, y, size }) => lionClaws(x, y, size * SPREAD),
    [Attribute.langued]: ({ x, y, size }) => lionTongue(x, y, size * SPREAD),
    [Attribute.crowned]: ({ x, y, size }) => {
      const beast = size * SPREAD;
      return ducalCoronet(x + CROWN.x * beast, y + CROWN.y * beast, CROWN.across * beast);
    },
  },
  modelling: ({ x, y, size }) => lionModelling(x, y, size * SPREAD),
});
