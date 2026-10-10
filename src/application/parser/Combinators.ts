import {
  ParseError,
  ParseResult,
  Parser,
  ParserOutput,
  Token,
  apply,
  resultOrError,
  tok,
} from 'typescript-parsec';
import { BlazonParseError, TextPosition } from '../../domain/errors/parsing/BlazonParseError';
import {
  Spelled,
  TermWord,
  Translation,
  asOne,
  bySpelling,
} from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';
import { TokenKind, tokenise } from '../lexer/Lexer';
import { Vocabulary, complaining, complains, owed, positionOf } from './Failures';

/**
 * Keeps only the candidates a predicate accepts, reporting a rejection as a
 * parse error rather than throwing.
 *
 * Validating inside `apply` would be simpler, but an exception escapes the whole
 * parse: once the grammar offers alternatives, one rejected branch would take
 * its viable siblings down with it. A parse error only fails the branch.
 */
export function guard<TKind, TResult>(
  parser: Parser<TKind, TResult>,
  accepts: (value: TResult) => boolean,
  complain: (value: TResult, position?: TextPosition) => BlazonParseError
): Parser<TKind, TResult> {
  return {
    parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult> {
      const output = parser.parse(token);
      if (!output.successful) {
        return output;
      }

      const kept: ParseResult<TKind, TResult>[] = [];
      let rejection: ParseError | undefined;
      for (const candidate of output.candidates) {
        if (accepts(candidate.result)) {
          kept.push(candidate);
        } else if (rejection === undefined) {
          const pos = candidate.firstToken?.pos;
          rejection = complaining(pos, complain(candidate.result, positionOf(pos)));
        }
      }

      return rejection === undefined ? output : resultOrError(kept, rejection, kept.length !== 0);
    },
  };
}

/**
 * Matches one keyword whatever its casing: "et", "parti".
 *
 * A keyword names no term of the vocabulary — it is the grammar's own plumbing —
 * so a missing one is a plain refusal rather than one of the named kinds.
 */
export function keyword(expected: string): Parser<TokenKind, Token<TokenKind>> {
  return guard(
    tok(TokenKind.Word),
    (token) => token.text.toLowerCase() === expected,
    (token, position) =>
      new BlazonParseError(`Expected "${expected}", found "${token.text}"`, position)
  );
}

/**
 * Matches any one of several spellings of the same keyword: "semy" and the
 * French "semé" it was taken from say the one thing, and a blazon may write
 * either.
 *
 * Which of them was written is not kept, there being nothing to keep: a keyword
 * names no term, so all it can say is that it was there.
 */
export function anyKeyword(expected: readonly string[]): Parser<TokenKind, Token<TokenKind>> {
  const spellings = new Set(expected);
  return guard(
    tok(TokenKind.Word),
    (token) => spellings.has(token.text.toLowerCase()),
    (token, position) =>
      new BlazonParseError(`Expected "${expected[0]}", found "${token.text}"`, position)
  );
}

/**
 * Matches any one spelling of a phrase of several words, however it was spaced
 * and capitalised: "de l'un à l'autre", and "de l'un en l'autre" beside it.
 *
 * Every spelling is given rather than the canonical one alone, by the same
 * reckoning anyKeyword reads every spelling of a keyword: a word may answer to
 * more than one writing of itself without being more than one word, and a
 * grammar that read only the first would refuse what the vocabulary says it
 * holds.
 *
 * The spellings are handed over as the words themselves and read with the very
 * lexer the blazon is read with, so a vocabulary that holds a phrase as one word
 * and a grammar that reads it cannot come to disagree about where its words
 * divide. That matters here more than it would for a keyword: the phrase is half
 * articles, and an article is not a word to the lexer.
 *
 * Nothing is kept but the fact that one of them was there. The phrase names no
 * term of the vocabulary in either tongue — it says what a figure is painted
 * with by pointing at the field rather than by naming anything — so what it
 * means is the caller's to supply, and which spelling said it is no more kept
 * than which spelling of a charge was written.
 *
 * A phrase that breaks off partway complains where it began rather than where it
 * broke off, because breaking off is how it says it was never there: these are
 * fixed words and they commit to nothing. Complaining further along would let a
 * phrase that merely shares its first word with what was written — "de", which
 * opens a French tincture as readily — outrank the complaint of whatever was
 * actually being said.
 */
export function anyPhrase(expected: readonly string[]): Parser<TokenKind, string> {
  // Longest first. Read the other way round, a blazon writing the whole phrase
  // would be understood as the short one with the rest left over, and those
  // words would then be owed a reading nothing can give them.
  const spellings = expected.map(spelling).sort((one, other) => other.length - one.length);

  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, string> {
      for (const words of spellings) {
        const after = following(words, token);
        if (after !== false) {
          return {
            successful: true,
            candidates: [{ firstToken: token, nextToken: after, result: expected[0] }],
            error: undefined,
          };
        }
      }
      return {
        successful: false,
        error: { kind: 'Error', pos: token?.pos, message: `Expected "${expected[0]}"` },
      };
    },
  };
}

