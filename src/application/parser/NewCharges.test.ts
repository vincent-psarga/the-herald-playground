import { describe, expect, test } from 'vitest';
import { ChargeType } from '../../domain/models/Charge';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { SvgBlazonDrawer } from '../drawer/svg/SvgBlazonDrawer';
import { CHARGES } from '../drawer/svg/vocabulary/charges';
import { crescent } from '../drawer/svg/shapes/crescent';
import { WikipediaColours } from '../../infra/colours/WikipediaColours';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

describe('the goutte', () => {
  test('is borne alone, and in number', () => {
    expect(inFrench.parse("D'azur à la goutte d'or").chargesOrOrdinaries).toEqual([
      { type: ChargeType.goutte, tincture: Metals.or },
    ]);
    expect(inEnglish.parse('Or three gouttes gules').chargesOrOrdinaries).toEqual([
      { type: ChargeType.goutte, tincture: Colours.gules, count: 3 },
    ]);
  });

  test('is feminine in French, and takes the article that agrees', () => {
    expect(writeFrench.write(inEnglish.parse('Azure a goutte or'))).toBe(
      "D'azur à la goutte d'or."
    );
  });

  test('is sown under the word each tongue names the strewing by', () => {
    const sown = inFrench.parse("D'azur semé de gouttes d'argent");
    expect(writeFrench.write(sown)).toBe("D'azur goutté d'argent.");
    expect(writeEnglish.write(sown)).toBe("Azure gutté d'eau.");
  });
});

describe('the larme, which is not the goutte however near it stands to one', () => {
  test('is borne alone, and in number', () => {
    expect(inFrench.parse("D'azur à la larme d'argent").chargesOrOrdinaries).toEqual([
      { type: ChargeType.larme, tincture: Metals.argent },
    ]);
    expect(inFrench.parse("De sinople à trois larmes d'argent").chargesOrOrdinaries).toEqual([
      { type: ChargeType.larme, tincture: Metals.argent, count: 3 },
    ]);
  });

  test('is feminine in French, and takes the article that agrees', () => {
    expect(writeFrench.write(inEnglish.parse('Azure a larme argent'))).toBe(
      "D'azur à la larme d'argent."
    );
  });

  /*
   * English files "Larmes, or Larmettes" as nothing but a pointer back to its
   * Gouttes, so the figure French names has no English name of its own and the
   * word is read and written in both tongues alike.
   */
  test('is the one term under both tongues, English having taken the word whole', () => {
    expect(inFrench.parse("D'azur à trois larmes d'argent")).toEqual(
      inEnglish.parse('Azure three larmes argent')
    );
  });

  test('is a term of its own, and not the goutte read under a second name', () => {
    expect(inFrench.parse("D'azur à la goutte d'argent").chargesOrOrdinaries).toEqual([
      { type: ChargeType.goutte, tincture: Metals.argent },
    ]);
    expect(inFrench.parse("D'azur à la larme d'argent")).not.toEqual(
      inFrench.parse("D'azur à la goutte d'argent")
    );
  });

  test('is drawn as a figure of its own, the drop being another shape again', () => {
    const spot = { x: 100, y: 100, size: 20 };
    const paint = { fill: '#fff' };
    expect(CHARGES[ChargeType.larme].at(spot)(paint)).not.toBe(
      CHARGES[ChargeType.goutte].at(spot)(paint)
    );
  });

  test('is sown in as many words, neither tongue naming a strewing of tears', () => {
    const sown = inFrench.parse("D'azur semé de larmes d'argent");
    expect(writeFrench.write(sown)).toBe("D'azur semé de larmes d'argent.");
    expect(writeEnglish.write(sown)).toBe('Azure semy of larmes argent.');
  });

  test('takes no modifier, nothing being said of a tear that the armorials write', () => {
    expect(() => inFrench.parse("D'azur à la larme vidée d'argent")).toThrow(WrongModifier);
    expect(() => inEnglish.parse('Azure a larme voided argent')).toThrow(
      'Wrong modifier: larme is never voided'
    );
  });
});

describe('the mullet, which French calls an étoile', () => {
  test('is the one term under both names', () => {
    expect(inFrench.parse("D'azur à trois étoiles d'or")).toEqual(
      inEnglish.parse('Azure three mullets or')
    );
  });

  test('elides its article in French, beginning on a vowel as it does', () => {
    expect(writeFrench.write(inEnglish.parse('Azure a mullet or'))).toBe("D'azur à l'étoile d'or.");
  });

  test('is drawn with five rays, which is what both tongues understand', () => {
    const drawn = inFrench.parse("D'azur à l'étoile d'or");
    expect(drawn.chargesOrOrdinaries).toEqual([{ type: ChargeType.mullet, tincture: Metals.or }]);
  });

  test('is sown in as many words: neither tongue names a strewing of stars', () => {
    expect(writeEnglish.write(inFrench.parse("D'azur semé d'étoiles d'or"))).toBe(
      'Azure semy of mullets or.'
    );
  });
});

