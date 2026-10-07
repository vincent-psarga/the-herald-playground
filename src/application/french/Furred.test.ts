import { describe, expect, test } from 'vitest';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { FieldType } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Furs, Metals } from '../../domain/models/Tinctures';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';

const parser = new FrenchBlazonParser();

describe('furred fields', () => {
  test('reads "Vairé d\'or et de gueules" as the bells of vair cut from that pair', () => {
    expect(parser.parse("Vairé d'or et de gueules")).toEqual({
      field: {
        type: FieldType.vairy,
        firstTincture: Metals.or,
        secondTincture: Colours.gules,
      },
    });
  });

  test('counts nothing: a pelt is cut to no number of pieces', () => {
    expect(parser.parse("Vairé d'or et de gueules").field).not.toHaveProperty('pieces');
  });

  test('gives the first tincture named the bells that reach the chief', () => {
    expect(parser.parse("Vairé de gueules et d'or").field).toMatchObject({
      firstTincture: Colours.gules,
      secondTincture: Metals.or,
    });
  });

  test('accepts tinctures named without their article', () => {
    expect(parser.parse('Vairé or et gueules').field).toMatchObject({
      firstTincture: Metals.or,
      secondTincture: Colours.gules,
    });
  });

  test('is case insensitive, and closes with the optional full stop', () => {
    expect(parser.parse("VAIRÉ D'OR ET DE GUEULES.")).toEqual(
      parser.parse("vairé d'or et de gueules")
    );
  });

  test('bears an ordinary over the pelt, as any other field does', () => {
    expect(parser.parse("Vairé d'or et de gueules à la fasce d'azur")).toEqual({
      field: { type: FieldType.vairy, firstTincture: Metals.or, secondTincture: Colours.gules },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.azure }],
    });
  });

  /**
   * The fur itself is a tincture and carries its own argent and azure, so it
   * names no pair and is read as the plain field it is. Nothing about the one
   * reading gets in the way of the other.
   */
  test('leaves "de vair" the plain field of the tincture it is', () => {
    expect(parser.parse("De vair à la fasce d'or")).toEqual({
      field: { type: FieldType.plain, tincture: Furs.vair },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
    });
  });

  test('a vairé may itself be cut from a fur, absurd as that would be to draw', () => {
    expect(parser.parse("Vairé d'hermine et de vair").field).toMatchObject({
      type: FieldType.vairy,
      firstTincture: Furs.ermine,
      secondTincture: Furs.vair,
    });
  });

  test('refuses a vairé that names but one tincture', () => {
    expect(() => parser.parse("Vairé d'or")).toThrow();
  });

  test('refuses a vairé that names none at all, and says which phrase owed them', () => {
    expect(() => parser.parse('Vairé')).toThrow(MissingTincture);
    expect(() => parser.parse('Vairé')).toThrow(/Vairé/);
  });

  test('refuses a word that names no tincture after the fur', () => {
    expect(() => parser.parse("Vairé d'or et de fuchsia")).toThrow(UnknownTincture);
  });

  test('refuses the pieces a varied field would have been counted in', () => {
    expect(() => parser.parse("Vairé d'or et de gueules de six pièces")).toThrow();
  });
});
