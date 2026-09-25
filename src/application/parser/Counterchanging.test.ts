import { describe, expect, test } from 'vitest';
import { CounterchangedCharge } from '../../domain/errors/parsing/CounterchangedCharge';
import { UndividedField } from '../../domain/errors/parsing/UndividedField';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { ChargeType } from '../../domain/models/Charge';
import { COUNTERCHANGED } from '../../domain/models/Counterchanged';
import { FieldType } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { HatchingColours } from '../../infra/colours/HatchingColours';
import { WikipediaColours } from '../../infra/colours/WikipediaColours';
import { SvgBlazonDrawer } from '../drawer/svg/SvgBlazonDrawer';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

describe('a band that takes the field instead of a tincture', () => {
  test('is read where a tincture would be read, and names none', () => {
    expect(inFrench.parse("Parti d'or et de sable, à la bordure de l'un à l'autre")).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Metals.or,
        secondTincture: Colours.sable,
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: COUNTERCHANGED }],
    });
  });

  test('is the one term under both tongues, which say it in as many words apiece', () => {
    expect(inFrench.parse("Parti d'or et de sable à la bordure de l'un à l'autre")).toEqual(
      inEnglish.parse('Per pale or and sable a bordure counterchanged')
    );
  });

  test('is written back in the tongue it is asked for, whichever it was read in', () => {
    const french = inFrench.parse("Parti d'or et de sable à la bordure de l'un à l'autre");
    expect(writeFrench.write(french)).toBe(
      "Parti d'or et de sable à la bordure de l'un à l'autre."
    );
    expect(writeEnglish.write(french)).toBe('Per pale or and sable a bordure counterchanged.');

    const english = inEnglish.parse('Per fess argent and gules a chevron counterchanged');
    expect(writeFrench.write(english)).toBe(
      "Coupé d'argent et de gueules au chevron de l'un à l'autre."
    );
    expect(writeEnglish.write(english)).toBe('Per fess argent and gules a chevron counterchanged.');
  });

  test('is read however the blazon spaced and capitalised the phrase', () => {
    const written = "Parti d'or et de sable à la bordure de l'un à l'autre.";
    for (const blazon of [
      "Parti d'or et de sable à la bordure De L'Un À L'Autre",
      "Parti d'or et de sable à la bordure de l’un à l’autre",
      "Parti d'or et de sable ; à la bordure de l'un à l'autre.",
    ]) {
      expect(writeFrench.write(inFrench.parse(blazon))).toBe(written);
    }
  });

  test('is read under either phrase French writes it with, and written back under one', () => {
    const written = "Parti d'or et de sable à la bordure de l'un à l'autre.";
    for (const blazon of [
      "Parti d'or et de sable à la bordure de l'un en l'autre",
      "Parti d'or et de sable à la bordure De L'Un En L'Autre",
    ]) {
      expect(inFrench.parse(blazon)).toEqual(
        inFrench.parse("Parti d'or et de sable à la bordure de l'un à l'autre")
      );
      expect(writeFrench.write(inFrench.parse(blazon))).toBe(written);
      expect(writeEnglish.write(inFrench.parse(blazon))).toBe(
        'Per pale or and sable a bordure counterchanged.'
      );
    }
  });

  test('refuses the second phrase exactly where it refuses the first', () => {
    expect(() => inFrench.parse("D'or à la bordure de l'un en l'autre")).toThrow(UndividedField);
    expect(() => inFrench.parse("Parti d'or et de sable à la billette de l'un en l'autre")).toThrow(
      CounterchangedCharge
    );
  });

  test('is borne in number, as the band itself is', () => {
    expect(
      inFrench.parse("Tranché d'or et d'azur à trois bandes de l'un à l'autre").chargesOrOrdinaries
    ).toEqual([{ type: OrdinaryType.bend, tincture: COUNTERCHANGED, count: 3 }]);
    expect(
      writeEnglish.write(inFrench.parse("Tranché d'or et d'azur à trois bandes de l'un à l'autre"))
    ).toBe('Per bend or and azure three bends counterchanged.');
  });

  test('stands beside bands that name a tincture, in the order the blazon laid them', () => {
    const blazon = inFrench.parse(
      "Parti d'or et de sable, à la fasce de gueules, à la bordure de l'un à l'autre"
    );
    expect(blazon.chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.fess, tincture: Colours.gules },
      { type: OrdinaryType.bordure, tincture: COUNTERCHANGED },
    ]);
  });
});

