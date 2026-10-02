import {
  ParseError,
  ParseResult,
  Parser,
  ParserOutput,
  Token,
  apply,
  seq,
} from 'typescript-parsec';
import { BlazonParseError, TextPosition } from '../../domain/errors/parsing/BlazonParseError';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { RepeatedOrdinary } from '../../domain/errors/parsing/RepeatedOrdinary';
import { BorneType } from '../../domain/models/Blazon';
import { ChargeType, allowsModifier, isChargeType } from '../../domain/models/Charge';
import { Modifier } from '../../domain/models/Modifier';
import {
  OrdinaryDefinitions,
  OrdinaryType,
  SEVERAL,
  admitsModifier,
  isOrdinaryType,
} from '../../domain/models/Ordinary';
import { Tincture } from '../../domain/models/Tinctures';
import { NumberWords } from '../../domain/translations/Numbers';
import { TermWord, Translation, asSeveral } from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { guard, spelledTerm } from './Combinators';
import { Vocabulary, complaining, positionOf, textBetween } from './Failures';
import { number } from './Numbers';

/**
 * A term as a blazon named it among the things a field bears: which one, and how
 * many of it where the blazon said more than one.
 *
 * The count is what a language reads and the shared rule turns into the model;
 * how a language says it — "à trois chevrons", "three chevrons" — is its own
 * business. A band and a charge are named by the same phrase, so both are read
 * into this.
 */
export interface Borne<T extends string, W extends Word = Word> {
  readonly type: T;
  /**
   * The word that named it, which the phrase is not done with once the term is
   * known: a word may be a tincture as well as a name — a besant is gold — and
   * only the word can say what tincture is understood after it, or refused.
   */
  readonly word: W;
  /** How many are borne, where more than one is. */
  readonly count?: number;
  /**
   * What the blazon may say of it once its tincture has been named, where the
   * language lets a blazon say anything: "voided", "évidée".
   *
   * It is a rule and not a word because the words that may stand here are the
   * phrase's own business. A modifier agrees with what it modifies, and what it
   * has to agree with is what this very phrase said — "au losange" made the
   * charge masculine and "à la losange" made it feminine, and no later rule can
   * recover which was written. So the phrase that named the charge hands on the
   * reading of whatever may follow it, and a tongue that agrees with nothing
   * hands on one that accepts the word as it stands.
   */
  readonly modifier?: Parser<TokenKind, TermWord<Modifier> | undefined>;
}

/**
 * A count a vocabulary will not take, for the terms it will not take one of.
 *
 * Refusing is a reading's business rather than the model's: the field cannot
 * bear two chiefs, and a blazon that asks for two is told so by name rather than
 * by failing to parse. A vocabulary whose every term may be borne in number —
 * the charges are — supplies none of this.
 */
export interface Refusal<T extends string, W extends Word> {
  readonly accepts: (named: TermWord<T, W>, count: number) => boolean;
  readonly complain: (
    named: TermWord<T, W>,
    count: number,
    position?: TextPosition
  ) => BlazonParseError;
}

/** One of something, which is what a name with no number before it says. */
export function alone<T extends string, W extends Word>(
  named: Parser<TokenKind, TermWord<T, W>>
): Parser<TokenKind, Borne<T, W>> {
  return apply(named, ({ term, word }): Borne<T, W> => ({ type: term, word }));
}

/**
 * How many are borne, which is never one.
 *
 * A single band is named on its own — "au chevron", "a chevron" — so a number
 * standing before a name is there to say that there are several, and "one" says
 * the opposite of what the phrase it opens is for.
 */
function count(number: Parser<TokenKind, number>): Parser<TokenKind, number> {
  return guard(
    number,
    (count) => count >= SEVERAL,
    (count, position) =>
      new BlazonParseError(
        `A count says there are several: ${count} is not more than one`,
        position
      )
  );
}

/**
 * Several of one term: how many, and which — the name being read in the plural,
 * because that is how a blazon that bears several writes it.
 */
export function several<T extends string, W extends Word, N extends Word>(
  terms: Translation<T, W>,
  numbers: NumberWords<N>,
  vocabulary: Vocabulary,
  refusal?: Refusal<T, W>
): Parser<TokenKind, Borne<T, W>> {
  const counting = number(numbers);
  const named = seq(count(counting), spelledTerm(terms, vocabulary, asSeveral));
  return begunByTheCount(
    counting,
    apply(
      refusal === undefined
        ? named
        : guard(
            named,
            ([count, match]) => refusal.accepts(match, count),
            ([count, match], position) => refusal.complain(match, count, position)
          ),
      ([count, { term, word }]): Borne<T, W> => ({ type: term, word, count })
    )
  );
}

/**
 * A phrase whose complaint is moved off the number that opened it and onto the
 * word after it.
 *
 * A number standing where a charge is borne is not some other phrase misread:
 * this one has begun, and whatever is wrong with it lies further on. Left on the
 * number, the complaint would make an English blazon — which names the number
 * first, with nothing before it — look like a phrase that never began at all,
 * and a phrase that never began is given up on in silence rather than reported.
 *
 * What says the phrase began is the number alone, counted or not: "one" is a
 * number a blazon may not bear several of, and saying so is the whole point.
 */
