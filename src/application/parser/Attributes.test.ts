import { describe, expect, test } from 'vitest';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { RepeatedAttribute } from '../../domain/errors/parsing/RepeatedAttribute';
import { WrongAgreement } from '../../domain/errors/parsing/WrongAgreement';
import { WrongAttribute } from '../../domain/errors/parsing/WrongAttribute';
import { Attribute } from '../../domain/models/Attributes';
import { Blazon } from '../../domain/models/Blazon';
import { ChargeType, allowsAttribute, attributesOf } from '../../domain/models/Charge';
import { FieldType } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { EnglishChargeType } from '../../domain/translations/en/Charges';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { wordsOf } from '../../domain/translations/Translation';
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

const drawer = new SvgBlazonDrawer(WikipediaColours);
const drawn = (blazon: string) => drawer.draw(inEnglish.parse(blazon));

const CHARGES = Object.values(ChargeType);
const ATTRIBUTES = Object.values(Attribute);

const AZURE = { type: FieldType.plain, tincture: Colours.azure } as const;

describe('a charge with a part painted apart from the rest', () => {
  test('is the same charge, carrying the part and the tincture it is drawn in', () => {
    expect(inEnglish.parse('Azure an annulet or stoned argent')).toEqual({
      field: AZURE,
      chargesOrOrdinaries: [
        {
          type: ChargeType.annulet,
          tincture: Metals.or,
          attributes: [{ attribute: Attribute.stoned, tincture: Metals.argent }],
        },
      ],
    });
  });

  test('is read in either tongue into the one model', () => {
    expect(inFrench.parse("D'azur à l'annelet d'or chatonné d'argent")).toEqual(
      inEnglish.parse('Azure an annulet or stoned argent')
    );
  });

  test('carries the part however many are borne', () => {
    expect(
      inEnglish.parse('Gules three gem-rings argent stoned azure').chargesOrOrdinaries
    ).toEqual([
      {
        type: ChargeType.annulet,
        tincture: Metals.argent,
        count: 3,
        attributes: [{ attribute: Attribute.stoned, tincture: Colours.azure }],
      },
    ]);
  });

  test('leaves the key off entirely where the blazon painted nothing', () => {
    const [borne] = inEnglish.parse('Azure an annulet or').chargesOrOrdinaries ?? [];
    expect(borne).not.toHaveProperty('attributes');
  });

  test('is borne beside other things, each keeping its own', () => {
    expect(
      inEnglish.parse('Azure a gem-ring or stoned argent, a billet argent').chargesOrOrdinaries
    ).toEqual([
      {
        type: ChargeType.annulet,
        tincture: Metals.or,
        attributes: [{ attribute: Attribute.stoned, tincture: Metals.argent }],
      },
      { type: ChargeType.billet, tincture: Metals.argent },
    ]);
  });
});

describe('where the word stands, and what is owed after it', () => {
  test('stands last of all, after the tincture the charge itself carries', () => {
    // Parker blazons "Gules, three gem-rings argent stoned azure": the charge is
    // owed its tincture first, and the part is owed one of its own after that.
    expect(inEnglish.parse('Azure a gem-ring or stoned argent')).toEqual(
      inEnglish.parse('Azure an annulet or stoned argent')
    );
  });

  test('is owed a tincture, which is the whole of what it says', () => {
    expect(() => inEnglish.parse('Azure a gem-ring or stoned')).toThrow(
      'Missing tincture in: a gem-ring or stoned'
    );
    expect(() => inFrench.parse("D'azur à l'anneau d'or chatonné")).toThrow('Missing tincture');
  });

  test('is refused before the charge, blazon setting no adjective there', () => {
    expect(() => inEnglish.parse('Azure a stoned annulet or')).toThrow('Unknown ordinary: stoned');
  });

  test('is refused twice over, one part having one tincture', () => {
    expect(() => inEnglish.parse('Azure a gem-ring or stoned argent stoned gules')).toThrow(
      RepeatedAttribute
    );
    expect(() => inEnglish.parse('Azure a gem-ring or stoned argent stoned gules')).toThrow(
      'Said twice: stoned, of the one charge'
    );
  });
});

