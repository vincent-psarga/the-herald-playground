import { describe, expect, test } from 'vitest';
import { ChargeType } from '../../domain/models/Charge';
import { FieldType } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours } from '../../domain/models/Tinctures';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

describe('purpure, which French calls pourpre', () => {
  test('is a field in either tongue', () => {
    expect(inFrench.parse('De pourpre').field).toEqual({
      type: FieldType.plain,
      tincture: Colours.purpure,
    });
    expect(inEnglish.parse('Purpure').field).toEqual({
      type: FieldType.plain,
      tincture: Colours.purpure,
    });
  });

  test('is what a band or a charge is borne in', () => {
    expect(inFrench.parse("D'argent à la bande de pourpre").chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Colours.purpure },
    ]);
    expect(inEnglish.parse('Or three mullets purpure').chargesOrOrdinaries).toEqual([
      { type: ChargeType.mullet, tincture: Colours.purpure, count: 3 },
    ]);
  });

  test('takes "de" and never elides it, the word starting on a consonant', () => {
    expect(() => inFrench.parse("D'pourpre")).toThrow(UnknownTincture);
    expect(() => inFrench.parse("D'pourpre")).toThrow(/expected "de pourpre"/);
  });

  test('is read in one tongue and written in the other', () => {
    expect(writeEnglish.write(inFrench.parse("De pourpre à la bande d'argent"))).toBe(
      'Purpure a bend argent.'
    );
    expect(writeFrench.write(inEnglish.parse('Argent a bend purpure'))).toBe(
      "D'argent à la bande de pourpre."
    );
  });

  test('cuts a vairé, being a colour like any other', () => {
    expect(writeEnglish.write(inFrench.parse("Vairé d'or et de pourpre"))).toBe(
      writeEnglish.write(inEnglish.parse('Vairy or and purpure'))
    );
  });

  test('sows a field', () => {
    const sown = inFrench.parse("De pourpre semé de billettes d'or");
    expect(writeEnglish.write(sown)).toBe('Purpure billetty or.');
  });
});

describe('the golpe, which is the roundel purpure', () => {
  test('is read without its tincture, and with it', () => {
    expect(inEnglish.parse('Or a golpe')).toEqual(inEnglish.parse('Or a golpe purpure'));
    expect(inEnglish.parse('Or three golpes').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Colours.purpure, count: 3 },
    ]);
  });

  test('refuses a tincture it does not mean', () => {
    expect(() => inEnglish.parse('Or a golpe gules')).toThrow(InvalidTincture);
  });

  test('is a tourteau de pourpre in French, which names no disc for the colour', () => {
    expect(writeFrench.write(inEnglish.parse('Or three golpes'))).toBe(
      "D'or à trois tourteaux de pourpre."
    );
    expect(writeEnglish.write(inFrench.parse("D'or à trois tourteaux de pourpre"))).toBe(
      'Or three golpes.'
    );
  });

  test('is never a besant de pourpre, a besant being borne in metal', () => {
    expect(() => inFrench.parse("D'or au besant de pourpre")).toThrow(InvalidTincture);
  });

  test('stays the plain roundel where it is borne in a metal', () => {
    expect(writeEnglish.write(inEnglish.parse('Purpure a roundel or'))).toBe('Purpure a besant.');
  });
});
