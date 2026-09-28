import { describe, expect, test } from 'vitest';
import { Blazon } from '../../domain/models/Blazon';
import {
  DIVISIONS,
  DivisionType,
  FieldType,
  VARIATIONS,
  VariationType,
} from '../../domain/models/Field';
import { ChargeType } from '../../domain/models/Charge';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Furs, Metals, TINCTURES, Tincture } from '../../domain/models/Tinctures';
import { EnglishBlazonParser } from '../parser/EnglishBlazonParser';
import { EnglishBlazonWriter } from './EnglishBlazonWriter';

const writer = new EnglishBlazonWriter();
const parser = new EnglishBlazonParser();

describe('EnglishBlazonWriter', () => {
  test('writes a plain field', () => {
    expect(writer.write({ field: { type: FieldType.plain, tincture: Colours.azure } })).toBe(
      'Azure.'
    );
  });

  test('writes a divided field', () => {
    expect(
      writer.write({
        field: {
          type: FieldType.pale,
          firstTincture: Colours.azure,
          secondTincture: Metals.or,
        },
      })
    ).toBe('Per pale azure and or.');
  });

  test.each<[DivisionType, string]>([
    [FieldType.fess, 'Per fess'],
    [FieldType.bend, 'Per bend'],
    [FieldType.bendSinister, 'Per bend sinister'],
    [FieldType.cross, 'Quarterly'],
  ])('names %s in English', (type, name) => {
    const written = writer.write({
      field: { type, firstTincture: Colours.gules, secondTincture: Metals.argent },
    });
    expect(written).toBe(`${name} gules and argent.`);
  });

  test('introduces a tincture bare, with no article', () => {
    expect(writer.write({ field: { type: FieldType.plain, tincture: Metals.or } })).toBe('Or.');
    expect(writer.write({ field: { type: FieldType.plain, tincture: Colours.gules } })).toBe(
      'Gules.'
    );
  });

  describe('a field bearing an ordinary', () => {
    test('writes the ordinary after the field, in its own tincture', () => {
      expect(
        writer.write({
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
        })
      ).toBe('Azure a fess or.');
    });

    test.each([
      [OrdinaryType.chief, 'a chief'],
      [OrdinaryType.pale, 'a pale'],
      [OrdinaryType.fess, 'a fess'],
      [OrdinaryType.bend, 'a bend'],
      [OrdinaryType.bendSinister, 'a bend sinister'],
      [OrdinaryType.chevron, 'a chevron'],
      [OrdinaryType.cross, 'a cross'],
      [OrdinaryType.saltire, 'a saltire'],
    ])('names %s as "%s"', (type, borne) => {
      expect(
        writer.write({
          field: { type: FieldType.plain, tincture: Colours.gules },
          chargesOrOrdinaries: [{ type, tincture: Metals.argent }],
        })
      ).toBe(`Gules ${borne} argent.`);
    });

    test('keeps the article that tells a borne fess from a divided field', () => {
      const borne = writer.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
      });
      const divided = writer.write({
        field: {
          type: FieldType.fess,
          firstTincture: Colours.azure,
          secondTincture: Metals.or,
        },
      });
      expect(borne).toBe('Azure a fess or.');
      expect(divided).toBe('Per fess azure and or.');
    });

    test.each<[OrdinaryType, DivisionType, string, string]>([
      [OrdinaryType.pale, FieldType.pale, 'a pale', 'Per pale'],
      [OrdinaryType.fess, FieldType.fess, 'a fess', 'Per fess'],
      [OrdinaryType.bend, FieldType.bend, 'a bend', 'Per bend'],
      [OrdinaryType.bendSinister, FieldType.bendSinister, 'a bend sinister', 'Per bend sinister'],
    ])(
      'keeps %s borne apart from the partition of the same name',
      (borne, divides, article, per) => {
        expect(
          writer.write({
            field: { type: FieldType.plain, tincture: Metals.argent },
            chargesOrOrdinaries: [{ type: borne, tincture: Colours.gules }],
          })
        ).toBe(`Argent ${article} gules.`);
        expect(
          writer.write({
            field: {
              type: divides,
              firstTincture: Metals.argent,
              secondTincture: Colours.gules,
            },
          })
        ).toBe(`${per} argent and gules.`);
      }
    );

    test('writes an ordinary laid on a divided field', () => {
      expect(
        writer.write({
          field: {
            type: FieldType.pale,
            firstTincture: Colours.azure,
            secondTincture: Metals.or,
          },
          chargesOrOrdinaries: [{ type: OrdinaryType.saltire, tincture: Colours.gules }],
        })
      ).toBe('Per pale azure and or a saltire gules.');
    });
  });
});