/**
 * What stands after these words, where they stand here at all, and false where
 * they do not — which is not the same as nothing: a phrase may run to the very
 * end of the blazon, and then there is nothing after it and it was still there.
 */
function following(
  words: readonly string[],
  token: Token<TokenKind> | undefined
): Token<TokenKind> | undefined | false {
  let current = token;
  for (const word of words) {
    if (current === undefined || plainly(current.text) !== word) {
      return false;
    }
    current = current.next;
  }
  return current;
}

/** The words a phrase is made of, as the lexer divides them. */
function spelling(expected: string): readonly string[] {
  const words: string[] = [];
  for (let token = tokenise(expected); token !== undefined; token = token.next) {
    words.push(plainly(token.text));
  }
  return words;
}

/**
 * Matches the words spelling one of a vocabulary's terms, keeping the word
 * alongside the term for grammars whose articles must agree with it.
 *
 * A term may run over several words — "per bend sinister" — so every prefix that
 * names a term is offered as a candidate rather than the longest one alone: it
 * is the surrounding grammar, not the vocabulary, that knows which reading fits.
 *
 * One of those words may be "de", which the lexer reads as the article it
 * usually is: "fleur de lys" is three tokens and one name. So the article is
 * stepped through where a name is already under way, and never at the start of
 * one — no term of either vocabulary begins with it, and a blazon that opens on
 * an article is naming a tincture rather than a charge.
 *
 * Which form is matched is the caller's to say: a blazon bearing several of an
 * ordinary names them in the plural, and only the rule reading the number knows
 * that it does. Every spelling a word answers to is offered under both, so an
 * alternate wording is read exactly as the spelling it will be written back in.
 */
export function spelledTerm<T extends string, W extends Word>(
  translation: Translation<T, W>,
  vocabulary: Vocabulary,
  spelled: Spelled = asOne
): Parser<TokenKind, TermWord<T, W>> {
  const terms = bySpelling(translation, spelled);
  const longest = Math.max(...Array.from(terms.keys(), (spelling) => spelling.split(' ').length));

  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, TermWord<T, W>> {
      const candidates: ParseResult<TokenKind, TermWord<T, W>>[] = [];
      let current = token;
      let spelling = '';

      for (let words = 0; words < longest && spells(current, words); words += 1) {
        const word = current.text.toLowerCase();
        spelling = words === 0 ? word : `${spelling} ${word}`;
        const next = current.next;
        const match = terms.get(spelling);
        if (match !== undefined) {
          candidates.push({ firstToken: token, nextToken: next, result: match });
        }
        current = next;
      }

      if (candidates.length !== 0) {
        return { successful: true, candidates, error: undefined };
      }

      // A word was read and named nothing, or there was no word at all: the
      // second is not a misspelling and cannot be reported as one.
      const found = spelling === '' ? token?.text : spelling.split(' ')[0];
      return {
        successful: false,
        error:
          found === undefined
            ? owed(vocabulary)
            : complaining(token?.pos, vocabulary.unknown(found, positionOf(token?.pos))),
      };
    },
  };
}

/** Whether this token can be the next word of a name already this many words long. */
function spells(token: Token<TokenKind> | undefined, words: number): token is Token<TokenKind> {
  return token?.kind === TokenKind.Word || (words > 0 && token?.kind === TokenKind.Article);
}

/** Matches a term, keeping only which term it is. */
export function term<T extends string, W extends Word>(
  translation: Translation<T, W>,
  vocabulary: Vocabulary
): Parser<TokenKind, T> {
  return apply(spelledTerm(translation, vocabulary), (match) => match.term);
}

/**
 * Matches something optional that still explains itself once it has begun.
 *
 * `optional` is silent by design, which is right for a phrase that is simply not
 * there. A phrase whose opening words were read and which then went wrong is a
 * different thing: those words committed the reading, so the complaint belongs to
 * the blazon rather than to the grammar's own backtracking. Failing further along
 * than the token it would have started at is what tells the two apart.
 *
 * A phrase may be introduced by something that promises nothing — the mark a
 * blazon sets between the charges it lays on the field. That is stepped over
 * before the phrase is read, and it is the phrase that decides whether anything
 * began: a mark with a phrase after it joins the two, and the same mark with
 * nothing after it is the blazon's own punctuation and is left where it stands.
 */
export function optionalUnlessBegun<TKind, TResult>(
  parser: Parser<TKind, TResult>,
  introduction?: Parser<TKind, unknown>
): Parser<TKind, TResult | undefined> {
  return {
    parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult | undefined> {
      const from = introduction === undefined ? token : stepOver(introduction, token);
      const output = parser.parse(from);
      if (output.successful || began(from, output.error)) {
        return output;
      }
      return {
        successful: true,
        candidates: [{ firstToken: token, nextToken: token, result: undefined }],
        error: undefined,
      };
    },
  };
}

