import { describe, expect, test } from 'vitest';
import { FieldType } from '../../domain/models/Field';
import { ChargeType } from '../../domain/models/Charge';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { MissingPieces } from '../../domain/errors/parsing/MissingPieces';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { RepeatedOrdinary } from '../../domain/errors/parsing/RepeatedOrdinary';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { UnknownDivision } from '../../domain/errors/parsing/UnknownDivision';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import {
  COLOURS,
  Colours,
  Furs,
  METALS,
  Metals,
  TINCTURES,
  Tincture,
} from '../../domain/models/Tinctures';
import { nameOf, wordOf } from '../../domain/translations/Translation';
import { EnglishChargeType } from '../../domain/translations/en/Charges';
import { EnglishTinctures } from '../../domain/translations/en/Tinctures';
import { bearing } from '../english/EnglishGrammar';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';

const parser = new EnglishBlazonParser();

describe('EnglishBlazonParser', () => {
  test.each(TINCTURES)('reads a plain field of %s', (tincture) => {
    expect(parser.parse(nameOf(EnglishTinctures, tincture))).toEqual({
      field: { type: FieldType.plain, tincture },
    });
  });

  test('reads a divided field', () => {
    expect(parser.parse('Per pale azure and or.')).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Colours.azure,
        secondTincture: Metals.or,
      },
    });
  });

  test.each([
    ['Per fess', FieldType.fess],
    ['Per bend', FieldType.bend],
    ['Per bend sinister', FieldType.bendSinister],
    // The one partition written without a "per": the armorials say "quarterly",
    // and Parker's "party per cross" is the gloss rather than the blazon.
    ['Quarterly', FieldType.cross],
    ['Per saltire', FieldType.saltire],
  ])('reads "%s" as a field divided per that line', (name, type) => {
    expect(parser.parse(`${name} gules and argent`)).toEqual({
      field: { type, firstTincture: Colours.gules, secondTincture: Metals.argent },
    });
  });

  test('prefers the longer division name over the shorter one it starts with', () => {
    const blazon = parser.parse('Per bend sinister sable and or');
    expect(blazon.field).toMatchObject({ type: FieldType.bendSinister });
  });

  test('is case insensitive', () => {
    expect(parser.parse('PER PALE AZURE AND OR')).toEqual({
      field: { type: FieldType.pale, firstTincture: Colours.azure, secondTincture: Metals.or },
    });
  });

  test('takes the closing full stop or leaves it', () => {
    expect(parser.parse('Vert.')).toEqual(parser.parse('Vert'));
  });

  describe('a field bearing an ordinary', () => {
    test('reads "Azure a fess or" as a fess on an azure field', () => {
      expect(parser.parse('Azure a fess or')).toEqual({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
      });
    });

    test.each([
      ['chief', OrdinaryType.chief],
      ['pale', OrdinaryType.pale],
      ['fess', OrdinaryType.fess],
      ['bend', OrdinaryType.bend],
      ['bend sinister', OrdinaryType.bendSinister],
      ['chevron', OrdinaryType.chevron],
      ['cross', OrdinaryType.cross],
      ['saltire', OrdinaryType.saltire],
    ])('reads "a %s" as that ordinary', (name, type) => {
      expect(parser.parse(`Gules a ${name} argent`)).toEqual({
        field: { type: FieldType.plain, tincture: Colours.gules },
        chargesOrOrdinaries: [{ type, tincture: Metals.argent }],
      });
    });

    test('tells "a fess" laid on a field from "per fess" dividing one', () => {
      expect(parser.parse('Azure a fess or').field).toEqual({
        type: FieldType.plain,
        tincture: Colours.azure,
      });
      expect(parser.parse('Per fess azure and or')).not.toHaveProperty('chargesOrOrdinaries');
    });

    test('lays an ordinary on a divided field', () => {
      expect(parser.parse('Per pale azure and or a saltire gules')).toEqual({
        field: {
          type: FieldType.pale,
          firstTincture: Colours.azure,
          secondTincture: Metals.or,
        },
        chargesOrOrdinaries: [{ type: OrdinaryType.saltire, tincture: Colours.gules }],
      });
    });

    test('rejects an ordinary named without its article', () => {
      expect(() => parser.parse('Azure fess or')).toThrow();
    });

    test('rejects an ordinary the vocabulary does not know', () => {
      expect(() => parser.parse('Azure a gyron or')).toThrow(UnknownOrdinary);
      expect(() => parser.parse('Azure a gyron or')).toThrow(/Unknown ordinary: gyron/);
    });

    test('prefers the longer ordinary name over the shorter one it starts with', () => {
      expect(parser.parse('Argent a bend sinister gules').chargesOrOrdinaries).toMatchObject([
        {
          type: OrdinaryType.bendSinister,
        },
      ]);
      expect(parser.parse('Argent a bend gules').chargesOrOrdinaries).toMatchObject([
        {
          type: OrdinaryType.bend,
        },
      ]);
    });

    test.each([
      ['pale', OrdinaryType.pale],
      ['fess', OrdinaryType.fess],
      ['bend', OrdinaryType.bend],
      ['bend sinister', OrdinaryType.bendSinister],
    ])('tells "a %s" borne from "per %s" dividing', (name, type) => {
      expect(parser.parse(`Argent a ${name} gules`).chargesOrOrdinaries).toMatchObject([{ type }]);
      expect(parser.parse(`Per ${name} argent and gules`)).not.toHaveProperty(
        'chargesOrOrdinaries'
      );
    });

    test('rejects an ordinary with no tincture of its own, as a missing tincture', () => {
      expect(() => parser.parse('Azure a fess')).toThrow(MissingTincture);
    });
  });

  describe('rejections', () => {
    test('rejects a tincture it does not know', () => {
      expect(() => parser.parse('Fuchsia')).toThrow(UnknownTincture);
      expect(() => parser.parse('Fuchsia')).toThrow(/Unknown tincture: fuchsia/);
    });

    test('rejects a French blazon', () => {
      expect(() => parser.parse("D'azur")).toThrow();
      expect(() => parser.parse("Parti d'azur et d'or")).toThrow();
    });

    test('rejects a division naming only one tincture', () => {
      expect(() => parser.parse('Per pale azure')).toThrow();
    });

    test('rejects two tinctures without "and"', () => {
      expect(() => parser.parse('Per pale azure or')).toThrow();
    });

    test('rejects a division without its "per", as a division it does not hold', () => {
      expect(() => parser.parse('Pale azure and or')).toThrow(UnknownDivision);
      expect(() => parser.parse('Pale azure and or')).toThrow(/Unknown division: pale/);
    });
  });
});

