import { describe, expect, test } from 'vitest';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { WrongAgreement } from '../../domain/errors/parsing/WrongAgreement';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { ChargeType } from '../../domain/models/Charge';
import { FieldType } from '../../domain/models/Field';
import { OrdinaryDefinitions, OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Furs, Metals } from '../../domain/models/Tinctures';
import { HatchingColours } from '../../infra/colours/HatchingColours';
import { WikipediaColours } from '../../infra/colours/WikipediaColours';
import { SvgBlazonDrawer } from '../drawer/svg/SvgBlazonDrawer';
import { SHIELD_FRAME } from '../drawer/svg/shapes/shield';
import { ORDINARIES } from '../drawer/svg/vocabulary/ordinaries';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';

/** The refusal a blazon raised, for a test that wants more of it than its kind. */
function refused(reading: () => unknown) {
  try {
    reading();
  } catch (thrown) {
    return thrown as BlazonParseError;
  }
  throw new Error('That blazon was not refused');
}

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

// The modern arms of Burgundy, as the sample armorial transcribes them.
const BOURGOGNE =
  "D'azur semé de fleurs de lys d'or ; à la bordure componée de gueules et d'argent.";

describe('a band cut into compons', () => {
  test('is read where a tincture would be read, and holds the two it names in order', () => {
    expect(inFrench.parse("D'or à la bande componée d'azur et de sable")).toEqual({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.bend, tincture: { compony: [Colours.azure, Colours.sable] } },
      ],
    });
  });

  test('stands beside what the field was sown with, in the order the blazon laid them', () => {
    expect(inFrench.parse(BOURGOGNE)).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Colours.azure,
        semy: { type: ChargeType.fleurDeLis, tincture: Metals.or },
      },
      chargesOrOrdinaries: [
        { type: OrdinaryType.bordure, tincture: { compony: [Colours.gules, Metals.argent] } },
      ],
    });
  });

  test('is the one term under both tongues', () => {
    expect(inFrench.parse("D'or à la bordure componée de gueules et d'argent")).toEqual(
      inEnglish.parse('Or a bordure compony gules and argent')
    );
  });

  test('is written back in the tongue it is asked for, whichever it was read in', () => {
    const french = inFrench.parse(BOURGOGNE);
    expect(writeFrench.write(french)).toBe(
      "D'azur semé de fleurs de lys d'or à la bordure componée de gueules et d'argent."
    );
    expect(writeEnglish.write(french)).toBe(
      'Azure semy-de-lis or a bordure compony gules and argent.'
    );

    const english = inEnglish.parse('Argent a bend compony azure and ermine');
    expect(writeFrench.write(english)).toBe("D'argent à la bande componée d'azur et d'hermine.");
    expect(writeEnglish.write(english)).toBe('Argent a bend compony azure and ermine.');
  });

  test('is read under every spelling French writes it with, and written back under one', () => {
    for (const blazon of [
      "D'or à la bande componée d'azur et de sable",
      "D'or à la bande componnée d'azur et de sable",
      "D'or à la bande Componée d'azur et de sable.",
    ]) {
      expect(writeFrench.write(inFrench.parse(blazon))).toBe(
        "D'or à la bande componée d'azur et de sable."
      );
    }
  });

  test('is read under every spelling English writes it with, and written back under one', () => {
    for (const blazon of [
      'Or a bend compony azure and sable',
      'Or a bend gobony azure and sable',
      'Or a bend componée azure and sable',
    ]) {
      expect(writeEnglish.write(inEnglish.parse(blazon))).toBe(
        'Or a bend compony azure and sable.'
      );
    }
  });

  test('is borne in number, agreeing with the count in French and unchanged in English', () => {
    const french = inFrench.parse("D'argent à deux bandes componées de gueules et d'or");
    expect(french.chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: { compony: [Colours.gules, Metals.or] }, count: 2 },
    ]);
    expect(writeFrench.write(french)).toBe("D'argent à deux bandes componées de gueules et d'or.");
    expect(writeEnglish.write(french)).toBe('Argent two bends compony gules and or.');
    expect(inEnglish.parse('Argent two bends compony gules and or')).toEqual(french);
  });

  test('stands beside bands that name a tincture, in the order the blazon laid them', () => {
    const blazon = "D'or à la bande de sable, à la bordure componée d'azur et d'argent";
    expect(inFrench.parse(blazon).chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Colours.sable },
      { type: OrdinaryType.bordure, tincture: { compony: [Colours.azure, Metals.argent] } },
    ]);
  });
});