describe('what parts a charge has', () => {
  test('is declared with the charge rather than with either vocabulary', () => {
    expect(attributesOf(ChargeType.annulet)).toEqual([Attribute.stoned]);
    expect(attributesOf(ChargeType.billet)).toEqual([]);
    expect(allowsAttribute(ChargeType.annulet, Attribute.stoned)).toBe(true);
  });

  test('is the ring alone, a stone being set in a ring and in nothing else', () => {
    expect(CHARGES.filter((type) => allowsAttribute(type, Attribute.stoned))).toEqual([
      ChargeType.annulet,
    ]);
  });

  test('refuses a charge with no such part, by name', () => {
    expect(() => inEnglish.parse('Azure a billet or stoned argent')).toThrow(WrongAttribute);
    expect(() => inEnglish.parse('Azure a billet or stoned argent')).toThrow(
      'Wrong attribute: billet is never stoned'
    );
  });

  test('refuses it by the same reckoning in either tongue', () => {
    expect(() => inFrench.parse("D'azur à la billette d'or chatonnée d'argent")).toThrow(
      'Wrong attribute: billette is never chatonné'
    );
  });

  test('refuses a band, which is one tincture from edge to edge', () => {
    expect(() => inEnglish.parse('Azure a fess or stoned argent')).toThrow(WrongAttribute);
    expect(() => inFrench.parse("D'azur à la fasce d'or chatonnée d'argent")).toThrow(
      WrongAttribute
    );
  });

  test.each(CHARGES)('is asked of %s before the blazon is allowed to paint it', (type) => {
    // Whatever the model says each charge has, the parser paints exactly that: a
    // charge given a part in the model and refused here would be a promise the
    // vocabulary could not keep.
    for (const attribute of ATTRIBUTES) {
      const written = writeEnglish.write({
        field: AZURE,
        chargesOrOrdinaries: [
          { type, tincture: Metals.or, attributes: [{ attribute, tincture: Metals.argent }] },
        ],
      });
      if (allowsAttribute(type, attribute)) {
        expect(inEnglish.parse(written).chargesOrOrdinaries?.[0]).toHaveProperty('attributes', [
          { attribute, tincture: Metals.argent },
        ]);
      } else {
        expect(() => inEnglish.parse(written)).toThrow(BlazonParseError);
      }
    }
  });

  test('complains of the tincture instead where the name had already said one', () => {
    // A part stands after the charge's tincture, and a besant is gold by being a
    // besant — so the word stands where the tincture would have, and the
    // complaint is that it is no tincture rather than that a disc has no stone.
    // Both refuse the blazon, which is what a roundel with a stone in it earns.
    expect(() => inEnglish.parse('Azure a besant stoned argent')).toThrow(
      'Unknown tincture: stoned'
    );
  });
});

describe('a word for a part agreeing with the charge in French', () => {
  test.each([
    ["D'azur à l'anneau d'or chatonné d'argent", 'the elided article and the masculine word'],
    ["D'azur à trois anneaux d'or chatonnés d'argent", 'several, and the word in the plural'],
  ])('reads %s: %s', (blazon) => {
    expect(inFrench.parse(blazon).chargesOrOrdinaries?.[0]).toHaveProperty('attributes', [
      { attribute: Attribute.stoned, tincture: Metals.argent },
    ]);
  });

  test.each([
    ["D'azur à l'anneau d'or chatonnée d'argent", 'chatonné'],
    ["D'azur à trois anneaux d'or chatonné d'argent", 'chatonnés'],
  ])('refuses %s, which is owed "%s"', (blazon, expected) => {
    expect(() => inFrench.parse(blazon)).toThrow(WrongAgreement);
    expect(() => inFrench.parse(blazon)).toThrow(`Wrong agreement: expected "${expected}"`);
  });

  test('takes the tincture of the part under the article any tincture takes', () => {
    expect(inFrench.parse("D'azur à l'anneau d'or chatonné de gueules")).toEqual(
      inEnglish.parse('Azure a gem-ring or stoned gules')
    );
  });
});

