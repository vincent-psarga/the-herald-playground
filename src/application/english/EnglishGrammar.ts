import { alt } from 'typescript-parsec';
import { Word } from '../../domain/translations/Word';
import { keyword } from '../parser/Combinators';
import { EnglishRanks } from '../../domain/translations/en/Ranks';
import { nameOf } from '../../domain/translations/Translation';

// English plumbing, not heraldry: what holds a blazon together between the terms.
// English names a tincture bare — "Azure." — so there is no article to agree with.

/** The conjunction joining the halves of a divided field. */
export const CONJUNCTION = 'and';

export const AND = keyword(CONJUNCTION);

/**
 * What says the field bears something rather than is divided by it: English
 * spells the partition "per fess" and the band "a fess", so the article carries
 * the whole distinction.
 */
const A = 'a';
const AN = 'an';

/**
 * Which of the two a word takes.
 *
 * It answers to the sound rather than the letter — "an hour", "a unicorn" — and
 * the letter is all that is read here, minus the u, which in English begins far
 * more often on a consonant sound than not. Every term the vocabulary holds is
 * answered rightly by that, and the first word it is not will have to say so
 * itself, as a French word already says whether "de" elides before it.
 */
const BEGINS_ON_A_VOWEL = /^[aeio]/i;

export function indefiniteArticle(word: Word): string {
  return BEGINS_ON_A_VOWEL.test(word.value) ? AN : A;
}

/** Both are read, and which one was written says nothing more than that one follows. */
export const ARTICLE = alt(keyword(A), keyword(AN));

/**
 * Renders what the field bears as it bears it: "a fess", "an annulet", and
 * "three chevrons" where several are borne.
 *
 * Several are named by their number alone, with no article before it: "Or three
 * chevrons gules". English would more often give a repeated band a name of its
 * own — chevronels — which the vocabulary does not hold.
 */
export function bearing(word: Word, count?: string): string {
  return count === undefined
    ? `${indefiniteArticle(word)} ${word.value}`
    : `${count} ${word.plural}`;
}

/**
 * How English names the rank of one part of a divided field, or of several parts
 * carrying the same arms: "first", "second and third".
 *
 * A bare ordinal and no article, which is how Parker writes it — "Quarterly;
 * first and fourth gules, three cinquefoils ... ; second gules, three cinquefoils
 * argent" — and several ranks to a phrase are joined by the conjunction that
 * joins anything else.
 */
export function ranked(ranks: readonly number[]): string {
  return ranks.map((rank) => nameOf(EnglishRanks, `${rank}`)).join(` ${CONJUNCTION} `);
}