describe('round trip', () => {
  const roundTrip = (blazon: Blazon) => parser.parse(writer.write(blazon));

  test.each(TINCTURES)('a plain field of %s survives being written and read back', (tincture) => {
    const blazon: Blazon = { field: { type: FieldType.plain, tincture } };
    expect(roundTrip(blazon)).toEqual(blazon);
  });

  test.each(DIVISIONS)('a field divided per %s survives the round trip', (type) => {
    const blazon: Blazon = {
      field: { type, firstTincture: Colours.sable, secondTincture: Metals.or },
    };
    expect(roundTrip(blazon)).toEqual(blazon);
  });

  test.each(Object.values(OrdinaryType))('a field bearing %s survives the round trip', (type) => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type, tincture: Metals.or }],
    };
    expect(roundTrip(blazon)).toEqual(blazon);
  });

  test.each(TINCTURES)('an ordinary of %s survives with its own tincture', (tincture) => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Colours.sable },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture }],
    };
    expect(roundTrip(blazon)).toEqual(blazon);
  });

  test('a divided field bearing an ordinary survives the round trip', () => {
    const blazon: Blazon = {
      field: {
        type: FieldType.bend,
        firstTincture: Colours.gules,
        secondTincture: Metals.argent,
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Colours.sable }],
    };
    expect(roundTrip(blazon)).toEqual(blazon);
  });
});

describe('several of one ordinary', () => {
  test('writes the count in place of the article, and the name in the plural', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Metals.or },
        chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Colours.gules, count: 2 }],
      })
    ).toBe('Or two chevrons gules.');
  });

  test('pluralises the noun of a name that runs to two words', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Metals.or },
        chargesOrOrdinaries: [
          { type: OrdinaryType.bendSinister, tincture: Colours.gules, count: 3 },
        ],
      })
    ).toBe('Or three bends sinister gules.');
  });

  test('writes a single band with its article, count or no count', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Metals.or },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.gules, count: 1 }],
      })
    ).toBe('Or a fess gules.');
  });

  test('survives the round trip, count and all', () => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.pale, tincture: Metals.argent, count: 2 }],
    };
    expect(parser.parse(writer.write(blazon))).toEqual(blazon);
  });
});

describe('a field bearing more than one ordinary, in English', () => {
  const ARMS: Blazon = {
    field: { type: FieldType.plain, tincture: Metals.or },
    chargesOrOrdinaries: [
      { type: OrdinaryType.bend, tincture: Colours.sable, count: 3 },
      { type: OrdinaryType.bordure, tincture: Colours.gules },
    ],
  };

  test('writes them one after the other, a comma between', () => {
    expect(writer.write(ARMS)).toBe('Or three bends sable, a bordure gules.');
  });

  test('writes them in the order they are laid', () => {
    expect(
      writer.write({ ...ARMS, chargesOrOrdinaries: [...ARMS.chargesOrOrdinaries!].reverse() })
    ).toBe('Or a bordure gules, three bends sable.');
  });

  test('survives the round trip, the order and all', () => {
    expect(parser.parse(writer.write(ARMS))).toEqual(ARMS);
  });

  test('writes the border back as the bordure blazon spells it', () => {
    expect(writer.write(parser.parse('Argent a border gules'))).toBe('Argent a bordure gules.');
  });
});

describe('a varied field, in English', () => {
  const varied = (type: VariationType, pieces: number): Blazon => ({
    field: { type, firstTincture: Metals.argent, secondTincture: Colours.gules, pieces },
  });

  test('counts the pieces between the name and the tinctures', () => {
    expect(writer.write(varied(FieldType.barry, 6))).toBe('Barry of six argent and gules.');
  });

  test('counts them even where the number is the one the term is understood to have', () => {
    // English states the number of bands before their tinctures, always, where
    // French keeps quiet about the usual six. The same model, written twice.
    expect(writer.write(varied(FieldType.bendy, 6))).toBe('Bendy of six argent and gules.');
    expect(writer.write(varied(FieldType.bendy, 8))).toBe('Bendy of eight argent and gules.');
  });

  test.each<[VariationType, string]>([
    [FieldType.barry, 'Barry'],
    [FieldType.paly, 'Paly'],
    [FieldType.bendy, 'Bendy'],
    [FieldType.pily, 'Pily'],
    [FieldType.chevronny, 'Chevronny'],
  ])('names %s in English', (type, name) => {
    expect(writer.write(varied(type, 6))).toBe(`${name} of six argent and gules.`);
  });

  test('survives the round trip, the count and all', () => {
    for (const type of VARIATIONS) {
      const blazon = varied(type, 8);
      expect(parser.parse(writer.write(blazon))).toEqual(blazon);
    }
  });

  test('writes the longer name of the pily back as the short one', () => {
    expect(writer.write(parser.parse('Pily counter pily of six argent and gules'))).toBe(
      'Pily of six argent and gules.'
    );
  });

  test('writes what it bears after the pieces it is cut into', () => {
    expect(writer.write(parser.parse('Bendy of eight or and azure a bordure gules'))).toBe(
      'Bendy of eight or and azure a bordure gules.'
    );
  });
});