describe('reading the same arms in either language', () => {
  const french = new FrenchBlazonParser();

  test('English and French agree on what a blazon means', () => {
    expect(parser.parse('Per pale azure and or')).toEqual(french.parse("Parti d'azur et d'or"));
    expect(parser.parse('Vert')).toEqual(french.parse('De sinople'));
    expect(parser.parse('Per fess gules and argent')).toEqual(
      french.parse("Coupé de gueules et d'argent")
    );
    // The two tongues name this one differently — English after the quarters,
    // French after the quartering — and still mean the one field.
    expect(parser.parse('Quarterly argent and azure')).toEqual(
      french.parse("Écartelé d'argent et d'azur")
    );
    // English keeps "quarterly" for the one cut and names the other after its
    // line; French calls both of them quartered and says which by adding words.
    expect(parser.parse('Per saltire argent and azure')).toEqual(
      french.parse("Écartelé en sautoir d'argent et d'azur")
    );
  });

  test('agree on a field bearing an ordinary', () => {
    expect(parser.parse('Azure a fess or')).toEqual(french.parse("D'azur à la fasce d'or"));
    expect(parser.parse('Gules a chevron argent')).toEqual(
      french.parse("De gueules au chevron d'argent")
    );
    expect(parser.parse('Or a saltire sable')).toEqual(french.parse("D'or au sautoir de sable"));
    expect(parser.parse('Argent a bend gules')).toEqual(
      french.parse("D'argent à la bande de gueules")
    );
    expect(parser.parse('Argent a bend sinister gules')).toEqual(
      french.parse("D'argent à la barre de gueules")
    );
    expect(parser.parse('Azure a chief or')).toEqual(french.parse("D'azur au chef d'or"));
    expect(parser.parse('Azure a pale or')).toEqual(french.parse("D'azur au pal d'or"));
    expect(parser.parse('Argent a cross gules')).toEqual(
      french.parse("D'argent à la croix de gueules")
    );
  });
});