describe('the fleur-de-lis', () => {
  const SPELT = ['fleur de lys', 'fleur-de-lys', 'fleur de lis', 'fleur-de-lis'] as const;

  test.each(SPELT)('reads "%s", however the armorial hyphenates it', (spelling) => {
    expect(inFrench.parse(`D'azur à la ${spelling} d'or`).chargesOrOrdinaries).toEqual([
      { type: ChargeType.fleurDeLis, tincture: Metals.or },
    ]);
  });

  test('writes one of the four back, whichever was read', () => {
    for (const spelling of SPELT) {
      expect(writeFrench.write(inFrench.parse(`D'azur à la ${spelling} d'or`))).toBe(
        "D'azur à la fleur de lys d'or."
      );
    }
  });

  test('reads the name spelled with spaces, "de" and all', () => {
    expect(inFrench.parse("D'azur à trois fleurs de lys d'or").chargesOrOrdinaries).toEqual([
      { type: ChargeType.fleurDeLis, tincture: Metals.or, count: 3 },
    ]);
  });

  test('keeps the French plural in English: the flowers are several, not the lily', () => {
    expect(writeEnglish.write(inFrench.parse("D'azur à trois fleurs de lys d'or"))).toBe(
      'Azure three fleurs-de-lis or.'
    );
  });

  test('is sown as France was, and English names that strewing', () => {
    const france = inFrench.parse("D'azur semé de fleurs-de-lis d'or");
    expect(writeEnglish.write(france)).toBe('Azure semy-de-lis or.');
    expect(writeFrench.write(france)).toBe("D'azur semé de fleurs de lys d'or.");
  });

  test('reads the English strewing back into the arms it names', () => {
    expect(inEnglish.parse('Azure semy-de-lis or')).toEqual(
      inFrench.parse("D'azur semé de fleurs de lys d'or")
    );
  });
});

describe('the croisette, which English blazons as a cross couped', () => {
  test('is the one term under both names', () => {
    expect(inFrench.parse("D'azur à la croisette d'or")).toEqual(
      inEnglish.parse('Azure a cross couped or')
    );
  });

  test('reads the older English word for couped, and writes the current one', () => {
    expect(writeEnglish.write(inEnglish.parse('Azure a cross humetty or'))).toBe(
      'Azure a cross couped or.'
    );
  });

  test('pluralises the noun rather than the word that follows it', () => {
    expect(writeEnglish.write(inFrench.parse("D'azur à trois croisettes d'or"))).toBe(
      'Azure three crosses couped or.'
    );
  });

  /*
   * The two share their first word, so both readings are offered and the tincture
   * settles it. Nothing about the ordinary changed, which is the thing to check.
   */
  test('leaves the ordinary cross the band it always was', () => {
    expect(inEnglish.parse('Azure a cross or').chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.cross, tincture: Metals.or },
    ]);
    expect(inEnglish.parse('Azure a cross couped or').chargesOrOrdinaries).toEqual([
      { type: ChargeType.crossCouped, tincture: Metals.or },
    ]);
  });

  test('still refuses more than one of the ordinary, which is borne but once', () => {
    expect(() => inEnglish.parse('Azure three crosses or')).toThrow(
      'Borne but once: crosses, not 3 of them'
    );
  });

  test('is sown in as many words: crusily names a semy of crosses crosslet, not of these', () => {
    expect(writeEnglish.write(inFrench.parse("D'azur semé de croisettes d'or"))).toBe(
      'Azure semy of crosses couped or.'
    );
  });

  test('reads no "crosslet", which is another figure again', () => {
    expect(() => inEnglish.parse('Azure a crosslet or')).toThrow();
  });
});

describe('the crescent', () => {
  test('is the one term under both names, and is masculine in French', () => {
    expect(inEnglish.parse('Azure a crescent or')).toEqual(
      inFrench.parse("D'azur au croissant d'or")
    );
  });

  test('is borne in number like anything else', () => {
    expect(inFrench.parse("D'azur à trois croissants d'or").chargesOrOrdinaries).toEqual([
      { type: ChargeType.crescent, tincture: Metals.or, count: 3 },
    ]);
  });

  /*
   * The horns are where the two circles cross. Both stand level with each other
   * and above the middle of the figure, which is the whole of what "uppermost"
   * asks for — the moon hangs below them.
   */
  test('stands its horns uppermost, there being no other way to blazon it here', () => {
    const drawn = crescent(100, 100, 40)({ fill: '#fff' });
    const [, , dexter, , sinister] =
      drawn.match(/M(-?[\d.]+) (-?[\d.]+) A[\d.]+ [\d.]+ 0 1 0 (-?[\d.]+) (-?[\d.]+)/) ?? [];
    expect(dexter).toBe(sinister);
    expect(Number(dexter)).toBeLessThan(100);
  });

  test('is drawn as a crescent wherever it is put', () => {
    expect(
      new SvgBlazonDrawer(WikipediaColours).draw(inEnglish.parse('Azure a crescent or'))
    ).toContain('<path d="M');
  });
});

describe('what the armorials can now be read as', () => {
  test.each([
    ["D'azur à trois étoiles d'or.", 'Azure three mullets or.'],
    ['D’azur semé de gouttes d’argent.', "Azure gutté d'eau."],
    ["D'azur semé de fleurs-de-lis d'or", 'Azure semy-de-lis or.'],
    ["De sinople à trois larmes d'argent.", 'Vert three larmes argent.'],
    ["De gueules à trois larmes d'argent.", 'Gules three larmes argent.'],
  ])('reads %s, copied from an armorial as it stands', (blazon, english) => {
    expect(writeEnglish.write(inFrench.parse(blazon))).toBe(english);
  });
});
