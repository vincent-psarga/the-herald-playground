import { describe, expect, test } from 'vitest';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { MissingTincture } from '../../domain/errors/parsing/MissingTincture';
import { RepeatedOrdinary } from '../../domain/errors/parsing/RepeatedOrdinary';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { Colours, Metals, TINCTURES } from '../../domain/models/Tinctures';
import { wordOf } from '../../domain/translations/Translation';
import { FrenchOrdinaryType } from '../../domain/translations/fr/Ordinaries';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { bearing } from './FrenchGrammar';
import { withArticle } from '../Articles';
import { FieldType } from '../../domain/models/Field';

const parser = new FrenchBlazonParser();

describe('a field bearing an ordinary', () => {
  test('reads "D\'azur à la fasce d\'or" as a fess on an azure field', () => {
    expect(parser.parse("D'azur à la fasce d'or")).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
    });
  });

  test.each([
    ['au chef', OrdinaryType.chief],
    ['au pal', OrdinaryType.pale],
    ['à la fasce', OrdinaryType.fess],
    ['à la jumelle', OrdinaryType.barGemel],
    ['à la bande', OrdinaryType.bend],
    ['à la barre', OrdinaryType.bendSinister],
    ['au chevron', OrdinaryType.chevron],
    ['à la croix', OrdinaryType.cross],
    ['au sautoir', OrdinaryType.saltire],
  ])('reads "%s" as that ordinary', (borne, type) => {
    expect(parser.parse(`De gueules ${borne} d'argent`)).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type, tincture: Metals.argent }],
    });
  });

  test.each(TINCTURES)('gives the ordinary a tincture of its own: %s', (tincture) => {
    const blazon = parser.parse(
      `D'azur au chevron ${withArticle(wordOf(FrenchTinctures, tincture))}`
    );
    expect(blazon.chargesOrOrdinaries).toEqual([{ type: OrdinaryType.chevron, tincture }]);
  });

  test('lays an ordinary on a divided field as readily as on a plain one', () => {
    expect(parser.parse("Parti d'azur et d'or au sautoir de gueules").chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.saltire,
        tincture: Colours.gules,
      },
    ]);
  });

  test('accepts the same tincture on the field and on what it bears', () => {
    expect(parser.parse("D'or à la fasce d'or").chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.fess,
        tincture: Metals.or,
      },
    ]);
  });

  test('is case insensitive', () => {
    expect(parser.parse("D'AZUR AU CHEVRON D'OR")).toEqual(parser.parse("d'azur au chevron d'or"));
  });

  test('closes with the optional full stop', () => {
    expect(parser.parse("D'azur au chevron d'or.")).toEqual(parser.parse("D'azur au chevron d'or"));
  });

  test('leaves the key off entirely when the field bears nothing', () => {
    expect(parser.parse("D'azur")).not.toHaveProperty('chargesOrOrdinaries');
  });

  describe('the article agreeing with the ordinary it introduces', () => {
    test.each([
      [OrdinaryType.chief, 'au chef'],
      [OrdinaryType.pale, 'au pal'],
      [OrdinaryType.fess, 'à la fasce'],
      [OrdinaryType.barGemel, 'à la jumelle'],
      [OrdinaryType.bend, 'à la bande'],
      [OrdinaryType.bendSinister, 'à la barre'],
      [OrdinaryType.chevron, 'au chevron'],
      [OrdinaryType.cross, 'à la croix'],
      [OrdinaryType.saltire, 'au sautoir'],
    ])('bears %s as "%s"', (type, expected) => {
      expect(bearing(wordOf(FrenchOrdinaryType, type))).toBe(expected);
    });

    test('names every ordinary with an article the parser then accepts', () => {
      for (const type of Object.values(OrdinaryType)) {
        const borne = bearing(wordOf(FrenchOrdinaryType, type));
        expect(parser.parse(`D'azur ${borne} d'or`).chargesOrOrdinaries).toEqual([
          {
            type,
            tincture: Metals.or,
          },
        ]);
      }
    });
  });

  describe('rejections', () => {
    test.each(['fasce', 'bande', 'barre', 'croix'])(
      'rejects the feminine %s taking "au"',
      (word) => {
        expect(() => parser.parse(`D'azur au ${word} d'or`)).toThrow(UnknownOrdinary);
        expect(() => parser.parse(`D'azur au ${word} d'or`)).toThrow(
          new RegExp(`expected "à la ${word}"`)
        );
      }
    );

    test.each(['chef', 'pal', 'chevron', 'sautoir'])(
      'rejects the masculine %s taking "à la"',
      (word) => {
        expect(() => parser.parse(`D'azur à la ${word} d'or`)).toThrow(
          new RegExp(`expected "au ${word}"`)
        );
      }
    );

    test('rejects an ordinary the vocabulary does not know', () => {
      expect(() => parser.parse("D'azur à la champagne d'or")).toThrow(UnknownOrdinary);
      expect(() => parser.parse("D'azur à la champagne d'or")).toThrow(
        /Unknown ordinary: champagne/
      );
    });

    test('tells the bande apart from the tranché it runs along', () => {
      expect(parser.parse("D'azur à la bande d'or").chargesOrOrdinaries).toMatchObject([
        {
          type: OrdinaryType.bend,
        },
      ]);
      expect(parser.parse("Tranché d'azur et d'or")).not.toHaveProperty('chargesOrOrdinaries');
    });

    test('tells the barre apart from the taillé it runs along', () => {
      expect(parser.parse("D'azur à la barre d'or").chargesOrOrdinaries).toMatchObject([
        {
          type: OrdinaryType.bendSinister,
        },
      ]);
      expect(parser.parse("Taillé d'azur et d'or")).not.toHaveProperty('chargesOrOrdinaries');
    });

    test('rejects an ordinary named without its article', () => {
      expect(() => parser.parse("D'azur fasce d'or")).toThrow();
    });

    test('rejects an ordinary with no tincture of its own, as a missing tincture', () => {
      expect(() => parser.parse("D'azur à la fasce")).toThrow(MissingTincture);
    });

    test("carries the elision rule into the ordinary's tincture", () => {
      expect(() => parser.parse("D'azur à la fasce de or")).toThrow(UnknownTincture);
      expect(() => parser.parse("D'azur à la fasce de or")).toThrow(/expected "d'or"/);
    });
  });
});