describe('what counterchanging refuses', () => {
  test('a field with nothing to counterchange between, by name', () => {
    expect(() => inFrench.parse("D'or à la bordure de l'un à l'autre")).toThrow(UndividedField);
    expect(() => inEnglish.parse('Or a bordure counterchanged')).toThrow(UndividedField);
  });

  test('a varied field and a furred one, which are cut but not in two', () => {
    expect(() => inEnglish.parse('Barry of six or and sable a fess counterchanged')).toThrow(
      UndividedField
    );
    expect(() => inEnglish.parse('Vairy or and sable a fess counterchanged')).toThrow(
      UndividedField
    );
  });

  test('a charge, which heraldry counterchanges and this does not read yet', () => {
    expect(() => inFrench.parse("Parti d'or et de sable à la billette de l'un à l'autre")).toThrow(
      CounterchangedCharge
    );
    expect(() => inEnglish.parse('Per pale or and sable a billet counterchanged')).toThrow(
      CounterchangedCharge
    );
  });

  test('a field sown with a charge, the sowing naming no tincture of the band', () => {
    expect(() => inEnglish.parse('Or semy of billets sable a fess counterchanged')).toThrow(
      UndividedField
    );
  });

  test('nothing about the complaint a mistyped tincture makes', () => {
    // Both readings open on "de", and the phrase gives the tincture's complaint
    // the right of way rather than reporting that it is not a phrase.
    expect(() => inFrench.parse("Parti d'or et de sable à la bordure de fuchsia")).toThrow(
      UnknownTincture
    );
    expect(() => inFrench.parse("Parti d'or et de sable à la bordure de l'un et l'autre")).toThrow(
      UnknownTincture
    );
  });
});

describe('a counterchanged band, drawn', () => {
  const coloured = new SvgBlazonDrawer(WikipediaColours);
  const hatched = new SvgBlazonDrawer(HatchingColours);

  const drawn = (blazon: string) => coloured.draw(inFrench.parse(blazon));

  test('is painted out of the field it is laid on, in both tinctures and neither more', () => {
    const svg = drawn("Parti d'or et de sable à la fasce de l'un à l'autre");
    const or = WikipediaColours[Metals.or] as string;
    const sable = WikipediaColours[Colours.sable] as string;
    // The field's halves, then the band's — the same two paints over again, the
    // other way round.
    expect(svg.split(or).length - 1).toBe(2);
    expect(svg.split(sable).length - 1).toBe(2);
  });

  test('is cut to the band by a mask, which a stroked bordure needs and a clip could not give', () => {
    const svg = drawn("Parti d'or et de sable à la bordure de l'un à l'autre");
    const mask = svg.match(/<mask id="([^"]+)"/);
    expect(mask).not.toBeNull();
    expect(svg).toContain(`<g mask="url(#${mask?.[1]})">`);
  });

  test('names its mask after the shapes it shows, so two drawings on one page never collide', () => {
    const fess = drawn("Parti d'or et de sable à la fasce de l'un à l'autre");
    const bordure = drawn("Parti d'or et de sable à la bordure de l'un à l'autre");
    const named = (svg: string) => svg.match(/<mask id="([^"]+)"/)?.[1];
    expect(named(fess)).not.toBe(named(bordure));
    expect(named(drawn("Coupé d'or et de sable à la fasce de l'un à l'autre"))).toBe(named(fess));
  });

  test('carries a line round itself and along the cut where the colouring rules its tinctures', () => {
    const svg = hatched.draw(inFrench.parse("Parti d'or et de sable à la fasce de l'un à l'autre"));
    expect(svg).toContain(HatchingColours.ink as string);
  });

  test('asks for no tincture of its own among the ones the drawing defines', () => {
    // Or is dotted and sable is ruled both ways: the band adds neither, taking
    // the pair the field already carries.
    const svg = hatched.draw(
      inFrench.parse("Parti d'or et de sable à la bordure de l'un à l'autre")
    );
    expect(svg.match(/<pattern /g)).toHaveLength(2);
  });
});

describe('a counterchanged band, said of what it is not', () => {
  test('never lets a charge carry it into the model', () => {
    expect(
      inFrench.parse("Parti d'or et de sable à la billette d'argent").chargesOrOrdinaries
    ).toEqual([{ type: ChargeType.billet, tincture: Metals.argent }]);
  });
});
