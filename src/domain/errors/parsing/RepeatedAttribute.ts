import { BlazonParseError, TextPosition } from './BlazonParseError';

/**
 * One part of a charge painted twice over: "a gem-ring or stoned azure stoned
 * gules", which asks for a stone of two tinctures.
 *
 * A charge takes as many attributes as it has parts to name, so several of them
 * standing together is no mistake at all — a lion is armed and lampassé in the
 * one blazon. Naming the same part twice is, and the two tinctures are why.
 */
export class RepeatedAttribute extends BlazonParseError {
  constructor(
    /** The attribute as its vocabulary spells it: "stoned". */
    readonly attribute: string,
    position?: TextPosition
  ) {
    super(`Said twice: ${attribute}, of the one charge`, position);
  }
}