describe('the bar gemel', () => {
  test('reads "D\'argent à la jumelle de gueules" as one gemel, borne singly', () => {
    // A gemel is a pair of bars, but it is one charge, and French names it in
    // the singular for all that the word means "twin".
    expect(parser.parse("D'argent à la jumelle de gueules")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.barGemel, tincture: Colours.gules }],
    });
  });

  test('reads the three jumelles an armorial writes', () => {
    expect(parser.parse("D'argent à trois jumelles de gueules.").chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.barGemel,
        tincture: Colours.gules,
        count: 3,
      },
    ]);
  });

  test('takes the feminine article, and refuses the masculine one', () => {
    expect(() => parser.parse("D'argent au jumelle de gueules")).toThrow(/expected "à la jumelle"/);
  });
});

describe('a field bearing several of one ordinary', () => {
  test('reads "De gueules à trois chevrons d\'or" as three chevrons on a gules field', () => {
    expect(parser.parse("De gueules à trois chevrons d'or")).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Metals.or, count: 3 }],
    });
  });

  test.each([
    ['à deux pals', OrdinaryType.pale, 2],
    ['à trois fasces', OrdinaryType.fess, 3],
    ['à trois jumelles', OrdinaryType.barGemel, 3],
    ['à quatre bandes', OrdinaryType.bend, 4],
    ['à six barres', OrdinaryType.bendSinister, 6],
    ['à seize chevrons', OrdinaryType.chevron, 16],
  ])('reads "%s" as that many of that ordinary', (borne, type, count) => {
    expect(parser.parse(`D'azur ${borne} d'or`).chargesOrOrdinaries).toEqual([
      {
        type,
        tincture: Metals.or,
        count,
      },
    ]);
  });

  test('reads the contracted article, which armorials also write', () => {
    // Blazonry says "à trois bandes de gueules", but "aux trois aiglettes
    // d'argent" stands in an armorial too, and says the same thing.
    expect(parser.parse("D'argent aux trois bandes de gueules")).toEqual(
      parser.parse("D'argent à trois bandes de gueules")
    );
  });

  test('reads the count in figures as readily as in words', () => {
    expect(parser.parse("D'argent à 3 bandes de gueules")).toEqual(
      parser.parse("D'argent à trois bandes de gueules")
    );
  });

  test('leaves the count off entirely when one is borne', () => {
    expect(parser.parse("D'azur au chevron d'or").chargesOrOrdinaries?.[0]).not.toHaveProperty(
      'count'
    );
  });

  test('is case insensitive', () => {
    expect(parser.parse("D'OR À TROIS CHEVRONS DE GUEULES")).toEqual(
      parser.parse("d'or à trois chevrons de gueules")
    );
  });

  test('closes with the optional full stop', () => {
    expect(parser.parse("D'or à trois chevrons de gueules.")).toEqual(
      parser.parse("D'or à trois chevrons de gueules")
    );
  });

  test('lays several on a divided field as readily as on a plain one', () => {
    expect(
      parser.parse("Parti d'azur et d'or à deux fasces de gueules").chargesOrOrdinaries
    ).toEqual([
      {
        type: OrdinaryType.fess,
        tincture: Colours.gules,
        count: 2,
      },
    ]);
  });

  test('gives every band of them the one tincture', () => {
    expect(parser.parse("D'azur à trois fasces d'or").chargesOrOrdinaries?.[0].tincture).toBe(
      Metals.or
    );
  });

  describe('rejections', () => {
    test.each(['chefs', 'croix', 'sautoirs'])('refuses several %s, borne but once', (word) => {
      expect(() => parser.parse(`D'or à deux ${word} de gueules`)).toThrow(RepeatedOrdinary);
    });

    test('says which ordinary was repeated, and how many were asked for', () => {
      const refusal = refused(() => parser.parse("D'or à deux chefs de gueules"));
      expect(refusal).toBeInstanceOf(RepeatedOrdinary);
      expect((refusal as RepeatedOrdinary).ordinary).toBe('chefs');
      expect((refusal as RepeatedOrdinary).count).toBe(2);
    });

    test('refuses a count of one, a single band being named on its own', () => {
      expect(() => parser.parse("D'or à 1 chevrons de gueules")).toThrow(/not more than one/);
      expect(() => parser.parse("D'or à une fasce de gueules")).toThrow();
    });

    test('refuses the singular name after a count', () => {
      expect(() => parser.parse("D'or à deux chevron de gueules")).toThrow(UnknownOrdinary);
    });

    test('refuses several named with no preposition at all', () => {
      expect(() => parser.parse("D'or trois chevrons de gueules")).toThrow();
    });

    test('refuses a plural the vocabulary does not know', () => {
      expect(() => parser.parse("D'or à deux champagnes de gueules")).toThrow(UnknownOrdinary);
    });

    test('still owes them a tincture of their own', () => {
      expect(() => parser.parse("D'or à deux chevrons")).toThrow(MissingTincture);
    });

    test('refuses a word that is no number at all', () => {
      expect(() => parser.parse("D'or à maintes fasces de gueules")).toThrow();
    });

    test('refuses a number the vocabulary stops short of', () => {
      // "dix-sept" is hyphenated, and the lexer reads words rather than
      // punctuation, so the number never reaches the grammar.
      expect(() => parser.parse("D'or à dix-sept fasces de gueules")).toThrow();
    });
  });
});

