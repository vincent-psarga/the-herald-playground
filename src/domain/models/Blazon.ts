import { Charge, isChargeType } from './Charge';
import { Field } from './Field';
import { Ordinary, isOrdinaryType } from './Ordinary';

/**
 * What a blazon says of where something it bears lies among the rest: over
 * everything else, or wherever the order it was named in puts it.
 *
 * It is said of a band and of a charge alike — "à la fasce brochant", "over all
 * a bend gules" — so it is carried here rather than on either of them, what they
 * have in common being exactly this: both are laid on the field, and anything
 * laid on a field can be laid over what is already there.
 *
 * It is not a modifier. A modifier is what was done to the figure and is drawn
 * into the figure itself; this leaves the figure untouched and says only what it
 * is drawn over. Nor is it a term: it names nothing, and no vocabulary holds it.
 *
 * Left off rather than set false where the blazon said nothing, as the count and
 * the modifier are, so that a fess reads back as the fess it was written as.
 */
export type OverAll = {
  /** Whether it is laid over everything else, wherever the blazon named it. */
  overAll?: true;
};

/**
 * What a field bears: a band or a charge. The two are borne by the same phrase
 * and carry the same tincture and the same count, and are told apart by which
 * vocabulary named them.
 *
 * Either may be laid over all the rest, which is the one thing said of both and
 * of neither in particular, so it is said of what bears them.
 */
export type ChargeOrOrdinary = (Ordinary | Charge) & OverAll;

export function isOrdinary(borne: ChargeOrOrdinary): borne is Ordinary {
  return isOrdinaryType(borne.type);
}

export function isCharge(borne: ChargeOrOrdinary): borne is Charge {
  return isChargeType(borne.type);
}

/**
 * A field, and whatever is laid on it. The list is optional because most of the
 * blazons the vocabulary can read carry nothing at all.
 *
 * Bands and charges share one list rather than having one apiece, because they
 * are kept in the order the blazon named them and that order says which covers
 * which: a bordure blazoned after three bends is drawn over them, and a bend
 * blazoned after a billet is drawn over the billet. Heraldry writes what is laid
 * on the field in the order it is laid, and the drawing obeys. Sorted into two
 * lists, the order between a band and a charge would be lost, and the blazon
 * would come back saying something it never said.
 */
export type Blazon = {
  field: Field;
  chargesOrOrdinaries?: readonly ChargeOrOrdinary[];
};

/**
 * What a field bears, in the order it is laid on the field: everything in the
 * order the blazon named it, and after all of that whatever was laid over all.
 *
 * The order a blazon names things in is already the order they are laid, which
 * is why most blazons never say this: what is named last is over the rest
 * anyway, and Parker notes that over a particoloured field the words "are
 * understood, and therefore may be omitted". What they buy is the other case —
 * a band named before the charges it covers — and that case is this list.
 *
 * Several laid over all keep their own order among themselves, there being
 * nothing in "over all" to tell one of them from another.
 */
export function asLaid(bearings: readonly ChargeOrOrdinary[]): readonly ChargeOrOrdinary[] {
  return [
    ...bearings.filter((one) => one.overAll !== true),
    ...bearings.filter((one) => one.overAll === true),
  ];
}