describe('what compony refuses', () => {
  test('a writing that does not agree with the band, by name', () => {
    const refusal = refused(() =>
      inFrench.parse("D'or à la bordure componé de gueules et d'argent")
    );
    expect(refusal).toBeInstanceOf(WrongAgreement);
    expect((refusal as WrongAgreement).expected).toBe('componée');
    expect(() => inFrench.parse("D'or à deux bandes componée de gueules et d'argent")).toThrow(
      WrongAgreement
    );
  });

  test('a band never cut so, by name rather than as a tincture gone wrong', () => {
    expect(() => inFrench.parse("D'or à la jumelle componée de gueules et d'argent")).toThrow(
      WrongModifier
    );
    expect(refused(() => inEnglish.parse('Or a bar gemel compony gules and argent')).message).toBe(
      'Wrong modifier: bar gemel is never compony'
    );
  });

  test('a charge, which no source cuts into compons', () => {
    expect(() => inFrench.parse("D'or à la billette componée de gueules et d'argent")).toThrow(
      WrongModifier
    );
    expect(() => inEnglish.parse('Or a besant compony gules and argent')).toThrow(WrongModifier);
  });

  test('a band that names one tincture where it owes two', () => {
    expect(() => inFrench.parse("D'or à la bordure componée de gueules")).toThrow(BlazonParseError);
    expect(() => inEnglish.parse('Or a bordure compony gules')).toThrow(BlazonParseError);
  });

  test('nothing about the complaint a mistyped tincture makes', () => {
    expect(refused(() => inFrench.parse("D'or à la bordure de gueulles")).message).toContain(
      'gueulles'
    );
  });
});

describe('the bands that may be compony', () => {
  test('are every band but the gemel, each with the number it is understood to have', () => {
    const compons = Object.fromEntries(
      Object.values(OrdinaryType).map((type) => [type, OrdinaryDefinitions[type].compons])
    );
    expect(compons).toEqual({
      [OrdinaryType.chief]: 6,
      [OrdinaryType.pale]: 6,
      [OrdinaryType.fess]: 6,
      [OrdinaryType.barGemel]: undefined,
      [OrdinaryType.bend]: 6,
      [OrdinaryType.bendSinister]: 6,
      [OrdinaryType.chevron]: 7,
      // Rivière de La Mure's: "de quatre pièces d'azur et de cinq pièces d'or".
      [OrdinaryType.cross]: 9,
      [OrdinaryType.saltire]: 9,
      // Parker: "A bordure compony should consist of sixteen pieces".
      [OrdinaryType.bordure]: 16,
    });
  });

  test('are every band the drawing can cut into compons, and no other', () => {
    for (const type of Object.values(OrdinaryType)) {
      expect(ORDINARIES[type].compons !== undefined, type).toBe(
        OrdinaryDefinitions[type].compons !== undefined
      );
    }
  });

  test('agree with a masculine band as readily as a feminine one', () => {
    expect(writeFrench.write(inFrench.parse("D'argent au pal componé de gueules et d'or"))).toBe(
      "D'argent au pal componé de gueules et d'or."
    );
    expect(
      refused(() => inFrench.parse("D'argent au pal componée de gueules et d'or"))
    ).toBeInstanceOf(WrongAgreement);
    expect(writeFrench.write(inEnglish.parse('Argent three pales compony gules and or'))).toBe(
      "D'argent à trois pals componés de gueules et d'or."
    );
  });

  test.each([
    ["D'argent au chef componé d'azur et d'or", 'Argent a chief compony azure and or.'],
    ["D'argent à la fasce componée de gueules et d'or", 'Argent a fess compony gules and or.'],
    [
      "D'argent à la barre componée de gueules et d'or",
      'Argent a bend sinister compony gules and or.',
    ],
    ["D'argent au chevron componé de gueules et d'or", 'Argent a chevron compony gules and or.'],
    ["De gueules à la croix componée d'azur et d'or", 'Gules a cross compony azure and or.'],
    ["D'argent au sautoir componé de gueules et d'or", 'Argent a saltire compony gules and or.'],
  ])('reads %s, and says it in English', (french, english) => {
    expect(writeEnglish.write(inFrench.parse(french))).toBe(english);
    expect(writeFrench.write(inEnglish.parse(english))).toBe(`${french}.`);
  });
});

