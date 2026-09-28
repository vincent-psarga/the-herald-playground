import { BlazonParseError, TextPosition } from './BlazonParseError';

/** A field divided along a line the parser does not hold: "gironné". */
export class UnknownDivision extends BlazonParseError {
  constructor(
    /** The word as the blazon spelled it, folded to lower case. */
    readonly division: string,
    position?: TextPosition
  ) {
    super(`Unknown division: ${division}`, position);
  }
}
