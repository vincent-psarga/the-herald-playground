import { Token, buildLexer } from 'typescript-parsec';

export enum TokenKind {
  Elision,
  Article,
  /** The definite article elided before a vowel: "à l'annelet". */
  ElidedArticle,
  Word,
  Number,
  Period,
  Separator,
  Space,
}

// The lexer keeps the longest match, and breaks ties with the first rule listed:
// `Article` must therefore come before `Word`, since both match "de" exactly.
// A longer word that merely starts with "de" ("dextre") still lexes as a `Word`.
export const lexer = buildLexer<TokenKind>([
  [true, /^[Dd]['’]/g, TokenKind.Elision],
  [true, /^[Dd][Ee]\b/g, TokenKind.Article],
  // "l'" is longer than the word "l" the letter pattern would otherwise read, so
  // the longest match takes it; "la" and "le" are words and are untouched.
  [true, /^[Ll]['’]/g, TokenKind.ElidedArticle],
  // A word, and a word hyphenated to another: "fleur-de-lis" is one name and is
  // read as one, where a bare hyphen with no letters behind it is no word at all.
  [true, /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:-[A-Za-zÀ-ÖØ-öø-ÿ]+)*/g, TokenKind.Word],
  // How many of a charge are borne, written in figures. A blazon more often
  // writes the number out in words, which are words like any other and are not
  // read as numbers yet.
  [true, /^[0-9]+/g, TokenKind.Number],
  [true, /^\./g, TokenKind.Period],
  // What a blazon sets between the things a field bears, and between the parts
  // of a divided field: "à trois bandes de sable ; à la bordure de gueules",
  // "mi-parti : au premier d'or, et au second de gueules". Which mark is used
  // says nothing, so the three are one kind, and a blazon that sets none is read
  // just the same.
  [true, /^[,;:]/g, TokenKind.Separator],
  [false, /^\s+/g, TokenKind.Space],
]);

// An accent can arrive decomposed ("e" followed by a combining acute), which the
// letter pattern above does not cover, so input is composed before tokenising.
export function tokenise(input: string): Token<TokenKind> | undefined {
  return lexer.parse(input.normalize('NFC'));
}