function begunByTheCount<T>(
  number: Parser<TokenKind, number>,
  parser: Parser<TokenKind, T>
): Parser<TokenKind, T> {
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, T> {
      const output = parser.parse(token);
      if (output.successful) {
        return output;
      }
      const counted = number.parse(token);
      const name = counted.successful ? counted.candidates[0]?.nextToken : undefined;
      return name === undefined
        ? output
        : { successful: false, error: { ...output.error, pos: name.pos } };
    },
  };
}

/**
 * What a field bears: a band or a charge.
 *
 * Both are named by the same phrase — an article or a count, then the name, then
 * a tincture — so both are read from one vocabulary rather than tried one after
 * the other. Tried separately, every word in neither list would fail both
 * readings at the same place, and the complaint would be settled by whichever
 * was listed first rather than by anything about the blazon.
 *
 * The union is the model's own, the writer having the same two vocabularies to
 * ask about; it is named again here because this is where a reader of the
 * grammar meets it.
 */
export type { BorneType };

export type BorneTerm = Borne<BorneType>;

/**
 * Something borne, told what may be said of it after its tincture.
 *
 * The rule is built from the word, because a tongue that agrees with its words
 * cannot say which writings are right until it knows what they will stand
 * beside — and built once the phrase has been read, because the phrase is the
 * only thing that knows how it introduced the word.
 */
export function modifiable<T extends string, W extends Word>(
  borne: Parser<TokenKind, Borne<T, W>>,
  modifier: (word: W) => Parser<TokenKind, TermWord<Modifier> | undefined>
): Parser<TokenKind, Borne<T, W>> {
  return apply(borne, (one): Borne<T, W> => ({ ...one, modifier: modifier(one.word) }));
}

/**
 * Whether what is borne may be borne under a modifier.
 *
 * Both vocabularies declare their own, and neither holds the other's: a charge
 * is voided or pierced, which is done to its middle, and a band is indented,
 * which is done to the line it is named after. So the question is put to
 * whichever vocabulary named the term, and a charge indented is refused by the
 * same reckoning as a fess voided.
 */
export function bornUnder(type: BorneType, modifier: Modifier): boolean {
  return isChargeType(type) ? allowsModifier(type, modifier) : admitsModifier(type, modifier);
}

/** The two vocabularies a field's bearings are named from, as one. */
export function bearings<W extends Word>(
  ordinaries: Translation<OrdinaryType, W>,
  charges: Translation<ChargeType, W>
): Translation<BorneType, W> {
  return { ...ordinaries, ...charges };
}

/**
 * The refusal the bearings need: four of the ordinaries are borne but once, and
 * every charge may be borne in number.
 */
export const NOT_IN_NUMBER: Refusal<BorneType, Word> = {
  accepts: ({ term }) => !isOrdinaryType(term) || OrdinaryDefinitions[term].canBeBorneInNumbers,
  complain: ({ word }, count, position) =>
    new RepeatedOrdinary(word.plural.toLowerCase(), count, position),
};

/**
 * The tincture something borne carries: named after it, as almost everything
 * borne must be, or else understood from the name itself.
 *
 * Only a word that is a tincture as well as a name may leave it unsaid — "au
 * besant", which is gold because a besant is a gold coin — and such a word
 * refuses the tinctures it does not mean, so that "au besant d'azur" is caught
 * rather than quietly drawn in blue. The refusal fails the phrase: both words
 * are known and the blazon is contradicting itself, which is worth reporting
 * even where some other reading might yet be found.
 *
 * Where the tincture is simply not there and the word supplies one, the reading
 * goes on, and whatever the tincture failed with is carried along beside it: a
 * word that named no tincture at all is likelier to be a misspelled one than a
 * phrase that never began, and the complaint that says so has to outlive the
 * branch that swallowed it. Not so a blazon that merely ended — nothing is owed
 * where the name has already answered.
 */
export function carried(
  tincture: Parser<TokenKind, Tincture>,
  word: Word
): Parser<TokenKind, Tincture> {
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, Tincture> {
      const output = tincture.parse(token);

      if (output.successful) {
        const kept = output.candidates.filter(({ result }) => word.accepts(result));
        return kept.length === 0
          ? { successful: false, error: refused(word, token, output.candidates) }
          : { successful: true, candidates: kept, error: output.error };
      }

      if (word.defaultTincture === undefined) {
        return output;
      }
      return {
        successful: true,
        candidates: [{ firstToken: token, nextToken: token, result: word.defaultTincture }],
        error: output.error.pos === undefined ? undefined : output.error,
      };
    },
  };
}

/** The complaint of a tincture named in full and refused by the name before it. */
function refused(
  word: Word,
  token: Token<TokenKind> | undefined,
  candidates: readonly ParseResult<TokenKind, Tincture>[]
): ParseError {
  const written = textBetween(token, candidates[0].nextToken);
  return complaining(
    token?.pos,
    new InvalidTincture(word.value, written.toLowerCase(), positionOf(token?.pos))
  );
}