describe('a furred field, in English', () => {
  const furred: Blazon = {
    field: {
      type: FieldType.vairy,
      firstTincture: Metals.argent,
      secondTincture: Colours.gules,
    },
  };

  test('names the fur and the pair it is cut from, and counts nothing', () => {
    expect(writer.write(furred)).toBe('Vairy argent and gules.');
  });

  test('survives the round trip', () => {
    expect(parser.parse(writer.write(furred))).toEqual(furred);
  });

  test('writes the borrowed French spelling back as the English one', () => {
    expect(writer.write(parser.parse('Vairé or and azure'))).toBe('Vairy or and azure.');
  });

  test('writes what it bears after the pair the pelt is cut from', () => {
    expect(writer.write(parser.parse('Vairy or and azure a bordure gules'))).toBe(
      'Vairy or and azure a bordure gules.'
    );
  });
});

describe('a field bearing charges, in English', () => {
  test.each([
    [ChargeType.annulet, 'Azure an annulet or.'],
    [ChargeType.billet, 'Azure a billet or.'],
    [ChargeType.lozenge, 'Azure a lozenge or.'],
  ])('writes %s under the article its name calls for', (type, expected) => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type, tincture: Metals.or }],
      })
    ).toBe(expected);
  });

  test('writes the count before the plural, with no article at all', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Metals.argent },
        chargesOrOrdinaries: [{ type: ChargeType.lozenge, tincture: Metals.or, count: 3 }],
      })
    ).toBe('Argent three lozenges or.');
  });

  test('writes bands and charges in the order the model holds them, a comma between', () => {
    const laid: Blazon = {
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.gules },
        { type: ChargeType.billet, tincture: Colours.azure, count: 3 },
      ],
    };
    expect(writer.write(laid)).toBe('Or a fess gules, three billets azure.');
    expect(
      writer.write({
        ...laid,
        chargesOrOrdinaries: [...laid.chargesOrOrdinaries!].reverse(),
      })
    ).toBe('Or three billets azure, a fess gules.');
  });

  test('survives the round trip, count and all', () => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [{ type: ChargeType.annulet, tincture: Colours.gules, count: 6 }],
    };
    expect(parser.parse(writer.write(blazon))).toEqual(blazon);
  });

  test('writes the roundel under the name English gives its tincture', () => {
    const roundel = (tincture: Tincture) =>
      writer.write({
        field: { type: FieldType.plain, tincture: Colours.sable },
        chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture }],
      });
    expect(roundel(Metals.or)).toBe('Sable a besant.');
    expect(roundel(Metals.argent)).toBe('Sable a plate.');
    expect(roundel(Colours.gules)).toBe('Sable a torteau.');
    expect(roundel(Colours.azure)).toBe('Sable a hurt.');
    expect(roundel(Colours.vert)).toBe('Sable a pomme.');
  });

  test('falls back on the plain roundel where English named no such disc', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture: Furs.ermine }],
      })
    ).toBe('Azure a roundel ermine.');
  });

  test('writes a roundel the reader wrote the long way round back the short way', () => {
    expect(writer.write(parser.parse('Azure a roundel or'))).toBe('Azure a besant.');
    expect(writer.write(parser.parse('Azure a bezant'))).toBe('Azure a besant.');
  });

  test('counts them in the plural, and still leaves the tincture to the name', () => {
    expect(
      writer.write({
        field: { type: FieldType.plain, tincture: Metals.or },
        chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture: Colours.gules, count: 3 }],
      })
    ).toBe('Or three torteaux.');
  });

  test.each(TINCTURES)('writes a roundel %s as a blazon the parser reads back', (tincture) => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Colours.sable },
      chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture }],
    };
    expect(parser.parse(writer.write(blazon))).toEqual(blazon);
  });
});
