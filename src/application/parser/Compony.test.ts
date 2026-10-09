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
    expect(() => inFrench.parse("D'or à la fasce componée de gueules et d'argent")).toThrow(
      WrongModifier
    );
    expect(() => inEnglish.parse('Or a fess compony gules and argent')).toThrow(WrongModifier);
    expect(refused(() => inEnglish.parse('Or a chief compony gules and argent')).message).toBe(
      'Wrong modifier: chief is never compony'
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
  test('are the bend and the bordure, each with the number it is understood to have', () => {
    const compony = Object.values(OrdinaryType).filter(
      (type) => OrdinaryDefinitions[type].compons !== undefined
    );
    expect(compony).toEqual([OrdinaryType.bend, OrdinaryType.bordure]);
    // Parker: "A bordure compony should consist of sixteen pieces".
    expect(OrdinaryDefinitions[OrdinaryType.bordure].compons).toBe(16);
  });

  test('are every band the drawing can cut into compons, and no other', () => {
    for (const type of Object.values(OrdinaryType)) {
      expect(ORDINARIES[type].compons !== undefined, type).toBe(
        OrdinaryDefinitions[type].compons !== undefined
      );
    }
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
