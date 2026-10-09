import { BlazonParseError, TextPosition } from './BlazonParseError';

/**
 * An attribute the parser holds, painted on a charge that has no such part: "a
 * billet or stoned azure", a billet being a rectangle with nothing set in it.
 *
 * Both words are known and both are spelled rightly, so this is neither an
 * unknown charge nor an unknown word: it is the blazon asking for a part of a
 * figure that has none.
 */
export class WrongAttribute extends BlazonParseError {
  constructor(
    /** The name of what was borne, as its vocabulary spells it: "billet". */
    readonly borne: string,
    /** The attribute as its vocabulary spells it: "stoned". */
    readonly attribute: string,
    position?: TextPosition
  ) {
    super(`Wrong attribute: ${borne} is never ${attribute}`, position);
  }
}
