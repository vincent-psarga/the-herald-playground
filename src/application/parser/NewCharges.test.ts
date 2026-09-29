import { describe, expect, test } from 'vitest';
import { ChargeType } from '../../domain/models/Charge';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { SvgBlazonDrawer } from '../drawer/svg/SvgBlazonDrawer';
import { crescent } from '../drawer/svg/shapes/crescent';
import { lion, lionClaws, lionTongue } from '../drawer/svg/shapes/lion';
import { HatchingColours } from '../../infra/colours/HatchingColours';
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

  test('is sown in as many words, neither tongue naming the strewing by a tincture', () => {
    const sown = inFrench.parse("D'azur semé de gouttes d'argent");
    expect(writeFrench.write(sown)).toBe("D'azur semé de gouttes d'argent.");
    expect(writeEnglish.write(sown)).toBe('Azure semy of gouttes argent.');
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

describe('the lion, which is the first of the beasts', () => {
  test('is the one word in both tongues, and masculine in French', () => {
    expect(inFrench.parse("D'argent au lion de sable")).toEqual(
      inEnglish.parse('Argent a lion sable')
    );
    expect(writeFrench.write(inEnglish.parse('Argent a lion sable'))).toBe(
      "D'argent au lion de sable."
    );
  });

  test('is borne in number like anything else', () => {
    expect(inEnglish.parse('Argent three lions gules').chargesOrOrdinaries).toEqual([
      { type: ChargeType.lion, tincture: Colours.gules, count: 3 },
    ]);
    expect(writeFrench.write(inEnglish.parse('Argent three lions gules'))).toBe(
      "D'argent à trois lions de gueules."
    );
  });

  test('is rampant, no blazon here being able to say otherwise', () => {
    // The posture is the beast's own and is written nowhere: "le Lion dans sa
    // position naturelle est rampant". Passant, couchant and the rest are a
    // vocabulary this does not hold, so a blazon naming one is refused.
    expect(() => inFrench.parse("D'argent au lion passant de sable")).toThrow();
    expect(() => inEnglish.parse('Argent a lion passant sable')).toThrow();
  });

  test('is sown in as many words, neither tongue naming a strewing of beasts', () => {
    const sown = inFrench.parse("D'argent semé de lions de sable");
    expect(writeFrench.write(sown)).toBe("D'argent semé de lions de sable.");
    expect(writeEnglish.write(sown)).toBe('Argent semy of lions sable.');
  });

  test('takes no modifier, voiding a beast naming no figure', () => {
    expect(() => inEnglish.parse('Argent a lion sable voided')).toThrow();
  });

  test('keeps its claws and its tongue where no blazon paints them', () => {
    // A lion has claws whether or not a blazon says anything of them: armed says
    // what colour they are drawn and not that there are any. So the beast is
    // drawn with them and in its own tincture, and an attribute paints over what
    // is already there — which is what parts a part the figure has from a part a
    // name gives it, a ring having no stone until something says there is one.
    const drawn = (shape: (brush: { fill: string }) => string) => shape({ fill: 'x' });
    const beast = drawn(lion(0, 0, 100));
    for (const part of [lionClaws(0, 0, 100), lionTongue(0, 0, 100)]) {
      const path = drawn(part).match(/ d="([^"]+)"/)?.[1];
      expect(path).toBeDefined();
      expect(beast).toContain(path);
    }
  });

  test('is modelled in a wash that is no tincture, so it reads on any of them', () => {
    // The folio paints the beast in two greens, and without the second it is a
    // blot of one colour with its limbs lost in it. The wash is grey and laid
    // through rather than over, which tells on a light tincture and a dark one
    // alike where a black one would vanish on sable.
    const drawer = new SvgBlazonDrawer(WikipediaColours);
    for (const blazon of ['Argent a lion sable', 'Azure a lion or', 'Gules a lion argent']) {
      expect(drawer.draw(inEnglish.parse(blazon))).toContain('fill-opacity="0.35"');
    }
  });

  test('is not modelled where the colouring rules its tinctures', () => {
    // Hatching reproduces arms in one ink and has no shades in it: every mark is
    // a tincture being named, and a grey would name none and hide the ruling.
    expect(
      new SvgBlazonDrawer(HatchingColours).draw(inEnglish.parse('Argent a lion sable'))
    ).not.toContain('fill-opacity');
  });

  test('is drawn as the folio draws it, claws and tongue apart from the rest', () => {
    const drawer = new SvgBlazonDrawer(WikipediaColours);
    const plain = drawer.draw(inEnglish.parse('Argent a lion sable'));
    const painted = drawer.draw(inEnglish.parse('Argent a lion sable armed and langued gules'));
    // The beast is the same drawing either way: what the parts add is laid over
    // it, so the plain figure is still there underneath.
    expect(painted).toContain(
      plain.slice(plain.indexOf('<path d="M'), plain.indexOf('<path d="M') + 200)
    );
    expect(painted).not.toBe(plain);
  });
});

describe('what the armorials can now be read as', () => {
  test.each([
    ["D'azur à trois étoiles d'or.", 'Azure three mullets or.'],
    ['D’azur semé de gouttes d’argent.', 'Azure semy of gouttes argent.'],
    ["D'azur semé de fleurs-de-lis d'or", 'Azure semy-de-lis or.'],
    // The arms of Gallegantin le Gallois, as the folio the beast was traced
    // from blazons them: "parti d'or et de sable a ung lyon de sinople arme et
    // langue de gueulles".
    [
      "Parti d'or et de sable, au lion de sinople armé et lampassé de gueules",
      'Per pale or and sable a lion vert armed and langued gules.',
    ],
    [
      'D’argent au lion de sable, armé et lampassé de sinople.',
      'Argent a lion sable armed and langued vert.',
    ],
  ])('reads %s, copied from an armorial as it stands', (blazon, english) => {
    expect(writeEnglish.write(inFrench.parse(blazon))).toBe(english);
  });
});
