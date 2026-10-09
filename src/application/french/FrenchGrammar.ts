import { alt, seq, tok } from 'typescript-parsec';
import { FrenchWord } from '../../domain/translations/fr/FrenchWord';
import { FrenchPlain } from '../../domain/translations/fr/Plain';
import { PIECES } from '../../domain/translations/fr/Variations';
import { TokenKind } from '../lexer/Lexer';
import { writtenAs } from '../../domain/translations/Translation';
import { anyKeyword, keyword } from '../parser/Combinators';

// French plumbing, not heraldry: the articles and conjunctions that hold a
// blazon together, whether it is being read or written. Every heraldic term
// itself comes from domain/translations, and each word there carries the gender
// and the elision its article has to agree with, so nothing here keeps a list of
// which words are which.

/**
 * Every way a blazon may say the field bears a word, the one it is written back
 * out in first.
 *
 * Usually there is only one, the article agreeing in gender: "à la fasce", "au
 * chevron". Two things widen it. Before a word that begins on a vowel the
 * article elides and the two genders fall together, so "annelet" is borne "à
 * l'annelet" and nothing in the phrase says it is masculine — which words elide
 * is the word's own to declare, the same declaration "de" already reads. And a
 * word whose gender heraldry and the language at large disagree about is read
 * under either article, the armorials being written both ways.
 */
export function everyBearing(word: FrenchWord): readonly string[] {
  if (word.needsElision) {
    return [`à l'${word.value}`];
  }
  const feminine = `à la ${word.value}`;
  const masculine = `au ${word.value}`;
  if (word.acceptsBothGender) {
    return word.isFeminine ? [feminine, masculine] : [masculine, feminine];
  }
  return [word.isFeminine ? feminine : masculine];
}

/**
 * Renders what the field bears as it bears it: "à la fasce", "au chevron", "à
 * l'annelet", and "à trois chevrons" where several are borne.
 *
 * The count takes the article's place rather than joining it: blazonry says "à
 * trois chevrons", where ordinary French would say "aux trois chevrons". There
 * is no gender left to agree with there, the number having taken the phrase over
 * from the name.
 */
export function bearing(word: FrenchWord, count?: string): string {
  return count === undefined ? everyBearing(word)[0] : `à ${count} ${word.plural}`;
}

/**
 * Renders a varied field as French cuts it: "fascé d'or et d'azur", and "bandé
 * d'or et d'azur de huit pièces" where the pieces are not the six understood.
 *
 * French writes the number only when it has something to say — "le bandé est
 * normalement divisé en six pièces, qu'on ne blasonne pas" — so the usual count
 * is left unwritten and read back out of the name alone. Where a field has no
 * usual count, as the émanché has not, no count is ever the usual one and the
 * number is always written.
 */
export function cutIn(word: FrenchWord, tinctures: string, pieces: string, usual: boolean): string {
  return usual ? `${word.value} ${tinctures}` : `${word.value} ${tinctures} de ${pieces} ${PIECES}`;
}

/**
 * Renders the figure a field is sown with, under the article that introduces it:
 * "semé de billettes", "semé d'annelets".
 *
 * It is the same "de" a tincture is introduced by and elides on the same terms,
 * so the word's own declaration answers for both. What is sown is named in the
 * plural, a field being sown with more of it than anybody counts.
 */
export function sownIn(word: FrenchWord): string {
  return word.needsElision ? `d'${word.plural}` : `de ${word.plural}`;
}

/**
 * How a word that qualifies another agrees with it: in gender, and in number.
 *
 * It is what the phrase said and not what the word is. A modifier has no gender
 * of its own — "évidé" is neither masculine nor feminine until it is put beside
 * something — so the agreement travels from the phrase that named the charge to
 * the word that qualifies it, and a blazon that chose one gender is held to it.
 */
export interface Agreement {
  readonly feminine: boolean;
  readonly several: boolean;
}

/**
 * Every agreement a phrase naming this word will take, the one it is written
 * back out in first.
 *
 * Usually the one: the word's own gender, in whatever number the phrase bears
 * it. A word heraldry and the language at large disagree about the gender of is
 * agreed with either way, by the same reckoning that reads it under either
 * article — where nothing in the phrase says which gender was meant, nothing can
 * be held against the writer for choosing the other.
 */
export function agreementsOf(word: FrenchWord, several: boolean): readonly Agreement[] {
  const own: Agreement = { feminine: word.isFeminine, several };
  return word.acceptsBothGender ? [own, { feminine: !word.isFeminine, several }] : [own];
}

/**
 * Renders a modifier agreeing with what it modifies: "au tourteau de gueules
 * évidé", "à la billette d'or évidée", "à trois billettes d'or évidées".
 *
 * It agrees with the word the charge is written back out in, whatever gender the
 * blazon that was read had chosen: the losange is written feminine here, so what
 * is said of it is feminine too.
 */
export function agreeing(word: FrenchWord, modifier: FrenchWord, several: boolean): string {
  return modifier.agreeing(word.isFeminine, several);
}

/**
 * The word French calls a bare field by: "de gueules plain", which says the
 * shield carries its tincture and nothing whatever besides.
 *
 * It names no term and adds nothing to what the field is, so it is read as a
 * keyword and is never written back out. What it means is the vocabulary's to
 * say, and is said there, beside every other word a reader of the armorials
 * meets.
 */
export const PLAIN = anyKeyword(writtenAs(FrenchPlain));

/** The conjunction joining the halves of a divided field. */
export const CONJUNCTION = 'et';

export const AND = keyword(CONJUNCTION);

// The three shapes "à" takes before one band or charge. Each is a fixed phrase,
// so a rule built on one knows which article it read without having to carry it
// along.
export const A_LA = seq(keyword('à'), keyword('la'));
export const AU = keyword('au');
export const A_L = seq(keyword('à'), tok(TokenKind.ElidedArticle));

// What stands before several of an ordinary. Blazonry says "à trois bandes de
// gueules", where ordinary French would contract the article: that is the form
// written back out. "Aux trois aiglettes d'argent" is written too, by armorials
// that are no less real for it, so it is read and quietly normalised.
export const BEFORE_SEVERAL = alt(keyword('à'), keyword('aux'));
