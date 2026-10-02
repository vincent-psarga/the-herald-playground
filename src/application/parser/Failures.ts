import { ParseError, Parser, Token, TokenPosition } from 'typescript-parsec';
import { BlazonParseError, TextPosition } from '../../domain/errors/parsing/BlazonParseError';
import { MissingOrdinary } from '../../domain/errors/parsing/MissingOrdinary';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { UnknownDivision } from '../../domain/errors/parsing/UnknownDivision';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { TokenKind } from '../lexer/Lexer';

/**
 * A grammar tries alternatives, so most of its failures are not the blazon's
 * fault and must not escape as exceptions — one rejected branch would take its
 * viable siblings down with it. A complaint therefore travels as data beside the
 * parse error, and is thrown only once the whole parse has given up on it.
 */
type Complaint = ParseError & { readonly failure: BlazonParseError };

/**
 * A term that never arrived, which cannot name itself: nothing was misspelled,
 * so the complaint is owed the phrase it went missing from, and only the rule
 * reading that phrase knows what it was.
 */
type Owing = ParseError & { readonly owed: (context: string) => BlazonParseError };

function named(error: ParseError): error is Complaint {
  return 'failure' in error;
}

function owing(error: ParseError): error is Owing {
  return 'owed' in error && !named(error);
}

/** The library's own reckoning of a position, which counts rows from one. */
export function positionOf(pos: TokenPosition | undefined): TextPosition | undefined {
  return pos === undefined
    ? undefined
    : { index: pos.index, row: pos.rowBegin, column: pos.columnBegin };
}

/** One kind of term, and the two ways a blazon can fail to supply one. */
export type Vocabulary = {
  /** A word naming no term of this kind. */
  readonly unknown: (word: string, position?: TextPosition) => BlazonParseError;
  /** No word at all, the blazon having ended where a term was owed. */
  readonly owed?: (context: string) => BlazonParseError;
};

export const asTincture: Vocabulary = {
  unknown: (word, position) => new UnknownTincture(word, position),
  owed: (context) => new MissingTincture(context),
};

/**
 * A division is the first word of a divided field, so there is no place where
 * one is owed and absent: a blazon that ends before naming anything is owed a
 * tincture, being a plain field that never arrived. Hence no MissingDivision.
 */
export const asDivision: Vocabulary = {
  unknown: (word, position) => new UnknownDivision(word, position),
};

/**
 * A number is no term of the vocabulary — heraldry did not invent counting — so
 * a word standing where one is expected has simply failed to be a number, and
 * the complaint names no kind of its own.
 */
export const asCount: Vocabulary = {
  unknown: (word, position) => new BlazonParseError(`Not a number: ${word}`, position),
};

/**
 * A rank names no heraldic term either — it says which part of a divided field
 * the arms after it are laid in — so a word standing where one is expected has
 * simply failed to be a rank, and the complaint names no kind of its own.
 */
export const asRank: Vocabulary = {
  unknown: (word, position) => new BlazonParseError(`Not a rank: ${word}`, position),
  owed: (context) => new BlazonParseError(`Missing the other part in: ${context}`),
};

export const asOrdinary: Vocabulary = {
  unknown: (word, position) => new UnknownOrdinary(word, position),
  owed: (context) => new MissingOrdinary(context),
};

/** A parse error carrying a complaint that names what went wrong. */
export function complaining(pos: TokenPosition | undefined, failure: BlazonParseError): Complaint {
  return { kind: 'Error', pos, message: failure.message, failure };
}

/** A parse error for a term that never arrived, still owed its phrase. */
export function owed(vocabulary: Vocabulary): ParseError {
  const complain = vocabulary.owed;
  if (complain === undefined) {
    return { kind: 'Error', pos: undefined, message: 'The blazon ended too soon.' };
  }
  const failure: Owing = {
    kind: 'Error',
    pos: undefined,
    message: 'The blazon ended too soon.',
    owed: complain,
  };
  return failure;
}

/**
 * A phrase whose absence at the end of the blazon is a term going missing.
 *
 * A rule that has read enough to know what it is owed can say so plainly: a
 * division has named one tincture where it names two, so a blazon that simply
 * stops is missing a tincture. Left to the leaf parsers, the complaint would be
 * about whatever word stands first in the phrase — the conjunction, which is the
 * grammar's own plumbing and names nothing a reader was trying to write.
 *
 * Only the end of the blazon is answered for. A word that arrived and was the
 * wrong one names itself, and the parser that read it complains better than this
 * could.
 */
export function owedAtEnd<TResult>(
  parser: Parser<TokenKind, TResult>,
  vocabulary: Vocabulary
): Parser<TokenKind, TResult> {
  return {
    parse(token) {
      return token === undefined
        ? { successful: false, error: owed(vocabulary) }
        : parser.parse(token);
    },
  };
}

/**
 * Names the phrase a rule is reading, so a term that never arrived can say where
 * it was owed: a tincture wanting at the end of "à la fasce" is missing from
 * that phrase rather than from the blazon at large.
 *
 * The innermost phrase wins, an ordinary being nearer the failure than the arms
 * that bear it, and a phrase with no words behind it names nothing and defers.
 */
export function within<TResult>(parser: Parser<TokenKind, TResult>): Parser<TokenKind, TResult> {
  return {
    parse(token) {
      const output = parser.parse(token);
      if (output.error === undefined || !owing(output.error)) {
        return output;
      }
      const context = textBetween(token);
      if (context === '') {
        return output;
      }
      const placed = complaining(output.error.pos, output.error.owed(context));
      return output.successful
        ? { successful: true, candidates: output.candidates, error: placed }
        : { successful: false, error: placed };
    },
  };
}

/**
 * The words from here to there, as they were written — to the end of the blazon
 * where nothing says otherwise.
 *
 * The lexer drops the spaces, so they are put back between every pair of tokens
 * but those an elision binds: "d'" and "azur" were one word and stay one. A mark
 * binds the other way round, leaning on the word before it: "au premier d'azur,
 * au second" is how a blazon writes it and how a complaint quoting it should
 * read.
 */
export function textBetween(token: Token<TokenKind> | undefined, until?: Token<TokenKind>): string {
  let text = '';
  for (let current = token; current !== undefined && current !== until; current = current.next) {
    if (text !== '' && !/['’]$/.test(text) && current.kind !== TokenKind.Separator) {
      text += ' ';
    }
    text += current.text;
  }
  return text;
}

/** The complaint a failed parse has to make, named if the grammar named it. */
export function raisedBy(error: ParseError, blazon: string): BlazonParseError {
  if (named(error)) {
    return error.failure;
  }
  if (owing(error)) {
    return error.owed(blazon.trim() === '' ? 'an empty blazon' : blazon);
  }
  return new BlazonParseError(error.message, positionOf(error.pos));
}
