import { describe, expect, test } from 'vitest';
import { FieldType, half } from '../../domain/models/Field';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { FrenchBlazonParser } from './FrenchBlazonParser';

const parser = new FrenchBlazonParser();

describe('FrenchBlazonParser', () => {
  test('reads a plain field', () => {
    expect(parser.parse("D'azur.")).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
    });
  });

  test('reads a divided field', () => {
    expect(parser.parse("Parti d'azur et d'or.")).toEqual({
      field: { type: FieldType.pale, parts: [half(Colours.azure), half(Metals.or)] },
    });
  });

  test('refuses a blazon it cannot read', () => {
    expect(() => parser.parse('De fuchsia')).toThrow(/Unknown tincture/);
  });
});
