import { BlazonParseError, TextPosition } from './BlazonParseError';

/**
 * A charge counterchanged, which is good heraldry and is not read yet: "Parti
 * d'or et de sable à la billette de l'un à l'autre".
 *
 * Both words are known and the field is divided, so this is neither an unknown
 * charge nor a field with nothing to reverse: it is the vocabulary reaching only
 * as far as the bands. French says the thing of a charge with its other phrase,
 * which is not read either, so a blazon that meant it has nothing to say yet and
 * is told so rather than left to fail as a misspelling.
 */
export class CounterchangedCharge extends BlazonParseError {
  constructor(
    /** The name as the blazon spelled it, folded to lower case: "billette". */
    readonly charge: string,
    position?: TextPosition
  ) {
    super(`Counterchanged is read of a band and not yet of a charge: ${charge}`, position);
  }
}