describe('the bordure', () => {
  test('reads "D\'argent à la bordure de gueules" as a bordure on an argent field', () => {
    expect(parser.parse("D'argent à la bordure de gueules.")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
    });
  });

  test('takes the feminine article, and refuses the masculine one', () => {
    expect(() => parser.parse("D'argent au bordure de gueules")).toThrow(/expected "à la bordure"/);
  });

  test('is borne but once, a shield having one edge', () => {
    expect(() => parser.parse("D'or à deux bordures de gueules")).toThrow(RepeatedOrdinary);
  });
});

describe('a field bearing more than one ordinary', () => {
  test('reads the bends and the bordure an armorial writes', () => {
    expect(parser.parse("D'or à trois bandes de sable ; à la bordure de gueules")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.bend, tincture: Colours.sable, count: 3 },
        { type: OrdinaryType.bordure, tincture: Colours.gules },
      ],
    });
  });

  test('keeps them in the order the blazon laid them, which says which covers which', () => {
    const over = parser.parse("D'or à trois bandes de sable ; à la bordure de gueules");
    const under = parser.parse("D'or à la bordure de gueules ; à trois bandes de sable");
    expect(over.chargesOrOrdinaries?.map(({ type }) => type)).toEqual([
      OrdinaryType.bend,
      OrdinaryType.bordure,
    ]);
    expect(under.chargesOrOrdinaries?.map(({ type }) => type)).toEqual([
      OrdinaryType.bordure,
      OrdinaryType.bend,
    ]);
  });

  test.each([
    ['a semicolon, as an armorial writes it', "D'azur à la fasce d'or ; au chef de gueules"],
    ['a comma', "D'azur à la fasce d'or, au chef de gueules"],
    ['no mark at all, the article saying it alone', "D'azur à la fasce d'or au chef de gueules"],
  ])('reads them separated by %s', (_how, blazon) => {
    expect(parser.parse(blazon).chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.fess, tincture: Metals.or },
      { type: OrdinaryType.chief, tincture: Colours.gules },
    ]);
  });

  test('reads a mark set between the field and the first of them', () => {
    // An armorial writes "De gueules, à deux haches d'armes" as readily as not.
    expect(parser.parse("De gueules, au chevron d'or")).toEqual(
      parser.parse("De gueules au chevron d'or")
    );
  });

  test('closes on the mark a blazon copied out of an armorial ends with', () => {
    expect(parser.parse("D'or à trois bandes de sable ; à la bordure de gueules,")).toEqual(
      parser.parse("D'or à trois bandes de sable ; à la bordure de gueules")
    );
  });

  test('bears as many as the blazon names', () => {
    expect(
      parser.parse("D'argent à la fasce d'or, au chef de gueules, à la bordure de sable")
        .chargesOrOrdinaries
    ).toHaveLength(3);
  });

  test('gives each one a tincture and a count of its own', () => {
    expect(parser.parse("D'argent à trois chevrons d'or ; à la bordure de gueules")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [
        { type: OrdinaryType.chevron, tincture: Metals.or, count: 3 },
        { type: OrdinaryType.bordure, tincture: Colours.gules },
      ],
    });
  });

  test('lays them on a divided field as readily as on a plain one', () => {
    expect(
      parser.parse("Parti d'azur et d'or au sautoir de gueules ; à la bordure de sable")
        .chargesOrOrdinaries
    ).toEqual([
      { type: OrdinaryType.saltire, tincture: Colours.gules },
      { type: OrdinaryType.bordure, tincture: Colours.sable },
    ]);
  });

  test('bears the same ordinary twice, which is not the same as two of it', () => {
    // Two fesses of one tincture narrow to make room for each other; a fess and
    // another fess are two charges, each drawn where a single one is drawn.
    expect(
      parser.parse("D'or à la fasce d'argent, à la fasce de gueules").chargesOrOrdinaries
    ).toEqual([
      { type: OrdinaryType.fess, tincture: Metals.argent },
      { type: OrdinaryType.fess, tincture: Colours.gules },
    ]);
  });

  describe('rejections', () => {
    test('still owes every one of them a tincture', () => {
      expect(() => parser.parse("D'azur à la fasce d'or ; au chevron")).toThrow(MissingTincture);
    });

    test('names the phrase the tincture is missing from, not the blazon at large', () => {
      const refusal = refused(() =>
        parser.parse("D'azur à la fasce d'or ; au chevron")
      ) as MissingTincture;
      expect(refusal.context).toBe('au chevron');
    });

    test('refuses a second ordinary the vocabulary does not know', () => {
      expect(() => parser.parse("D'azur à la fasce d'or, à la champagne de gueules")).toThrow(
        UnknownOrdinary
      );
    });

    test('refuses a mark with nothing but another mark after it', () => {
      expect(() => parser.parse("D'azur à la fasce d'or,,")).toThrow();
    });
  });
});

/** What a blazon threw, for a test that wants to look at it rather than match it. */
function refused(parse: () => unknown): unknown {
  try {
    parse();
  } catch (thrown) {
    return thrown;
  }
  throw new Error('That blazon was read, when it should have been refused.');
}
