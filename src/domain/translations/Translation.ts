import { BorneType } from '../models/Blazon';
import { Modifier } from '../models/Modifier';
import { Tincture } from '../models/Tinctures';
import { Spelling, Word } from './Word';

/**
 * How one language spells every term of an enum. A term may have more than one
 * accepted spelling — "mantelé-versé" is also written "mantelé-renversé" — so a
 * translation may give a list, and the first entry is the one used for writing
 * the term back out.
 *
 * Keying on the enum's values rather than its keys makes the record exhaustive:
 * adding a term to the enum breaks every translation that has not caught up.
 *
 * A translation is written in a kind of word, so that a language whose words
 * carry more than their spelling — French, whose articles agree with them —
 * hands its grammar the whole word rather than a string to look up.
 */
export type Translation<T extends string, W extends Word = Word> = Record<T, W | W[]>;

/** A term, together with the word that spelled it. */
export interface TermWord<T extends string, W extends Word = Word> {
  readonly term: T;
  readonly word: W;
}

/** Every word a term accepts, the canonical one first. */
export function wordsOf<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T
): readonly W[] {
  const words = translation[term];
  return Array.isArray(words) ? words : [words as W];
}

/** The word a term is written with. */
export function wordOf<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T
): W {
  return wordsOf(translation, term)[0];
}

/**
 * The word a term is written with when it is borne in a given tincture.
 *
 * A term whose words carry no tincture has but one answer, and this is the
 * canonical word again. The roundel is why there is a question: the word that
 * already means the tincture is the one to write, so that a gold roundel comes
 * back as "a besant" and not as "a roundel or", and a blazon reads as an
 * armorial writes it. Failing that, the first word the tincture is allowed under
 * — "a roundel ermine", English having no name for that one — and failing that
 * the canonical word, which will be wrong about the tincture but is at least the
 * charge that was asked for.
 *
 * What was done to the charge is asked first, where anything was. Heraldry names
 * some of the modified figures outright — a lozenge voided is a mascle and a
 * lozenge pierced is a rustre — and such a name says the modifier by being
 * written, so the words that say this much are what the tincture is then chosen
 * among. Where the tongue has no such name the question is dropped rather than
 * answered wrongly: every word is considered again, the plain name wins, and the
 * modifier is written after it in the ordinary way.
 *
 * The two questions do not cross today, no charge having both a name per
 * tincture and a name per modifier. Asked in this order they could: the tincture
 * is chosen among the words that mean what was done, which is the way round that
 * keeps a name meaning what it says.
 */
export function wordIn<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T,
  tincture: Tincture,
  modifier?: Modifier
): W {
  const words = wordsOf(translation, term);
  const meaning = words.filter((word) => word.means(modifier));
  const among = meaning.length === 0 ? words : meaning;
  return (
    among.find((word) => word.defaultTincture === tincture) ??
    among.find((word) => word.accepts(tincture)) ??
    among[0]
  );
}

/**
 * The word a term is written with when it is said of a given band or charge.
 *
 * The tincture's question asked of a word that qualifies rather than names, and
 * answered the same way. A tongue may hold two words for the one term and keep
 * each for its own: French voids the star with évidé and the lozenge, the
 * roundel and the billet with vidé, exactly as English names the gold roundel a
 * besant and the red one a torteau. The term is one, the drawing is one, and the
 * word that comes back is the one the armorials write of that figure.
 *
 * It is asked of a band as readily as of a charge, a band having modifiers of
 * its own: nothing here is about what the figure is, only about which of a
 * tongue's words is written of it.
 *
 * The word that claims the figure, then the word that claims none and is
 * therefore the general one, then the canonical word — which will be the wrong
 * word for the figure but is at least the term that was asked for.
 */
export function wordSaidOf<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T,
  type: BorneType
): W {
  const words = wordsOf(translation, term);
  return (
    words.find((word) => word.claims(type)) ??
    words.find((word) => word.saidOf === undefined) ??
    words[0]
  );
}

/**
 * Every spelling a term accepts, the canonical one first.
 *
 * A word may answer to several spellings without being several words, so what is
 * counted here is spellings and not words: "fleur-de-lys" is one of the lily's
 * four and none of them is a word of its own.
 */
export function spellingsOf<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T
): readonly string[] {
  return wordsOf(translation, term).flatMap((word) =>
    word.spellings.map((spelling) => spelling.value)
  );
}

/** The spelling a term is written with. */
export function nameOf<T extends string, W extends Word>(
  translation: Translation<T, W>,
  term: T
): string {
  return wordOf(translation, term).value;
}

/**
 * Every way these words may be written, the alternates along with the canonical
 * ones.
 *
 * What a grammar matching a bare word needs is the spellings and not the words:
 * a keyword names no term, so all it can report is that one of them was there.
 */
export function writtenAs(...words: readonly Word[]): readonly string[] {
  return words.flatMap((word) => word.spellings.map((spelling) => spelling.value));
}

/** Which form of a spelling a lookup is keyed on: the one, or the several. */
export type Spelled = (spelling: Spelling) => string;

/** A spelling as one of it, which is how a translation writes it. */
export const asOne: Spelled = (spelling) => spelling.value;

/** A spelling as several of them: "chevrons" for "chevron". */
export const asSeveral: Spelled = (spelling) => spelling.plural;

/**
 * Inverts a translation into a lookup from spelling to term, folded to lower
 * case so that a parser can match however the writer capitalised the word.
 *
 * What a spelling leads to is the word as well as the term, because a grammar
 * that reads a word has to agree with the one actually written rather than with
 * the term's canonical spelling.
 *
 * Which form is looked up is asked for, because a blazon naming several of
 * something names them in the plural, and the plural is a property of the
 * spelling rather than a term of its own.
 *
 * Every spelling a word answers to is indexed, the alternates along with the
 * canonical one: they are the same word and lead to the same word, which is what
 * lets a grammar agree with "fleur-de-lys" exactly as it agrees with the
 * spelling that will be written back.
 */
export function bySpelling<T extends string, W extends Word>(
  translation: Translation<T, W>,
  spelled: Spelled = asOne
): ReadonlyMap<string, TermWord<T, W>> {
  const terms = new Map<string, TermWord<T, W>>();
  for (const term of Object.keys(translation) as T[]) {
    for (const word of wordsOf(translation, term)) {
      for (const spelling of word.spellings) {
        terms.set(spelled(spelling).toLowerCase(), { term, word });
      }
    }
  }
  return terms;
}