describe('a band cut into compons, drawn', () => {
  const coloured = new SvgBlazonDrawer(WikipediaColours);
  const hatched = new SvgBlazonDrawer(HatchingColours);

  test('lays every other compon of the second tincture over the first', () => {
    // The first compon and every other one after it are the first tincture
    // painted entire, so only half the compons are shapes of their own.
    expect(ORDINARIES[OrdinaryType.bordure].compons?.(SHIELD_FRAME, 1, 16)).toHaveLength(8);
    expect(ORDINARIES[OrdinaryType.bend].compons?.(SHIELD_FRAME, 1, 6)).toHaveLength(3);
    expect(ORDINARIES[OrdinaryType.bend].compons?.(SHIELD_FRAME, 2, 6)).toHaveLength(6);
  });

  test('cuts a figure whose limbs meet with one compon where they meet', () => {
    // The middle is the first tincture, left beneath; each arm of nine starts
    // with the second and ends with the first, so one compon apiece is laid.
    expect(ORDINARIES[OrdinaryType.cross].compons?.(SHIELD_FRAME, 1, 9)).toHaveLength(4);
    expect(ORDINARIES[OrdinaryType.saltire].compons?.(SHIELD_FRAME, 1, 9)).toHaveLength(4);
    // The point, and three down each limb: the second and fourth from the point
    // are laid.
    expect(ORDINARIES[OrdinaryType.chevron].compons?.(SHIELD_FRAME, 1, 7)).toHaveLength(4);
  });

  test('is painted in both its tinctures, cut to the band', () => {
    const svg = coloured.draw(inFrench.parse("D'or à la bordure componée d'azur et de sable"));
    expect(svg).toContain(WikipediaColours[Colours.azure] as string);
    expect(svg).toContain(WikipediaColours[Colours.sable] as string);
    expect(svg).toMatch(/<g mask="url\(#[^"]+\)">/);
  });

  test('asks for both its tinctures among the ones the drawing defines', () => {
    // Or for the field, and the bordure's azure and sable besides: three
    // patterns, where the field alone would ask for one.
    const svg = hatched.draw(inFrench.parse("D'or à la bordure componée d'azur et de sable"));
    expect(svg.match(/<pattern /g)).toHaveLength(3);
  });

  test('carries a line between its compons where the colouring rules its tinctures', () => {
    const svg = hatched.draw(inFrench.parse(BOURGOGNE));
    expect(svg).toContain(HatchingColours.ink as string);
  });

  test('may be cut from a fur', () => {
    const svg = coloured.draw(inEnglish.parse('Argent a bend compony azure and ermine'));
    expect(svg).toContain(WikipediaColours[Colours.azure] as string);
    expect(inEnglish.parse('Argent a bend compony azure and ermine').chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: { compony: [Colours.azure, Furs.ermine] } },
    ]);
  });
});

describe('the shield, as far as a band can be seen on it', () => {
  test('encloses its middle and its point, and none of the corners its base curves away from', () => {
    expect(SHIELD_FRAME.encloses(100, 120)).toBe(true);
    expect(SHIELD_FRAME.encloses(100, 233)).toBe(true);
    expect(SHIELD_FRAME.encloses(7, 7)).toBe(true);
    expect(SHIELD_FRAME.encloses(193, 230)).toBe(false);
    expect(SHIELD_FRAME.encloses(7, 230)).toBe(false);
    expect(SHIELD_FRAME.encloses(100, 236)).toBe(false);
  });
});
