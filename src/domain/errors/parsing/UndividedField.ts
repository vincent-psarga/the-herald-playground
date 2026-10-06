import { BlazonParseError, TextPosition } from './BlazonParseError';

/**
 * Something counterchanged over a field there is nothing to counterchange
 * between: "D'or à la bordure de l'un à l'autre".
 *
 * Nothing was misnamed and nothing was misspelled. The phrase says the band
 * takes the field's tinctures reversed, and a field of one tincture has no
 * second one to reverse it with — so the two halves of the blazon contradict
 * each other and neither is wrong on its own, exactly as a field called plain
 * and then charged is.
 *
 * A varied field and a furred one are refused here too, for now. Both are cut
 * from two tinctures and heraldry counterchanges over the first of them, but
 * neither is cut into the parts a figure can be cut by, and a blazon answered
 * with a drawing that ignored half of what it said would be worse than one
 * refused.
 */
export class UndividedField extends BlazonParseError {
  constructor(position?: TextPosition) {
    super('Nothing to counterchange: the field is not divided between two tinctures', position);
  }
}
