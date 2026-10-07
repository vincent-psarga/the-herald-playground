import { describe, expect, test } from 'vitest';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { WrongOrdinaryArticle } from '../../domain/errors/parsing/WrongOrdinaryArticle';
import { ChargeType } from '../../domain/models/Charge';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { COLOURS, Colours, Furs, METALS, Metals, TINCTURES } from '../../domain/models/Tinctures';
import { wordOf } from '../../domain/translations/Translation';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { bearing, everyBearing } from './FrenchGrammar';
import { withArticle } from '../Articles';
import { FieldType } from '../../domain/models/Field';

const parser = new FrenchBlazonParser();
const CHARGES = Object.values(ChargeType);

describe('a field bearing a charge', () => {
  test('reads "D\'azur à la billette d\'or" as a billet on an azure field', () => {
    expect(parser.parse("D'azur à la billette d'or")).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: ChargeType.billet, tincture: Metals.or }],
    });
  });

  test.each([
    ["à l'annelet", ChargeType.annulet],
    ['à la billette', ChargeType.billet],
    ['à la losange', ChargeType.lozenge],
  ])('reads "%s" as that charge', (borne, type) => {
    expect(parser.parse(`De gueules ${borne} d'argent`)).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type, tincture: Metals.argent }],
    });
  });

  test.each(TINCTURES)('gives the charge a tincture of its own: %s', (tincture) => {
    const blazon = parser.parse(
      `D'azur au losange ${withArticle(wordOf(FrenchTinctures, tincture))}`
    );
    expect(blazon.chargesOrOrdinaries).toEqual([{ type: ChargeType.lozenge, tincture }]);
  });

  test('lays a charge on a divided field as readily as on a plain one', () => {
    expect(
      parser.parse("Parti d'azur et d'or à la billette de gueules").chargesOrOrdinaries
    ).toEqual([{ type: ChargeType.billet, tincture: Colours.gules }]);
  });

  test('is case insensitive, and closes with the optional full stop', () => {
    expect(parser.parse("D'AZUR AU LOSANGE D'OR.")).toEqual(parser.parse("d'azur au losange d'or"));
  });

  test('holds the charge in the list a band is held in, there being one list', () => {
    expect(parser.parse("D'azur à la fasce d'or").chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.fess, tincture: Metals.or },
    ]);
    expect(parser.parse("D'azur à la billette d'or").chargesOrOrdinaries).toEqual([
      { type: ChargeType.billet, tincture: Metals.or },
    ]);
  });

  test('leaves the key off entirely when the field bears nothing at all', () => {
    expect(parser.parse("D'azur")).not.toHaveProperty('chargesOrOrdinaries');
  });

  describe('the article agreeing with the charge it introduces', () => {
    test.each([
      [ChargeType.annulet, "à l'annelet"],
      [ChargeType.billet, 'à la billette'],
      [ChargeType.lozenge, 'à la losange'],
    ])('bears %s as "%s"', (type, expected) => {
      expect(bearing(wordOf(FrenchChargeType, type))).toBe(expected);
    });

    test('names every charge with an article the parser then accepts', () => {
      for (const type of CHARGES) {
        const borne = bearing(wordOf(FrenchChargeType, type));
        expect(parser.parse(`D'azur ${borne} d'or`).chargesOrOrdinaries).toEqual([
          { type, tincture: Metals.or },
        ]);
      }
    });

    test('refuses the feminine billette taking "au"', () => {
      expect(() => parser.parse("D'azur au billette d'or")).toThrow(WrongOrdinaryArticle);
      expect(() => parser.parse("D'azur au billette d'or")).toThrow(/expected "à la billette"/);
    });

    test('reads the losange under either gender, the armorials being written both ways', () => {
      expect(parser.parse("D'azur au losange d'or")).toEqual(
        parser.parse("D'azur à la losange d'or")
      );
    });

    test('writes the losange back out feminine, whichever gender it was read under', () => {
      expect(bearing(wordOf(FrenchChargeType, ChargeType.lozenge))).toBe('à la losange');
      expect(everyBearing(wordOf(FrenchChargeType, ChargeType.lozenge))).toEqual([
        'à la losange',
        'au losange',
      ]);
    });

    test('holds every other charge to the one gender it declares', () => {
      expect(everyBearing(wordOf(FrenchChargeType, ChargeType.billet))).toEqual(['à la billette']);
      expect(() => parser.parse("D'azur au billette d'or")).toThrow(WrongOrdinaryArticle);
    });

    test('refuses the elided annelet taking either unelided article', () => {
      expect(() => parser.parse("D'azur au annelet d'or")).toThrow(WrongOrdinaryArticle);
      expect(() => parser.parse("D'azur à la annelet d'or")).toThrow(WrongOrdinaryArticle);
      expect(() => parser.parse("D'azur au annelet d'or")).toThrow(/expected "à l'annelet"/);
    });

    test('refuses an elided article before a word that does not elide', () => {
      expect(() => parser.parse("D'azur à l'losange d'or")).toThrow(WrongOrdinaryArticle);
    });

    test('reads the typographic apostrophe as readily as the typed one', () => {
      expect(parser.parse("D'azur à l’annelet d'or")).toEqual(
        parser.parse("D'azur à l'annelet d'or")
      );
    });
  });

  test('still owes the charge a tincture of its own', () => {
    expect(() => parser.parse("D'azur à la billette")).toThrow(MissingTincture);
  });
});

