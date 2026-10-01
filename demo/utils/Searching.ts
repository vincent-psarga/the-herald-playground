import { folded } from './Anchors';

/**
 * One thing the reader asked for.
 *
 * A bare word is looked for anywhere, within a longer word included: a reader
 * who types gule has asked for gules, and a reader who types or has asked for
 * every or there is. Quoting asks for the word whole instead, which is the only
 * way to tell "or" from the or inside bordure.
 */
export type Term = {
  /** The word or phrase, folded, as the text it is looked for in is folded. */
  readonly text: string;
  readonly whole: boolean;
};

/**
 * A quoted phrase, or a run of anything that is not a space.
 *
 * The closing quote is optional: a reader typing one is midway through a phrase
 * the moment they open it, and the search that runs while they type should look
 * for what they have written rather than for nothing at all.
 */
const TERMS = /"([^"]*)"?|(\S+)/g;

/** What a query asks for, in the order it asks. An empty query asks for nothing. */
export function termsIn(query: string): readonly Term[] {
  return [...query.matchAll(TERMS)]
    .map(([, quoted, bare]) =>
      quoted === undefined
        ? { text: folded(bare ?? ''), whole: false }
        : { text: folded(quoted.trim()), whole: true }
    )
    .filter(({ text }) => text !== '');
}

/** How many times a term stands in a text. */
function instances(text: string, term: Term): number {
  return text.match(matching(term))?.length ?? 0;
}

/**
 * What a term matches.
 *
 * A whole word is held apart from the letters and figures on either side of it,
 * and not by \b, which counts an accented letter as the edge of a word — and
 * these are blazons, where the accented letters are half the vocabulary.
 */
function matching({ text, whole }: Term): RegExp {
  const literal = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(whole ? `(?<![\\p{L}\\p{N}])${literal}(?![\\p{L}\\p{N}])` : literal, 'gu');
}

/** How many times the terms stand in a wording, all of them counted together. */
export function found(wording: readonly string[], terms: readonly Term[]): number {
  const text = folded(wording.join(' '));
  return terms.reduce((count, term) => count + instances(text, term), 0);
}

/**
 * What a query leaves of a list, most matches first.
 *
 * A thing is kept for matching any one term rather than all of them, and ranked
 * by how many matches it holds: someone searching "or gules" is looking for the
 * two together and is shown a field parted of both before a field of one, but is
 * not told that a field of one is nothing to them.
 *
 * Ties keep the order they came in, sorting being stable, so a list the reader
 * already knows the shape of does not shuffle under a query that cannot separate
 * its entries.
 */
export function sought<T>(
  items: readonly T[],
  query: string,
  wordingOf: (item: T) => readonly string[]
): readonly T[] {
  const terms = termsIn(query);
  if (terms.length === 0) {
    return items;
  }
  return items
    .map((item) => ({ item, matches: found(wordingOf(item), terms) }))
    .filter(({ matches }) => matches !== 0)
    .sort((one, other) => other.matches - one.matches)
    .map(({ item }) => item);
}