describe('a run of parts sharing one tincture', () => {
  test('is read joined by the conjunction, and by the mark', () => {
    const run = inFrench.parse("D'argent au lion de sable armé et lampassé de gueules");
    expect(inFrench.parse("D'argent au lion de sable, armé, lampassé de gueules")).toEqual(run);
    expect(inEnglish.parse('Argent a lion sable armed and langued gules')).toEqual(run);
  });

  test('gathers three of them as readily as two', () => {
    expect(
      inFrench.parse("De gueules au lion d'hermine, armé, lampassé et couronné d'or")
        .chargesOrOrdinaries?.[0]
    ).toHaveProperty('attributes', [
      { attribute: Attribute.armed, tincture: Metals.or },
      { attribute: Attribute.langued, tincture: Metals.or },
      { attribute: Attribute.crowned, tincture: Metals.or },
    ]);
  });

  test('is written as a list: the mark between, and the conjunction before the last', () => {
    // Which is how both dictionaries write it, and neither writes the tincture
    // twice over.
    const three = inFrench.parse("D'azur au lion d'or armé, lampassé et couronné de gueules");
    expect(writeFrench.write(three)).toBe(
      "D'azur au lion d'or armé, lampassé et couronné de gueules."
    );
    expect(writeEnglish.write(three)).toBe('Azure a lion or armed, langued and crowned gules.');
  });

  test('writes the conjunction alone where there are two, and nothing where there is one', () => {
    expect(writeEnglish.write(inEnglish.parse('Argent a lion sable armed and langued gules'))).toBe(
      'Argent a lion sable armed and langued gules.'
    );
    expect(writeEnglish.write(inEnglish.parse('Argent a lion sable crowned or'))).toBe(
      'Argent a lion sable crowned or.'
    );
  });

  test('is two runs where the tinctures differ, parted by the mark', () => {
    const blazon = inEnglish.parse('Argent a lion sable armed gules, langued azure, crowned or');
    expect(writeEnglish.write(blazon)).toBe(
      'Argent a lion sable armed gules, langued azure, crowned or.'
    );
    expect(writeFrench.write(blazon)).toBe(
      "D'argent au lion de sable armé de gueules, lampassé d'azur, couronné d'or."
    );
  });

  test('keeps the order the blazon said them in', () => {
    expect(
      inEnglish.parse('Argent a lion sable crowned or, armed gules').chargesOrOrdinaries?.[0]
    ).toHaveProperty('attributes', [
      { attribute: Attribute.crowned, tincture: Metals.or },
      { attribute: Attribute.armed, tincture: Colours.gules },
    ]);
  });

  test('reads the arms the whole of this began with', () => {
    // Franche-Comté, which wanted three parts of one colour on a beast over a
    // sown field, and wanted every piece of this to exist first.
    expect(
      writeEnglish.write(
        inFrench.parse(
          "D'azur semé de billettes d'or au lion d'or armé, lampassé et couronné de gueules"
        )
      )
    ).toBe('Azure billetty or a lion or armed, langued and crowned gules.');
  });
});

describe('the names heraldry gave a ring with a stone in it', () => {
  test('are the charge and the part it has, and not a charge of their own', () => {
    // Parker files the gem-ring under Ring and the ring under Annulet, so the
    // model holds one term: a ring, with something in it or without.
    expect(inEnglish.parse('Azure a gem-ring or').chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.annulet,
        tincture: Metals.or,
        attributes: [{ attribute: Attribute.stoned }],
      },
    ]);
    expect(inFrench.parse("D'azur à l'anneau d'or")).toEqual(
      inEnglish.parse('Azure a gem-ring or')
    );
  });

  test('say the stone and never its tincture, which is what parts them from a besant', () => {
    // A besant is gold entire and refuses any other tincture. A gem-ring says
    // there is a stone and nothing about its colour, so the blazon may still
    // name one — and where it names none the stone is the hoop's own tincture.
    expect(inEnglish.parse('Azure a gem-ring or stoned argent').chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.annulet,
        tincture: Metals.or,
        attributes: [{ attribute: Attribute.stoned, tincture: Metals.argent }],
      },
    ]);
  });

  test('are written back wherever the blazon painted the part', () => {
    // A ring blazoned with a stone is a gem-ring, whichever of the plain names
    // the armorial wrote.
    expect(writeEnglish.write(inEnglish.parse('Azure a ring or stoned argent'))).toBe(
      'Azure a gem-ring or stoned argent.'
    );
    expect(writeEnglish.write(inEnglish.parse('Azure an annulet or stoned argent'))).toBe(
      'Azure a gem-ring or stoned argent.'
    );
    expect(writeFrench.write(inFrench.parse("D'azur à l'annelet d'or chatonné d'argent"))).toBe(
      "D'azur à l'anneau d'or chatonné d'argent."
    );
  });

  test('give the plain name back where nothing was painted', () => {
    expect(writeEnglish.write(inEnglish.parse('Azure a ring or'))).toBe('Azure an annulet or.');
    expect(writeFrench.write(inFrench.parse("D'azur à l'annelet d'or"))).toBe(
      "D'azur à l'annelet d'or."
    );
  });

  test('answer for one another across the tongues', () => {
    const stoned = inEnglish.parse('Azure a gem-ring or stoned argent');
    expect(writeFrench.write(stoned)).toBe("D'azur à l'anneau d'or chatonné d'argent.");
    const plain = inEnglish.parse('Azure an annulet or');
    expect(writeFrench.write(plain)).toBe("D'azur à l'annelet d'or.");
  });

  test('are read of the part they already mean, the blazon adding the tincture', () => {
    expect(inEnglish.parse('Azure a gem-ring or stoned argent')).toEqual(
      inEnglish.parse('Azure a ring or stoned argent')
    );
  });

  test('name a part the charge behind them has', () => {
    // A word that meant a part its own charge has not got would be a name the
    // parser writes and then refuses.
    for (const translation of [EnglishChargeType, FrenchChargeType]) {
      for (const type of CHARGES) {
        for (const word of wordsOf(translation, type)) {
          if (word.defaultAttribute !== undefined) {
            expect(allowsAttribute(type, word.defaultAttribute)).toBe(true);
          }
        }
      }
    }
  });
});

