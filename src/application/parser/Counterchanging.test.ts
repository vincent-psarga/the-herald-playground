import { describe, expect, test } from 'vitest';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { UndividedField } from '../../domain/errors/parsing/UndividedField';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { ChargeType } from '../../domain/models/Charge';
import { Modifier } from '../../domain/models/Modifier';
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
    expect(() => inFrench.parse("D'or à la billette de l'un en l'autre")).toThrow(UndividedField);
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

describe('a charge that takes the field instead of a tincture', () => {
  test('is read and written exactly as a band is, the two being one phrase', () => {
    expect(inFrench.parse("Parti d'argent et de gueules à la billette de l'un à l'autre")).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Metals.argent,
        secondTincture: Colours.gules,
      },
      chargesOrOrdinaries: [{ type: ChargeType.billet, tincture: COUNTERCHANGED }],
    });
    expect(
      writeEnglish.write(
        inFrench.parse("Parti d'argent et de gueules à la billette de l'un à l'autre")
      )
    ).toBe('Per pale argent and gules a billet counterchanged.');
  });

  test('is borne in number, which is how heraldry counterchanges charges most often', () => {
    const blazon = inFrench.parse("Coupé d'or et de sable à deux losanges de l'un à l'autre");
    expect(blazon.chargesOrOrdinaries).toEqual([
      { type: ChargeType.lozenge, tincture: COUNTERCHANGED, count: 2 },
    ]);
    expect(writeEnglish.write(blazon)).toBe('Per fess or and sable two lozenges counterchanged.');
    expect(writeFrench.write(blazon)).toBe(
      "Coupé d'or et de sable à deux losanges de l'un à l'autre."
    );
  });

  test('carries whatever was done to it, the two standing side by side', () => {
    const blazon = inEnglish.parse(
      'Per pale argent and sable three lozenges voided counterchanged'
    );
    expect(blazon.chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.lozenge,
        tincture: COUNTERCHANGED,
        count: 3,
        modifier: Modifier.voided,
      },
    ]);
    // A lozenge voided is a mascle, and the name says the voiding by being
    // written: what follows is the phrase and nothing else.
    expect(writeEnglish.write(blazon)).toBe(
      'Per pale argent and sable three mascles counterchanged.'
    );
    expect(writeFrench.write(blazon)).toBe(
      "Parti d'argent et de sable à trois macles de l'un à l'autre."
    );
  });

  test('is named by the word that claims no tincture, where the tongue has one', () => {
    // English keeps a name for every colour of roundel and one for none of them.
    // Counterchanged, only the last will do.
    expect(
      writeEnglish.write(inEnglish.parse('Per pale or and sable a roundel counterchanged'))
    ).toBe('Per pale or and sable a roundel counterchanged.');
  });

  test('stands beside charges that name a tincture, in the order the blazon laid them', () => {
    const blazon = inEnglish.parse(
      'Per fess argent and gules a billet azure three lozenges counterchanged'
    );
    expect(blazon.chargesOrOrdinaries).toEqual([
      { type: ChargeType.billet, tincture: Colours.azure },
      { type: ChargeType.lozenge, tincture: COUNTERCHANGED, count: 3 },
    ]);
  });

  test('is drawn out of the field, which is the very drawing a band gets', () => {
    const coloured = new SvgBlazonDrawer(WikipediaColours);
    const svg = coloured.draw(
      inFrench.parse("Parti d'or et de sable à deux losanges de l'un à l'autre")
    );
    const mask = svg.match(/<mask id="([^"]+)"/);
    expect(mask).not.toBeNull();
    expect(svg).toContain(`<g mask="url(#${mask?.[1]})">`);
    // Both charges are cut from the one mask: they are one figure of two shapes,
    // painted alike, exactly as three bends are.
    expect(svg.match(/<mask /g)).toHaveLength(1);
  });
});

describe('a field quartered, which is cut by a line that crosses itself', () => {
  // Parker counterchanges over a quartering as readily as over a partition, and
  // his examples are quarterings: "Quarterly, argent and azure, a cross
  // engrailed counterchanged — HAYDON"; "Quarterly, sable and argent, a cross
  // counterchanged — LORRAYNE". A quartering is a partition, so nothing had to
  // let it: what the phrase asks for is a field cut between two tinctures, and
  // a quartering is one.
  test.each<[string, FieldType]>([
    ['écartelé', FieldType.cross],
    ['écartelé en sautoir', FieldType.saltire],
  ])('counterchanges a band over a field %s', (name, type) => {
    expect(inFrench.parse(`${name} d'argent et d'azur à la croix de l'un à l'autre`)).toEqual({
      field: { type, firstTincture: Metals.argent, secondTincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.cross, tincture: COUNTERCHANGED }],
    });
  });

  test("reads Parker's own blazon, and says it in French", () => {
    const arms = inEnglish.parse('Quarterly sable and argent a cross counterchanged');
    expect(new FrenchBlazonWriter().write(arms)).toBe(
      "Écartelé de sable et d'argent à la croix de l'un à l'autre."
    );
    expect(new EnglishBlazonWriter().write(arms)).toBe(
      'Quarterly sable and argent a cross counterchanged.'
    );
  });

  // The two quarters of a tincture stand for the half a partition would have
  // given it, so the band is cut out of the quartering itself: both tinctures
  // are painted inside the mask, each where its own quarters do not lie.
  test('cuts the band out of the quartering, in both its tinctures', () => {
    const svg = new SvgBlazonDrawer(WikipediaColours).draw(
      inFrench.parse("Écartelé de gueules et d'or à la croix de l'un à l'autre")
    );
    const masked = svg.slice(svg.indexOf('<g mask="url(#'));
    expect(masked).toContain(WikipediaColours[Colours.gules] as string);
    expect(masked).toContain(WikipediaColours[Metals.or] as string);
  });

  // Or is dotted and gules is ruled upright: the band adds neither, taking the
  // pair the quartering already carries.
  test('asks for no tincture of its own among the ones the drawing defines', () => {
    const svg = new SvgBlazonDrawer(HatchingColours).draw(
      inFrench.parse("Écartelé de gueules et d'or à la croix de l'un à l'autre")
    );
    expect(svg.match(/<pattern /g)).toHaveLength(2);
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

  test('a name that has already said what the figure is painted with', () => {
    // A besant is a gold coin, so a besant painted half out of the sable half of
    // the field is a besant that is not gold — refused by the very rule that
    // refuses "au besant d'azur".
    expect(() => inEnglish.parse('Per pale or and sable a besant counterchanged')).toThrow(
      InvalidTincture
    );
    // French names the metal disc and the coloured disc and nothing in between,
    // so it cannot counterchange one at all.
    expect(() => inFrench.parse("Parti d'or et de sable au tourteau de l'un à l'autre")).toThrow(
      InvalidTincture
    );
  });

  test('and says so quoting the phrase the blazon wrote', () => {
    const refusal = refused(() =>
      inFrench.parse("Parti d'or et de sable au tourteau de l'un en l'autre")
    ) as InvalidTincture;
    expect(refusal.borne).toBe('tourteau');
    expect(refusal.tincture).toBe("de l'un à l'autre");
    expect(refusal.message).toBe("Wrong tincture: tourteau is never de l'un à l'autre");
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
