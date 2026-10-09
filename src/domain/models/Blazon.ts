import { Charge, ChargeType, isChargeType } from './Charge';
import { Field } from './Field';
import { Ordinary, OrdinaryType, isOrdinaryType } from './Ordinary';

/**
 * The name of something a field may bear: a band or a charge.
 *
 * Both vocabularies as one, because both are named by the same phrase and a word
 * in neither is wrong in the same way. It is the model's rather than the
 * parser's because the writer asks it too: which word a tongue says a modifier
 * with is asked of what the modifier was said of, and that is a band as readily
 * as a charge.
 */
export type BorneType = OrdinaryType | ChargeType;

/**
 * What a field bears: a band or a charge. The two are borne by the same phrase
 * and carry the same tincture and the same count, and are told apart by which
 * vocabulary named them.
 */
export type ChargeOrOrdinary = Ordinary | Charge;

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
