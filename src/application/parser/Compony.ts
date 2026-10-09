import { Parser, ParserOutput, Token } from 'typescript-parsec';
import { WrongAgreement } from '../../domain/errors/parsing/WrongAgreement';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { complaining, positionOf } from './Failures';

/**
 * One way the word for compony may be written, and whether it is the way the
 * phrase holding it asks for.
 *
 * Every writing is offered, agreeing or not, for the reason a modifier's are: "à
 * la bordure componé" wrote the word this vocabulary holds in the wrong shape,
 * which is worth naming rather than passing over.
 */
export interface ComponyForm {
  /** Whether this writing agrees with what the phrase said of the band. */
  readonly agrees: boolean;
  /** The writing that would have agreed, which is what a refusal asks for. */
  readonly expected: string;
}

/**
 * The word saying a band is cut into compons, where the blazon writes it.
 *
 * Unlike a modifier it is owed nothing and owes nothing: it stands where a
 * tincture stands, as one of the things that may stand there, so a word that is
 * not it fails this reading and leaves the tincture to be read instead. A
 * writing that does not agree has committed the phrase, and is refused by name.
 *
 * What comes back is the word as written, for a complaint that has to quote it.
 */
export function componying(forms: ReadonlyMap<string, ComponyForm>): Parser<TokenKind, string> {
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, string> {
      const written = token?.kind === TokenKind.Word ? token.text.toLowerCase() : undefined;
      const form = written === undefined ? undefined : forms.get(written);
      if (token === undefined || written === undefined || form === undefined) {
        return {
          successful: false,
          error: { kind: 'Error', pos: token?.pos, message: 'Expected compony' },
        };
      }
      if (!form.agrees) {
        return {
          successful: false,
          error: complaining(
            token.pos,
            new WrongAgreement(written, form.expected, positionOf(token.pos))
          ),
        };
      }
      return {
        successful: true,
        candidates: [{ firstToken: token, nextToken: token.next, result: written }],
        error: undefined,
      };
    },
  };
}

/**
 * Every writing of the word, all of them agreeing: what a tongue that asks for
 * no agreement reads. English writes "compony" after one bordure and after two
 * bends alike.
 */
export function anyComponyWriting(word: Word): ReadonlyMap<string, ComponyForm> {
  const forms = new Map<string, ComponyForm>();
  for (const spelling of word.spellings) {
    for (const written of [spelling.value, spelling.plural]) {
      forms.set(written.toLowerCase(), { agrees: true, expected: word.value });
    }
  }
  return forms;
}