describe('a field bearing several of one ordinary', () => {
  test('reads "Or three chevrons gules" as three chevrons on an or field', () => {
    expect(parser.parse('Or three chevrons gules')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Colours.gules, count: 3 }],
    });
  });

  test.each([
    ['two pales', OrdinaryType.pale, 2],
    ['three fesses', OrdinaryType.fess, 3],
    ['three bars gemel', OrdinaryType.barGemel, 3],
    ['four bends', OrdinaryType.bend, 4],
    ['six bends sinister', OrdinaryType.bendSinister, 6],
    ['sixteen chevrons', OrdinaryType.chevron, 16],
  ])('reads "%s" as that many of that ordinary', (borne, type, count) => {
    expect(parser.parse(`Azure ${borne} or`).chargesOrOrdinaries).toEqual([
      {
        type,
        tincture: Metals.or,
        count,
      },
    ]);
  });

  test('names the count with nothing in front of it, where one takes an article', () => {
    expect(parser.parse('Or a chevron gules').chargesOrOrdinaries?.[0]).not.toHaveProperty('count');
    expect(() => parser.parse('Or a three chevrons gules')).toThrow();
  });

  test('reads the count in figures as readily as in words', () => {
    expect(parser.parse('Or 3 chevrons gules')).toEqual(parser.parse('Or three chevrons gules'));
  });

  test('closes with the optional full stop, and is read whatever its case', () => {
    expect(parser.parse('OR THREE CHEVRONS GULES.')).toEqual(
      parser.parse('Or three chevrons gules')
    );
  });

  describe('rejections', () => {
    test.each(['chiefs', 'crosses', 'saltires'])('refuses several %s, borne but once', (word) => {
      expect(() => parser.parse(`Or two ${word} gules`)).toThrow(RepeatedOrdinary);
    });

    test('refuses a count of one', () => {
      expect(() => parser.parse('Or 1 chevrons gules')).toThrow(/not more than one/);
      expect(() => parser.parse('Or one chevrons gules')).toThrow();
    });

    test('refuses the singular name after a count', () => {
      expect(() => parser.parse('Or two chevron gules')).toThrow(UnknownOrdinary);
    });

    test('refuses a word that is no number at all', () => {
      expect(() => parser.parse('Or many chevrons gules')).toThrow();
    });

    test('still owes them a tincture of their own', () => {
      expect(() => parser.parse('Or two chevrons')).toThrow(MissingTincture);
    });
  });
});

describe('the bar gemel', () => {
  test('reads a name of two words, and the noun that pluralises inside it', () => {
    expect(parser.parse('Argent a bar gemel gules').chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.barGemel,
        tincture: Colours.gules,
      },
    ]);
    expect(parser.parse('Argent three bars gemel gules').chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.barGemel,
        tincture: Colours.gules,
        count: 3,
      },
    ]);
  });

  test('is not read from the plural spelled the easy way', () => {
    expect(() => parser.parse('Argent three bar gemels gules')).toThrow();
  });
});

describe('the bordure, in English', () => {
  test('reads "Argent a bordure gules" as a bordure on an argent field', () => {
    expect(parser.parse('Argent a bordure gules.')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
    });
  });

  test('reads the plain border, which says the same thing', () => {
    expect(parser.parse('Argent a border gules')).toEqual(parser.parse('Argent a bordure gules'));
  });

  test('is borne but once, a shield having one edge', () => {
    expect(() => parser.parse('Or two bordures gules')).toThrow(RepeatedOrdinary);
  });
});