describe('a field bearing several of one charge', () => {
  test('reads "D\'argent à trois billettes d\'or" as three billets', () => {
    expect(parser.parse("D'argent à trois billettes d'or")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: ChargeType.billet, tincture: Metals.or, count: 3 }],
    });
  });

  test.each([
    ['deux annelets', ChargeType.annulet, 2],
    ['trois billettes', ChargeType.billet, 3],
    ['six losanges', ChargeType.lozenge, 6],
    ['seize annelets', ChargeType.annulet, 16],
  ])('reads "%s" as that many of that charge', (borne, type, count) => {
    expect(parser.parse(`D'azur à ${borne} d'or`).chargesOrOrdinaries).toEqual([
      { type, tincture: Metals.or, count },
    ]);
  });

  test('bears every charge in number, none of them being a place on the shield', () => {
    for (const type of CHARGES) {
      const word = wordOf(FrenchChargeType, type);
      expect(parser.parse(`D'azur à trois ${word.plural} d'or`).chargesOrOrdinaries).toEqual([
        { type, tincture: Metals.or, count: 3 },
      ]);
    }
  });

  test('reads the count in figures as readily as in words', () => {
    expect(parser.parse("D'argent à 3 billettes d'or")).toEqual(
      parser.parse("D'argent à trois billettes d'or")
    );
  });

  test('leaves the count off when a single charge is borne', () => {
    expect(parser.parse("D'azur au losange d'or").chargesOrOrdinaries?.[0]).not.toHaveProperty(
      'count'
    );
  });

  test('refuses a count of one, a single charge being named on its own', () => {
    expect(() => parser.parse("D'azur à 1 losanges d'or")).toThrow(/not more than one/);
  });

  test('refuses the singular name after a count', () => {
    expect(() => parser.parse("D'azur à trois losange d'or")).toThrow(UnknownOrdinary);
  });
});

