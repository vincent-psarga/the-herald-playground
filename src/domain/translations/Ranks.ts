import { Translation } from './Translation';
import { Word } from './Word';

/**
 * How a language names the rank of one part of a divided field: "au premier",
 * "au second".
 *
 * A rank is no term of heraldry and names no figure. It says which part of the
 * field the arms after it are laid in, and the model holds that by holding the
 * parts in the order the blazon named them — so nothing of the rank survives
 * into the model, exactly as nothing of a count's spelling does.
 *
 * Keyed on the rank written in figures, as the numbers are, because a blazon is
 * free to write it in figures: "au 1" says what "au premier" says. What each
 * tongue spells it with is the tongue's own business, and a tongue that does not
 * rank the parts at all holds no such words.
 */
export type RankWords<W extends Word = Word> = Translation<`${number}`, W>;

/** The rank of the part in chief — the upper, or the one at dexter — named first. */
export const FIRST = 1;

/** The ranks a field of so many parts has, in the order a blazon names them. */
export function ranksOf(parts: number): readonly number[] {
  return Array.from({ length: parts }, (_, part) => FIRST + part);
}