/**
 * One reading where its opening word was written, and the other where it was
 * not.
 *
 * Alternatives are settled by which fails further along, and two that fail at
 * the very same word by which was offered first — so a phrase whose first word
 * was read and then refused there loses to a sibling that never read it, and
 * the blazon is told the wrong thing: "à la fasce componée" would be an unknown
 * tincture. Where the opening word is one no sibling could ever read, it is
 * enough to settle the matter, and the reading it opens is the only one tried.
 *
 * The opening counts as written when it is read, and when it is refused by name:
 * a word written in the wrong shape is still that word.
 */
export function begunBy<TResult>(
  opening: Parser<TokenKind, unknown>,
  reading: Parser<TokenKind, TResult>,
  otherwise: Parser<TokenKind, TResult>
): Parser<TokenKind, TResult> {
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, TResult> {
      const opened = opening.parse(token);
      const written = opened.successful || complains(opened.error);
      return (written ? reading : otherwise).parse(token);
    },
  };
}

/** Where a phrase begins, once whatever introduces it has been read past. */
function stepOver<TKind>(
  introduction: Parser<TKind, unknown>,
  token: Token<TKind> | undefined
): Token<TKind> | undefined {
  const output = introduction.parse(token);
  return output.successful ? output.candidates[0].nextToken : token;
}

/**
 * Whether a reading had got under way before it failed.
 *
 * Failing at the very token it would have started on means nothing here
 * introduces such a phrase at all. Failing later — or running out of input,
 * which is later than any token — means the opening words were read and what
 * they promised is still owed.
 */
function began<TKind>(token: Token<TKind> | undefined, error: ParseError): boolean {
  return token !== undefined && (error.pos === undefined || error.pos.index > token.pos.index);
}

/**
 * Matches a phrase except where another phrase stands in its place.
 *
 * It refuses at the very token it would have begun on, so a rule reading it
 * optionally treats it as absent rather than as begun and gone wrong. That is
 * the whole point: French opens a bearing and a rank with the same word, so a
 * list of what a part bears would read "au second" as far as the article before
 * finding no charge there, and a reading that had got that far is a reading the
 * grammar owes an explanation for. Told what else may stand there, it stops
 * instead, and the rank is left for the rule that was waiting for it.
 */
export function unless<TKind, TResult>(
  parser: Parser<TKind, TResult>,
  other: Parser<TKind, unknown>
): Parser<TKind, TResult> {
  return {
    parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult> {
      if (!other.parse(token).successful) {
        return parser.parse(token);
      }
      return {
        successful: false,
        error: { kind: 'Error', pos: token?.pos, message: 'Another phrase stands here.' },
      };
    },
  };
}

/**
 * Matches something optional, without reporting why it was absent.
 *
 * typescript-parsec's own opt_sc carries the failed branch's error forward, and
 * errors at the same token are settled in favour of the first — so an absent
 * article ends up shadowing the complaint that actually explains the failure.
 */
export function optional<TKind, TResult>(
  parser: Parser<TKind, TResult>
): Parser<TKind, TResult | undefined> {
  return {
    parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult | undefined> {
      const output = parser.parse(token);
      if (output.successful) {
        return output;
      }
      return {
        successful: true,
        candidates: [{ firstToken: token, nextToken: token, result: undefined }],
        error: undefined,
      };
    },
  };
}

/**
 * Something that reports its absence by leaving the phrase alone, read where the
 * phrase does want it.
 *
 * A word that qualifies a charge answers with nothing rather than failing, so
 * that a blazon which said nothing of the sort is left exactly as it stood. A
 * rule that has already read a conjunction is owed one all the same — "armé et"
 * promises a second word — so the absence is turned into a refusal here.
 *
 * The complaint is laid at the token the phrase began on and not at the one it
 * failed on, which is what lets the caller tell a phrase that never began from
 * one that began and went wrong: the mark and the conjunction are read before
 * the word, and a refusal reported after them would look like a promise broken.
 */
export function present<TKind, TResult>(
  parser: Parser<TKind, TResult | undefined>,
  complain: (position?: TextPosition) => BlazonParseError
): Parser<TKind, TResult> {
  return apply(
    guard(
      parser,
      (value) => value !== undefined,
      (_, position) => complain(position)
    ),
    // The guard has refused every candidate that was undefined; nothing the
    // compiler can see says so.
    (value) => value as TResult
  );
}

/**
 * A word as it is compared: folded to lower case, and the curly apostrophe
 * folded to the straight one. The lexer reads either, so a blazon typed with one
 * must match a phrase written with the other.
 */
function plainly(text: string): string {
  return text.toLowerCase().replace(/’/g, "'");
}