describe('the roundel, which French has two names for', () => {
  test('reads the besant as the metal disc, gold unless the blazon says otherwise', () => {
    expect(parser.parse('De gueules au besant')).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture: Metals.or }],
    });
  });

  test('reads it the same where the blazon writes the gold out in full', () => {
    expect(parser.parse("De gueules au besant d'or")).toEqual(parser.parse('De gueules au besant'));
  });

  test('refuses a besant in a colour, a besant being a gold coin', () => {
    expect(() => parser.parse("De gueules au besant d'azur")).toThrow(InvalidTincture);
    expect(() => parser.parse("De gueules au besant d'azur")).toThrow(/besant is never d'azur/);
  });

  test.each(COLOURS)('refuses the besant every colour there is: %s', (colour) => {
    const written = withArticle(wordOf(FrenchTinctures, colour));
    expect(() => parser.parse(`D'argent au besant ${written}`)).toThrow(InvalidTincture);
  });

  test('takes the other metal, which is a besant and not a plate in French', () => {
    expect(parser.parse("De gueules au besant d'argent").chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.argent },
    ]);
  });

  test('reads the tourteau as the coloured disc, which must always say which colour', () => {
    expect(parser.parse("D'or au tourteau de gueules").chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Colours.gules },
    ]);
    expect(() => parser.parse("D'or au tourteau")).toThrow(MissingTincture);
  });

  test.each(METALS)('refuses the tourteau every metal there is: %s', (metal) => {
    const written = withArticle(wordOf(FrenchTinctures, metal));
    expect(() => parser.parse(`De gueules au tourteau ${written}`)).toThrow(InvalidTincture);
  });

  test('reads the one term under either name, the disc being one charge', () => {
    const besant = parser.parse("D'azur au besant d'or").chargesOrOrdinaries?.[0];
    const tourteau = parser.parse("D'or au tourteau de gueules").chargesOrOrdinaries?.[0];
    expect(besant?.type).toBe(ChargeType.roundel);
    expect(tourteau?.type).toBe(ChargeType.roundel);
  });

  test.each(Object.values(Furs))('cuts either name from a fur: %s', (fur) => {
    const written = withArticle(wordOf(FrenchTinctures, fur));
    expect(parser.parse(`D'azur au besant ${written}`).chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: fur },
    ]);
    expect(parser.parse(`D'azur au tourteau ${written}`).chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: fur },
    ]);
  });

  test('bears them in number, the plural of tourteau being tourteaux', () => {
    expect(parser.parse("D'azur à trois besants").chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.or, count: 3 },
    ]);
    expect(parser.parse("D'or à trois tourteaux de gueules").chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Colours.gules, count: 3 },
    ]);
  });

  test('refuses several besants in a colour as readily as one', () => {
    expect(() => parser.parse("D'argent à trois besants de gueules")).toThrow(InvalidTincture);
  });

  test('lays a besant beside a band, the tincture it never wrote ending nothing', () => {
    expect(parser.parse("D'or au besant, à la fasce de gueules").chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.or },
      { type: OrdinaryType.fess, tincture: Colours.gules },
    ]);
    expect(parser.parse("D'or au besant à la fasce de gueules")).toEqual(
      parser.parse("D'or au besant, à la fasce de gueules")
    );
  });

  test('still reports a word that named no tincture at all after a besant', () => {
    expect(() => parser.parse("D'or au besant de trucmuche")).toThrow(UnknownTincture);
    expect(() => parser.parse("D'or au besant de trucmuche")).toThrow(/trucmuche/);
  });

  test('holds the besant to the article its gender calls for', () => {
    expect(bearing(wordOf(FrenchChargeType, ChargeType.roundel))).toBe('au besant');
    expect(() => parser.parse("D'azur à la besant")).toThrow(WrongOrdinaryArticle);
  });
});

describe('a field bearing bands and charges together', () => {
  test('reads both into one list, in the order the blazon laid them', () => {
    expect(parser.parse("D'or à la fasce de gueules, à trois billettes d'azur")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.gules },
        { type: ChargeType.billet, tincture: Colours.azure, count: 3 },
      ],
    });
  });

  test('keeps that order, which says which covers which', () => {
    const over = parser.parse("D'or à la billette d'azur ; à la bande de gueules");
    const under = parser.parse("D'or à la bande de gueules ; à la billette d'azur");
    expect(over.chargesOrOrdinaries?.map(({ type }) => type)).toEqual([
      ChargeType.billet,
      OrdinaryType.bend,
    ]);
    expect(under.chargesOrOrdinaries?.map(({ type }) => type)).toEqual([
      OrdinaryType.bend,
      ChargeType.billet,
    ]);
  });

  test('reads several kinds of charge at once', () => {
    expect(
      parser.parse("D'or à la billette d'azur, au losange de gueules").chargesOrOrdinaries
    ).toEqual([
      { type: ChargeType.billet, tincture: Colours.azure },
      { type: ChargeType.lozenge, tincture: Colours.gules },
    ]);
  });

  test('reads them with no mark between, the article saying it alone', () => {
    expect(parser.parse("D'or à la fasce de gueules à la billette d'azur")).toEqual(
      parser.parse("D'or à la fasce de gueules, à la billette d'azur")
    );
  });
});
