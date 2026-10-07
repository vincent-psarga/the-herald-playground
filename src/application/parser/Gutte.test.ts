import { describe, expect, test } from 'vitest';
import { Blazon } from '../../domain/models/Blazon';
import { ChargeType } from '../../domain/models/Charge';
import { FieldType } from '../../domain/models/Field';
import { Colours, Furs, Metals, TINCTURES, Tincture } from '../../domain/models/Tinctures';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { WrongTinctureArticle } from '../../domain/errors/parsing/WrongTinctureArticle';
import { EnglishLiquids } from '../../domain/translations/en/Liquids';
import { FrenchLiquids } from '../../domain/translations/fr/Liquids';
import { Liquids, pouredIn } from '../../domain/translations/Liquids';
import { Word } from '../../domain/translations/Word';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

const sown = (field: Tincture, tincture: Tincture): Blazon => ({
  field: { type: FieldType.plain, tincture: field, semy: { type: ChargeType.goutte, tincture } },
});

// Parker's table, liquid by liquid.
const POURED: readonly (readonly [string, Tincture])[] = [
  ["d'eau", Metals.argent],
  ["d'or", Metals.or],
  ['de larmes', Colours.azure],
  ['de poix', Colours.sable],
  ['de sang', Colours.gules],
  ["d'huile", Colours.vert],
];

describe('gutté, the field sown with drops', () => {
  test.each(POURED)('reads gutté %s, and writes it back', (liquid, tincture) => {
    const blazon = `Purpure gutté ${liquid}.`;
    expect(inEnglish.parse(blazon)).toEqual(sown(Colours.purpure, tincture));
    expect(writeEnglish.write(inEnglish.parse(blazon))).toBe(blazon);
  });

  test.each(POURED)('reads the drops borne %s as well as sown', (liquid, tincture) => {
    const blazon = `Purpure three gouttes ${liquid}.`;
    expect(inEnglish.parse(blazon).chargesOrOrdinaries).toEqual([
      { type: ChargeType.goutte, tincture, count: 3 },
    ]);
    expect(writeEnglish.write(inEnglish.parse(blazon))).toBe(blazon);
  });

  test('reads every spelling Parker gives, and writes gutté', () => {
    for (const spelling of ['gutté', 'gutty', 'goutty', 'gouté', 'guttée']) {
      expect(writeEnglish.write(inEnglish.parse(`Argent ${spelling} de sang`))).toBe(
        'Argent gutté de sang.'
      );
    }
  });

  test('reads the oil by either of its names, and writes it d’huile', () => {
    expect(writeEnglish.write(inEnglish.parse("Argent gutté d'olive"))).toBe(
      "Argent gutté d'huile."
    );
  });

  test('reads the tincture named outright, and writes the liquid', () => {
    expect(writeEnglish.write(inEnglish.parse('Argent gutty gules'))).toBe('Argent gutté de sang.');
  });

  test('writes the tincture where Parker names no liquid for it', () => {
    expect(writeEnglish.write(sown(Metals.or, Colours.purpure))).toBe('Or gutté purpure.');
    expect(writeEnglish.write(sown(Metals.or, Furs.ermine))).toBe('Or gutté ermine.');
  });

  test('reads the drops sown in as many words, and pours them as well', () => {
    expect(inEnglish.parse('Argent semy of gouttes de sang')).toEqual(
      sown(Metals.argent, Colours.gules)
    );
  });

  test('refuses a liquid poured as anything but a drop', () => {
    expect(() => inEnglish.parse('Argent a bend de sang')).toThrow();
    expect(() => inEnglish.parse('Argent semy of billets de sang')).toThrow();
  });

  test('refuses a liquid without its article, and an article that does not agree', () => {
    expect(() => inEnglish.parse('Argent gutté sang')).toThrow(UnknownTincture);
    expect(() => inEnglish.parse('Argent gutté de eau')).toThrow(WrongTinctureArticle);
    expect(() => inEnglish.parse('Argent gutté de eau')).toThrow(/expected "d'eau"/);
  });

  test('refuses a liquid Parker does not name', () => {
    expect(() => inEnglish.parse('Argent gutté de vin')).toThrow(UnknownTincture);
  });
});

describe('goutté, which French writes by the tincture', () => {
  test('reads and writes the field sown with drops by its own word', () => {
    expect(inFrench.parse("D'argent goutté de gueules")).toEqual(
      sown(Metals.argent, Colours.gules)
    );
    expect(writeFrench.write(sown(Metals.argent, Colours.gules))).toBe(
      "D'argent goutté de gueules."
    );
  });

  test.each([
    ['de sang', Colours.gules, 'de gueules'],
    ['de poix', Colours.sable, 'de sable'],
    ["d'eau", Metals.argent, "d'argent"],
  ] as const)('reads goutté %s, and writes the tincture', (liquid, tincture, written) => {
    expect(inFrench.parse(`D'azur goutté ${liquid}`)).toEqual(sown(Colours.azure, tincture));
    expect(writeFrench.write(inFrench.parse(`D'azur goutté ${liquid}`))).toBe(
      `D'azur goutté ${written}.`
    );
    expect(writeFrench.write(inFrench.parse(`D'azur à trois gouttes ${liquid}`))).toBe(
      `D'azur à trois gouttes ${written}.`
    );
  });

  test('reads the drops sown in as many words, and pours them as well', () => {
    expect(inFrench.parse('D’argent semé de gouttes de sang')).toEqual(
      sown(Metals.argent, Colours.gules)
    );
  });

  test('pours nothing the dictionary does not name', () => {
    expect(() => inFrench.parse("D'argent goutté de larmes")).toThrow(UnknownTincture);
    expect(() => inFrench.parse("D'argent goutté d'huile")).toThrow(UnknownTincture);
  });

  test('refuses a liquid poured as anything but a drop', () => {
    expect(() => inFrench.parse("D'argent à la bande de sang")).toThrow();
  });
});

describe('across the two tongues', () => {
  test('a French drop comes back poured in English', () => {
    expect(writeEnglish.write(inFrench.parse("D'azur goutté d'argent"))).toBe("Azure gutté d'eau.");
    expect(writeEnglish.write(inFrench.parse("D'or à trois gouttes de poix"))).toBe(
      'Or three gouttes de poix.'
    );
  });

  test('an English liquid comes back as its tincture in French', () => {
    expect(writeFrench.write(inEnglish.parse('Argent gutté de larmes'))).toBe(
      "D'argent goutté d'azur."
    );
    expect(writeFrench.write(inEnglish.parse("Gules three gouttes d'or"))).toBe(
      "De gueules à trois gouttes d'or."
    );
  });
});

describe('the liquids', () => {
  const said = (liquids: Liquids) =>
    TINCTURES.flatMap((tincture) => {
      const words = liquids[tincture];
      return words === undefined ? [] : Array.isArray(words) ? words : [words];
    });

  test.each([
    ['English', EnglishLiquids],
    ['French', FrenchLiquids],
  ] as const)('are said of the drop in %s, and of nothing else', (_, liquids) => {
    for (const word of said(liquids) as Word[]) {
      expect(word.saidOf).toEqual([ChargeType.goutte]);
    }
  });

  test('pour nothing for a figure they are not said of', () => {
    expect(pouredIn(EnglishLiquids, ChargeType.billet, Colours.gules)).toBeUndefined();
    expect(pouredIn(EnglishLiquids, ChargeType.goutte, Colours.gules)?.value).toBe('sang');
  });
});
