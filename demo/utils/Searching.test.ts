import { describe, expect, test } from 'vitest';
import { found, sought, termsIn } from './Searching';

/** Blazons stand for themselves: a search is worth testing on what it will meet. */
const BLAZONS = [
  "Parti d'or et de gueules",
  'De gueules',
  "D'azur à la macle d'or",
  "D'or au lion de sable",
];

const searched = (query: string) => sought(BLAZONS, query, (blazon) => [blazon]);

describe('termsIn', () => {
  test('takes each word of a query as a term of its own', () => {
    expect(termsIn('or gueules')).toEqual([
      { text: 'or', whole: false },
      { text: 'gueules', whole: false },
    ]);
  });

  test('takes a quoted phrase whole, spaces and all', () => {
    expect(termsIn('"per pale" or')).toEqual([
      { text: 'per pale', whole: true },
      { text: 'or', whole: false },
    ]);
  });

  test('takes a phrase still being typed as a phrase', () => {
    expect(termsIn('"per pal')).toEqual([{ text: 'per pal', whole: true }]);
  });

  test('folds a term as the text it will be looked for in is folded', () => {
    expect(termsIn('Écartelé')).toEqual([{ text: 'ecartele', whole: false }]);
  });

  test('asks for nothing where nothing was written', () => {
    expect(termsIn('   ')).toEqual([]);
    expect(termsIn('""')).toEqual([]);
  });
});

describe('found', () => {
  test('counts a word wherever it stands', () => {
    expect(found(["D'or et d'or"], termsIn('or'))).toBe(2);
  });

  test('counts a word inside a longer one', () => {
    // The or of bordure is an or as far as a plain search is concerned.
    expect(found(['à la bordure de gueules'], termsIn('or'))).toBe(1);
  });

  test('counts a quoted word only where it stands whole', () => {
    expect(found(["D'or, à la bordure de gueules"], termsIn('"or"'))).toBe(1);
  });

  test('holds a quoted word apart from an accented letter as from any other', () => {
    expect(found(['semé de macles'], termsIn('"se"'))).toBe(0);
  });

  test('counts every term together', () => {
    expect(found(["Parti d'or et de gueules"], termsIn('or gueules'))).toBe(2);
  });

  test('reads every part of a wording', () => {
    expect(found(['Bourgogne', "Bandé d'or et d'azur"], termsIn('bourgogne azur'))).toBe(2);
  });

  test('ignores the case and the accents of both sides', () => {
    expect(found(['Écartelé de gueules'], termsIn('ECARTELE'))).toBe(1);
  });

  test('counts nothing for a term the text has not got', () => {
    expect(found(['De gueules'], termsIn('vair'))).toBe(0);
  });
});

describe('sought', () => {
  test('gives back everything where nothing was asked for', () => {
    expect(searched('')).toEqual(BLAZONS);
  });

  test('keeps only what a term stands in', () => {
    expect(searched('macle')).toEqual(["D'azur à la macle d'or"]);
  });

  test('keeps what matches any one term, not only what matches them all', () => {
    expect(searched('gueules macle')).toHaveLength(3);
  });

  test('ranks the most matches first', () => {
    expect(searched('or gueules')).toEqual([
      "Parti d'or et de gueules",
      'De gueules',
      "D'azur à la macle d'or",
      "D'or au lion de sable",
    ]);
  });

  test('leaves ties in the order they came in', () => {
    expect(searched('or')).toEqual([
      "Parti d'or et de gueules",
      "D'azur à la macle d'or",
      "D'or au lion de sable",
    ]);
  });

  test('sifts on a quoted phrase as it stands', () => {
    expect(
      sought(['Per pale or and gules', 'Per bend or and gules'], '"per pale"', (b) => [b])
    ).toEqual(['Per pale or and gules']);
  });

  test('gives back nothing where nothing answers', () => {
    expect(searched('hermine')).toEqual([]);
  });
});
