import { Word } from '../domain/translations/Word';
import { TokenKind } from './lexer/Lexer';

// The French "de" a tincture is introduced by, which elides before a vowel. It
// is French plumbing, but not French alone: English borrows the drops' liquids
// whole — "gutté d'eau", "gutté de sang" — and their article with them. So it
// is asked of any word, each word carrying the elision it agrees with.

/** Which article a blazon introduces the word with: "d'" or "de". */
export function expectedArticle(word: Word): TokenKind.Elision | TokenKind.Article {
  return word.needsElision ? TokenKind.Elision : TokenKind.Article;
}

/** Renders a term as it is spoken in a blazon: "d'or", "de gueules". */
export function withArticle(word: Word): string {
  return word.needsElision ? `d'${word.value}` : `de ${word.value}`;
}