describe('a field bearing more than one ordinary, in English', () => {
  test('reads the bends and the bordure', () => {
    expect(parser.parse('Or three bends sable, a bordure gules.')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.bend, tincture: Colours.sable, count: 3 },
        { type: OrdinaryType.bordure, tincture: Colours.gules },
      ],
    });
  });

  test('keeps them in the order the blazon laid them', () => {
    expect(
      parser
        .parse('Or a bordure gules, three bends sable')
        .chargesOrOrdinaries?.map(({ type }) => type)
    ).toEqual([OrdinaryType.bordure, OrdinaryType.bend]);
  });

  test('reads them with no mark between, the article saying it alone', () => {
    expect(parser.parse('Azure a fess or a chief gules')).toEqual(
      parser.parse('Azure a fess or, a chief gules')
    );
  });

  test('still owes every one of them a tincture', () => {
    expect(() => parser.parse('Azure a fess or, a chevron')).toThrow(MissingTincture);
  });
});

describe('varied fields, in English', () => {
  test('reads "Barry of six argent and gules" as a field cut in six', () => {
    expect(parser.parse('Barry of six argent and gules')).toEqual({
      field: {
        type: FieldType.barry,
        firstTincture: Metals.argent,
        secondTincture: Colours.gules,
        pieces: 6,
      },
    });
  });

  test.each([
    ['barry', FieldType.barry],
    ['paly', FieldType.paly],
    ['bendy', FieldType.bendy],
    ['chevronny', FieldType.chevronny],
  ])('reads "%s" as that varied field', (name, type) => {
    expect(parser.parse(`${name} of six or and azure`).field).toMatchObject({ type });
  });

  test('takes the number the term is understood to have where the blazon names none', () => {
    expect(parser.parse('Barry argent and gules')).toEqual(
      parser.parse('Barry of six argent and gules')
    );
  });

  test('counts the pieces between the name and the tinctures, never after them', () => {
    expect(parser.parse('Paly of eight argent and gules').field).toMatchObject({ pieces: 8 });
    expect(() => parser.parse('Paly argent and gules of eight')).toThrow();
  });

  test('reads the count in figures as readily as in words', () => {
    expect(parser.parse('Bendy of 10 or and azure')).toEqual(
      parser.parse('Bendy of ten or and azure')
    );
  });

  test('bears an ordinary over the pieces', () => {
    expect(parser.parse('Bendy of eight or and azure a bordure gules')).toMatchObject({
      field: { type: FieldType.bendy, pieces: 8 },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure }],
    });
  });

  describe('the pily, which no number is understood of', () => {
    test('reads the count it is always written with', () => {
      expect(parser.parse('Pily of eight argent and gules').field).toEqual({
        type: FieldType.pily,
        firstTincture: Metals.argent,
        secondTincture: Colours.gules,
        pieces: 8,
      });
    });

    test('reads the longer name Parker gives it, which says the piles are counterposed', () => {
      expect(parser.parse('Pily counter pily of seven argent and gules')).toEqual(
        parser.parse('Pily of seven argent and gules')
      );
    });

    test('is refused where the blazon never counted it', () => {
      expect(() => parser.parse('Pily argent and gules')).toThrow(MissingPieces);
    });
  });

  describe('rejections', () => {
    test('refuses an odd number of pieces of a field whose tinctures alternate', () => {
      expect(() => parser.parse('Barry of five argent and gules')).toThrow(/5 is odd/);
    });

    test('refuses a varied field the vocabulary does not know', () => {
      expect(() => parser.parse('Lozengy argent and gules')).toThrow(UnknownDivision);
    });

    test('tells "barry" borne from "per fess" dividing', () => {
      expect(parser.parse('Barry argent and gules').field).toMatchObject({
        type: FieldType.barry,
      });
      expect(parser.parse('Per fess argent and gules').field).toMatchObject({
        type: FieldType.fess,
      });
    });

    test('still owes both its tinctures', () => {
      expect(() => parser.parse('Barry of six argent and')).toThrow(MissingTincture);
    });
  });
});