describe('writing a charge with a part painted', () => {
  test('writes the part last, in either tongue', () => {
    const blazon = inEnglish.parse('Azure an annulet or stoned argent');
    expect(writeEnglish.write(blazon)).toBe('Azure a gem-ring or stoned argent.');
    expect(writeFrench.write(blazon)).toBe("D'azur à l'anneau d'or chatonné d'argent.");
  });

  test('agrees the French word in number too', () => {
    const blazon = inEnglish.parse('Gules three gem-rings argent stoned azure');
    expect(writeEnglish.write(blazon)).toBe('Gules three gem-rings argent stoned azure.');
    expect(writeFrench.write(blazon)).toBe("De gueules à trois anneaux d'argent chatonnés d'azur.");
  });

  test('writes nothing after a name that means the part and was told no tincture', () => {
    const blazon: Blazon = {
      field: AZURE,
      chargesOrOrdinaries: [
        {
          type: ChargeType.annulet,
          tincture: Metals.or,
          attributes: [{ attribute: Attribute.stoned }],
        },
      ],
    };
    expect(writeEnglish.write(blazon)).toBe('Azure a gem-ring or.');
    expect(writeFrench.write(blazon)).toBe("D'azur à l'anneau d'or.");
  });

  test('reads back everything it writes', () => {
    // Every part of every charge, painted in a tincture of its own — and painted
    // in none, for the parts a name says: a part with no tincture is what a name
    // that means it leaves behind, and no blazon can write one otherwise.
    for (const type of CHARGES) {
      for (const attribute of attributesOf(type)) {
        const unsaid = [EnglishChargeType, FrenchChargeType].every((translation) =>
          wordsOf(translation, type).some((word) => word.defaultAttribute === attribute)
        );
        const painted = [
          ...(unsaid ? [[{ attribute }]] : []),
          [{ attribute, tincture: Colours.gules }],
        ];
        for (const attributes of painted) {
          const blazon: Blazon = {
            field: AZURE,
            chargesOrOrdinaries: [{ type, tincture: Metals.or, attributes }],
          };
          expect(inFrench.parse(writeFrench.write(blazon))).toEqual(blazon);
          expect(inEnglish.parse(writeEnglish.write(blazon))).toEqual(blazon);
        }
      }
    }
  });

  test('writes a part no name says with the charge’s own tincture, saying as much', () => {
    // A lion is armed by the blazon and never by its name, so a lion armed of no
    // tincture at all is a model no blazon can write. Written out, it says in as
    // many words what it meant: the claws are the beast's own colour.
    expect(
      writeEnglish.write({
        field: AZURE,
        chargesOrOrdinaries: [
          {
            type: ChargeType.lion,
            tincture: Metals.or,
            attributes: [{ attribute: Attribute.armed }],
          },
        ],
      })
    ).toBe('Azure a lion or armed or.');
  });

  test('says nothing of a band, which has no part to paint', () => {
    expect(
      writeEnglish.write({
        field: AZURE,
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
      })
    ).toBe('Azure a fess or.');
  });
});

describe('drawing a part', () => {
  test('lays it over the whole charge rather than in place of it', () => {
    // The hoop is the same ring either way: what a stone adds is a shape over it.
    expect(drawn('Azure a gem-ring or stoned argent')).toContain(
      '<circle cx="100" cy="110" r="34.5" fill="none" stroke="#ffd700"'
    );
    expect(drawn('Azure an annulet or')).toContain(
      '<circle cx="100" cy="110" r="34.5" fill="none" stroke="#ffd700"'
    );
  });

  test('paints it in its own tincture, which is why an attribute carries one', () => {
    const stoned = drawn('Azure a gem-ring or stoned argent');
    expect(stoned).toContain('fill="#ffffff"');
    expect(stoned).not.toBe(drawn('Azure an annulet or'));
  });

  test('paints it in the charge’s own where the blazon named it none', () => {
    const gold = drawn('Azure a gem-ring or');
    expect(gold).not.toContain('fill="#ffffff"');
    expect(gold.match(/#ffd700/g)?.length).toBe(2);
  });

  test('draws one stone for every charge borne', () => {
    expect(drawn('Gules three gem-rings argent stoned azure').match(/<polygon/g)).toHaveLength(3);
  });

  test('leaves the plain ring alone, a charge nothing was painted on being unchanged', () => {
    expect(drawn('Azure an annulet or')).not.toContain('<polygon');
  });
});
