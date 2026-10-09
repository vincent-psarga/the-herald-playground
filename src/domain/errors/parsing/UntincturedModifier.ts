import { BlazonParseError, TextPosition } from './BlazonParseError';

/**
 * A tincture given to a modifier that is not drawn: "a lozenge or voided sable".
 *
 * Both words are known and the charge takes the modifier, so this is neither an
 * unknown word nor a wrong modifier: it is a tincture named for something there
 * is nothing of to paint. What is taken out of a charge's middle shows the field
 * through it, so a tincture there would be filling the hole rather than colouring
 * it, which is a figure this vocabulary does not hold. A modified line is the one
 * thing a blazon may paint, the cut being a part of the band it is cut in.
 */
export class UntincturedModifier extends BlazonParseError {
  constructor(
    /** The modifier as its vocabulary spells it: "voided". */
    readonly modifier: string,
    position?: TextPosition
  ) {
    super(`Wrong tincture: ${modifier} is never drawn in one of its own`, position);
  }
}