describe('furred fields, in English', () => {
  test('reads "Vairy or and gules" as the bells of vair cut from that pair', () => {
    expect(parser.parse('Vairy or and gules')).toEqual({
      field: {
        type: FieldType.vairy,
        firstTincture: Metals.or,
        secondTincture: Colours.gules,
      },
    });
  });

  test('counts nothing: a pelt is cut to no number of pieces', () => {
    expect(parser.parse('Vairy or and gules').field).not.toHaveProperty('pieces');
  });

  test.each(['vairy', 'vairé', 'vaire'])('reads "%s" as the same field', (name) => {
    expect(parser.parse(`${name} or and gules`)).toEqual(parser.parse('Vairy or and gules'));
  });

  test('bears an ordinary over the pelt, as any other field does', () => {
    expect(parser.parse('Vairy or and gules a fess azure')).toEqual({
      field: { type: FieldType.vairy, firstTincture: Metals.or, secondTincture: Colours.gules },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.azure }],
    });
  });

  test('tells "vairy" the field from "vair" the tincture, which names no pair', () => {
    expect(parser.parse('Vairy argent and azure').field).toMatchObject({ type: FieldType.vairy });
    expect(parser.parse('Vair').field).toEqual({ type: FieldType.plain, tincture: Furs.vair });
  });

  test('still owes both its tinctures', () => {
    expect(() => parser.parse('Vairy or and')).toThrow(MissingTincture);
  });

  test('counts nothing after the tinctures either', () => {
    expect(() => parser.parse('Vairy of six or and gules')).toThrow();
  });
});

describe('charges, in English', () => {
  test('reads "Argent three billets or" as three billets on an argent field', () => {
    expect(parser.parse('Argent three billets or')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: ChargeType.billet, tincture: Metals.or, count: 3 }],
    });
  });

  test.each([
    ['an annulet', ChargeType.annulet],
    ['a billet', ChargeType.billet],
    ['a lozenge', ChargeType.lozenge],
  ])('reads "%s" as that charge', (borne, type) => {
    expect(parser.parse(`Gules ${borne} argent`)).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type, tincture: Metals.argent }],
    });
  });

  test('reads "an" before a word that begins on a vowel, which is what English writes', () => {
    expect(bearing(wordOf(EnglishChargeType, ChargeType.annulet))).toBe('an annulet');
    expect(bearing(wordOf(EnglishChargeType, ChargeType.billet))).toBe('a billet');
  });

  test('names every charge with an article the parser then accepts', () => {
    for (const type of Object.values(ChargeType)) {
      const borne = bearing(wordOf(EnglishChargeType, type));
      expect(parser.parse(`Azure ${borne} or`).chargesOrOrdinaries).toEqual([
        { type, tincture: Metals.or },
      ]);
    }
  });

  test.each([
    ['two annulets', ChargeType.annulet, 2],
    ['six lozenges', ChargeType.lozenge, 6],
  ])('reads "%s" as that many of that charge', (borne, type, count) => {
    expect(parser.parse(`Azure ${borne} or`).chargesOrOrdinaries).toEqual([
      { type, tincture: Metals.or, count },
    ]);
  });

  test('bears every charge in number, none of them being a place on the shield', () => {
    for (const type of Object.values(ChargeType)) {
      const word = wordOf(EnglishChargeType, type);
      expect(parser.parse(`Azure three ${word.plural} or`).chargesOrOrdinaries).toEqual([
        { type, tincture: Metals.or, count: 3 },
      ]);
    }
  });

  test('holds a charge in the list a band is held in, there being one list', () => {
    expect(parser.parse('Azure a fess or').chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.fess, tincture: Metals.or },
    ]);
    expect(parser.parse('Azure a billet or').chargesOrOrdinaries).toEqual([
      { type: ChargeType.billet, tincture: Metals.or },
    ]);
  });

  test('reads bands and charges into one list, in the order the blazon laid them', () => {
    expect(parser.parse('Or a fess gules, three billets azure.')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.gules },
        { type: ChargeType.billet, tincture: Colours.azure, count: 3 },
      ],
    });
  });

  test('keeps a charge blazoned before a band before it', () => {
    expect(
      parser
        .parse('Or three billets azure, a fess gules')
        .chargesOrOrdinaries?.map(({ type }) => type)
    ).toEqual([ChargeType.billet, OrdinaryType.fess]);
  });

  test('says the same thing as the French, which is the whole point', () => {
    const french = new FrenchBlazonParser();
    expect(parser.parse('Argent three billets or')).toEqual(
      french.parse("D'argent à trois billettes d'or")
    );
    expect(parser.parse('Azure an annulet or')).toEqual(french.parse("D'azur à l'annelet d'or"));
    expect(parser.parse('Gules a lozenge argent')).toEqual(
      french.parse('De gueules au losange d’argent')
    );
  });

  test('still owes the charge a tincture of its own', () => {
    expect(() => parser.parse('Argent three billets')).toThrow(MissingTincture);
  });

  test('refuses the singular name after a count', () => {
    expect(() => parser.parse('Argent three billet or')).toThrow(UnknownOrdinary);
  });
});

