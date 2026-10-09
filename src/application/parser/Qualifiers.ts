import { Parser, ParserOutput, Token } from 'typescript-parsec';
import { WrongAgreement } from '../../domain/errors/parsing/WrongAgreement';
import { TermWord, Translation, wordsOf } from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { complaining, positionOf } from './Failures';

/*
 * The words that qualify a charge rather than name one, and are read alike
 * whatever they say of it.
 *
 * Two vocabularies stand here: the modifiers, which say what was done to the
 * figure, and the attributes, which say which of its parts is painted apart. A
 * word of either stands after the charge, agrees with it in the tongues that
 * ask, and names no figure and no tincture of its own — so one reading serves
 * both, and the difference between them is what the phrase does with what comes
 * back.
 */

/**
 * One way such a word may be written, and whether it is the way the phrase
 * holding it asks for.
 *
 * Every writing of every term is offered, the agreeing ones and the rest alike,
 * because the rest are exactly what has to be complained about: a blazon that
 * wrote "au losange évidée" wrote a word this vocabulary holds and put it in the
 * wrong shape, which is a mistake worth naming and not a word to be passed over
 * in silence.
 */
export interface QualifierForm<T extends string, W extends Word = Word> extends TermWord<T, W> {
  /** Whether this writing agrees with what the phrase said of the charge. */
  readonly agrees: boolean;
  /** The writing that would have agreed, which is what a refusal asks for. */
  readonly expected: string;
}

/**
 * The word a blazon writes after what it qualifies, where it writes one.
 *
 * Absence is silent and disagreement is not. Nothing whatever is owed here — a
 * charge is complete without either kind of word, and most of them can take
 * none — so a word that is no such word at all leaves the phrase exactly as it
 * stood, and the rules that follow are free to make of it whatever they can. A
 * word that is one, written in a shape that does not agree, has committed the
 * phrase and is refused by name.
 *
 * Which writings agree is settled before ever a blazon is read, by the phrase
 * that built this: French builds one of these per article and per number, and
 * English builds the one, agreeing with everything.
 */
export function qualifying<T extends string, W extends Word>(
  forms: ReadonlyMap<string, QualifierForm<T, W>>
): Parser<TokenKind, TermWord<T, W> | undefined> {
  return {
    parse(
      token: Token<TokenKind> | undefined
    ): ParserOutput<TokenKind, TermWord<T, W> | undefined> {
      const absent: ParserOutput<TokenKind, TermWord<T, W> | undefined> = {
        successful: true,
        candidates: [{ firstToken: token, nextToken: token, result: undefined }],
        error: undefined,
      };
      if (token === undefined || token.kind !== TokenKind.Word) {
        return absent;
      }

      const written = token.text.toLowerCase();
      const form = forms.get(written);
      if (form === undefined) {
        return absent;
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
        candidates: [
          {
            firstToken: token,
            nextToken: token.next,
            result: { term: form.term, word: form.word },
          },
        ],
        error: undefined,
      };
    },
  };
}

/**
 * Every writing of every term, all of them agreeing: what a tongue that asks for
 * no agreement reads.
 *
 * English is such a tongue. "Voided" stands after one lozenge and after three of
 * them unchanged, and "stoned" stands after either, so every spelling the word
 * answers to is right wherever it is written, and there is nothing here for a
 * blazon to get wrong.
 */
export function anyWriting<T extends string, W extends Word>(
  terms: Translation<T, W>
): ReadonlyMap<string, QualifierForm<T, W>> {
  const forms = new Map<string, QualifierForm<T, W>>();
  for (const term of Object.keys(terms) as T[]) {
    for (const word of wordsOf(terms, term)) {
      for (const spelling of word.spellings) {
        for (const written of [spelling.value, spelling.plural]) {
          forms.set(written.toLowerCase(), { term, word, agrees: true, expected: word.value });
        }
      }
    }
  }
  return forms;
}
