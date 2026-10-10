import { Parser, alt, apply, tok } from 'typescript-parsec';
import { NumberWords } from '../../domain/translations/Numbers';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { spelledTerm } from './Combinators';
import { Vocabulary, asCount } from './Failures';

/**
 * A number, as a blazon writes one: in the language's own word for it — "à trois
 * chevrons", "de six pièces" — or in figures, which is how a note about a blazon
 * reads and which costs nothing to accept.
 *
 * Counting is no part of heraldry, so this belongs to neither the charges that
 * are counted nor the fields that are cut up, and is written once for all of
 * them. A rank is read by it too — "au premier", "au 1" — the words differing
 * and the notation not, so what the complaint should call a word that is neither
 * is the caller's to say.
 */
export function number<W extends Word>(
  numbers: NumberWords<W>,
  vocabulary: Vocabulary = asCount
): Parser<TokenKind, number> {
  // The word is tried before the figure, though a blazon writes the figure as
  // readily: both fail at the same token where neither fits, and a tie there is
  // settled in favour of whichever was listed first — so the reading that has
  // something to say about the word goes first, and "Not a rank: troisième"
  // survives instead of the bare complaint that a figure was not a figure.
  return alt(
    apply(spelledTerm(numbers, vocabulary), ({ term }) => Number.parseInt(term, 10)),
    apply(tok(TokenKind.Number), (token) => Number.parseInt(token.text, 10))
  );
}