describe('the roundel, which English names after its tincture', () => {
  const ROUNDELS: readonly (readonly [string, Tincture])[] = [
    ['a besant', Metals.or],
    ['a bezant', Metals.or],
    ['a plate', Metals.argent],
    ['a torteau', Colours.gules],
    ['a hurt', Colours.azure],
    ['a pellet', Colours.sable],
    ['a pomme', Colours.vert],
  ];

  test.each(ROUNDELS)(
    'reads "%s" as a roundel of the tincture its name means',
    (borne, tincture) => {
      expect(parser.parse(`Sable ${borne}`)).toEqual({
        field: { type: FieldType.plain, tincture: Colours.sable },
        chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture }],
      });
    }
  );

  test('takes the tincture written out in full, though the name has said it already', () => {
    expect(parser.parse('Gules a besant or')).toEqual(parser.parse('Gules a besant'));
    expect(parser.parse('Or a torteau gules')).toEqual(parser.parse('Or a torteau'));
  });

  test('refuses a name in a tincture it does not mean', () => {
    expect(() => parser.parse('Gules a besant argent')).toThrow(InvalidTincture);
    expect(() => parser.parse('Gules a besant argent')).toThrow(/besant is never argent/);
    expect(() => parser.parse('Or a plate gules')).toThrow(InvalidTincture);
  });

  test.each(ROUNDELS)('holds "%s" to the one tincture it names', (borne, tincture) => {
    for (const other of [...METALS, ...COLOURS].filter((shade) => shade !== tincture)) {
      expect(() => parser.parse(`Sable ${borne} ${nameOf(EnglishTinctures, other)}`)).toThrow(
        InvalidTincture
      );
    }
  });

  test('reads the plain roundel in any tincture, and owes one, having named none', () => {
    expect(parser.parse('Azure a roundel ermine').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Furs.ermine },
    ]);
    expect(() => parser.parse('Azure a roundel')).toThrow(MissingTincture);
  });

  test('bears them in number, the plural of torteau being torteaux', () => {
    expect(parser.parse('Azure three besants').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.or, count: 3 },
    ]);
    expect(parser.parse('Or three torteaux').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Colours.gules, count: 3 },
    ]);
  });

  test('lays a besant beside a band, the tincture it never wrote ending nothing', () => {
    expect(parser.parse('Azure a besant, a fess gules').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.or },
      { type: OrdinaryType.fess, tincture: Colours.gules },
    ]);
  });

  test('still reports a word that named no tincture at all after a besant', () => {
    expect(() => parser.parse('Azure a besant bogus')).toThrow(UnknownTincture);
  });

  test('says the same thing as the French, which is the whole point', () => {
    const french = new FrenchBlazonParser();
    expect(parser.parse('Gules a besant')).toEqual(french.parse('De gueules au besant'));
    expect(parser.parse('Or three torteaux')).toEqual(
      french.parse("D'or à trois tourteaux de gueules")
    );
    expect(parser.parse('Azure a plate')).toEqual(french.parse("D'azur au besant d'argent"));
  });
});
