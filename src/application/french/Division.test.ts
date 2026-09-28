import { describe, expect, test } from 'vitest';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { FieldType } from '../../domain/models/Field';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { UnknownDivision } from '../../domain/errors/parsing/UnknownDivision';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';

const parser = new FrenchBlazonParser();

describe('divided fields', () => {
  test('reads "Parti d\'azur et d\'or" as a field divided per pale', () => {
    expect(parser.parse("Parti d'azur et d'or")).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Colours.azure,
        secondTincture: Metals.or,
      },
    });
  });

  test.each([
    ['parti', FieldType.pale],
    ['coupé', FieldType.fess],
    ['tranché', FieldType.bend],
    ['taillé', FieldType.bendSinister],
    ['écartelé', FieldType.cross],
    ['écartelé en sautoir', FieldType.saltire],
  ])('%s divides the field per %s', (name, type) => {
    expect(parser.parse(`${name} de gueules et d'argent`)).toEqual({
      field: { type, firstTincture: Colours.gules, secondTincture: Metals.argent },
    });
  });

  test('reads "Écartelé d\'argent et d\'azur" as a field quartered', () => {
    // Two tinctures and no more: the first takes the quarters numbered 1 and 4,
    // the second the two between them. A shield whose quarters each carry a
    // coat of their own — "écartelé : aux 1 et 4 ..., aux 2 et 3 ..." — is a
    // different blazon and is not read.
    expect(parser.parse("Écartelé d'argent et d'azur")).toEqual({
      field: {
        type: FieldType.cross,
        firstTincture: Metals.argent,
        secondTincture: Colours.azure,
      },
    });
  });

  test('reads "Écartelé en sautoir" as the field cut corner to corner', () => {
    // The other of the two quarterings: cut by a tranché and a taillé rather
    // than by a parti and a coupé, so the quarters stand on their points.
    expect(parser.parse("Écartelé en sautoir d'argent et d'azur")).toEqual({
      field: {
        type: FieldType.saltire,
        firstTincture: Metals.argent,
        secondTincture: Colours.azure,
      },
    });
  });

  test('prefers the longer quartering over the shorter name it begins with', () => {
    // "Écartelé" spells a term of its own, so both readings are offered and it
    // is what follows that settles which was meant.
    expect(parser.parse("Écartelé de gueules et d'argent").field).toMatchObject({
      type: FieldType.cross,
    });
    expect(parser.parse("Écartelé en sautoir de gueules et d'argent").field).toMatchObject({
      type: FieldType.saltire,
    });
  });

  test('accepts tinctures named without their article', () => {
    expect(parser.parse('Parti azur et or')).toEqual({
      field: { type: FieldType.pale, firstTincture: Colours.azure, secondTincture: Metals.or },
    });
  });

  test('accepts the same tincture on both sides', () => {
    expect(parser.parse("Coupé d'or et d'or")).toEqual({
      field: { type: FieldType.fess, firstTincture: Metals.or, secondTincture: Metals.or },
    });
  });

  test('is case insensitive', () => {
    expect(parser.parse("TRANCHÉ D'AZUR ET DE SABLE")).toEqual({
      field: {
        type: FieldType.bend,
        firstTincture: Colours.azure,
        secondTincture: Colours.sable,
      },
    });
  });

  test('reads an accent that arrives decomposed', () => {
    const decomposed = "Coupé d'or et de sable".normalize('NFD');
    expect(decomposed).not.toBe("Coupé d'or et de sable");
    expect(parser.parse(decomposed)).toEqual({
      field: { type: FieldType.fess, firstTincture: Metals.or, secondTincture: Colours.sable },
    });
  });

  test('closes with the optional full stop', () => {
    expect(parser.parse("Parti d'azur et d'or.")).toEqual({
      field: { type: FieldType.pale, firstTincture: Colours.azure, secondTincture: Metals.or },
    });
  });

  describe('rejections', () => {
    test('rejects a division naming only one tincture', () => {
      expect(() => parser.parse("Parti d'azur")).toThrow();
    });

    test('reports a division whose tinctures never arrive as missing one', () => {
      expect(() => parser.parse('Coupé')).toThrow(MissingTincture);
    });

    test('rejects two tinctures without "et"', () => {
      expect(() => parser.parse("Parti d'azur d'or")).toThrow();
    });

    test('rejects an unknown division as a division it does not hold', () => {
      expect(() => parser.parse("Gironné d'azur et d'or")).toThrow(UnknownDivision);
      expect(() => parser.parse("Gironné d'azur et d'or")).toThrow(/Unknown division: gironné/);
    });

    test('still reports an unknown tincture rather than an unknown division', () => {
      expect(() => parser.parse('de fuchsia')).toThrow(UnknownTincture);
      expect(() => parser.parse('de fuchsia')).toThrow(/Unknown tincture: fuchsia/);
    });

    test('carries the elision rule into both halves', () => {
      expect(() => parser.parse("Parti d'azur et de or")).toThrow(UnknownTincture);
      expect(() => parser.parse("Parti d'azur et de or")).toThrow(/expected "d'or"/);
    });
  });
});
