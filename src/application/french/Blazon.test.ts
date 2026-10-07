import { describe, expect, test } from 'vitest';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { withArticle } from '../Articles';
import { Colours, Metals, TINCTURES } from '../../domain/models/Tinctures';
import { wordOf } from '../../domain/translations/Translation';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { FieldType } from '../../domain/models/Field';

const parser = new FrenchBlazonParser();

describe('parseBlazon', () => {
  test.each(TINCTURES)('reads a field %s into the blazon', (tincture) => {
    expect(parser.parse(withArticle(wordOf(FrenchTinctures, tincture)))).toEqual({
      field: { type: FieldType.plain, tincture },
    });
  });

  test('accepts a field named without its article', () => {
    expect(parser.parse('azur')).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
    });
  });

  test('accepts the capitalisation a blazon is written with', () => {
    expect(parser.parse("D'Or")).toEqual({ field: { type: FieldType.plain, tincture: Metals.or } });
  });

  test('rejects an unknown tincture', () => {
    expect(() => parser.parse('de fuchsia')).toThrow(UnknownTincture);
    expect(() => parser.parse('de fuchsia')).toThrow(/Unknown tincture: fuchsia/);
  });

  test('rejects a wrong elision as a tincture it could not read', () => {
    expect(() => parser.parse('de or')).toThrow(UnknownTincture);
    expect(() => parser.parse('de or')).toThrow(/expected "d'or"/);
  });

  describe('the closing full stop', () => {
    test('accepts a blazon that ends with one', () => {
      expect(parser.parse("D'azur.")).toEqual({
        field: { type: FieldType.plain, tincture: Colours.azure },
      });
    });

    test('accepts a blazon that omits it', () => {
      expect(parser.parse("D'azur")).toEqual({
        field: { type: FieldType.plain, tincture: Colours.azure },
      });
    });

    test('rejects a doubled stop', () => {
      expect(() => parser.parse("D'azur..")).toThrow();
    });

    test('rejects a stop on its own', () => {
      expect(() => parser.parse('.')).toThrow();
    });

    test('rejects a stop before the field', () => {
      expect(() => parser.parse(".D'azur")).toThrow();
    });
  });
});
