import { describe, expect, test } from 'vitest';
import { WrongAgreement } from '../../domain/errors/parsing/WrongAgreement';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { ChargeType, allowsModifier, modifiersOf } from '../../domain/models/Charge';
import { Modifier } from '../../domain/models/Modifier';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { OrdinaryType, admitsModifier, modifiersOn } from '../../domain/models/Ordinary';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { WikipediaColours } from '../../infra/colours/WikipediaColours';
import { SvgBlazonDrawer } from '../drawer/svg/SvgBlazonDrawer';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';
import { EnglishBlazonParser } from './EnglishBlazonParser';
import { FrenchBlazonParser } from './FrenchBlazonParser';
import { FieldType } from '../../domain/models/Field';
import { Blazon } from '../../domain/models/Blazon';

const inFrench = new FrenchBlazonParser();
const inEnglish = new EnglishBlazonParser();
const writeFrench = new FrenchBlazonWriter();
const writeEnglish = new EnglishBlazonWriter();

const drawer = new SvgBlazonDrawer(WikipediaColours);

const CHARGES = Object.values(ChargeType);
const ORDINARIES = Object.values(OrdinaryType);
const MODIFIERS = Object.values(Modifier);

describe('a charge borne under a modifier', () => {
  test('is the same charge, with what was done to it beside the tincture', () => {
    expect(inEnglish.parse('Azure a lozenge voided or')).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [
        { type: ChargeType.lozenge, tincture: Metals.or, modifier: Modifier.voided },
      ],
    });
  });

  test('is read in either tongue into the one model', () => {
    expect(inFrench.parse("D'azur à la losange évidée d'or")).toEqual(
      inEnglish.parse('Azure a lozenge voided or')
    );
  });

  test('carries the modifier however many are borne', () => {
    expect(inEnglish.parse('Or three billets voided sable').chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.billet,
        tincture: Colours.sable,
        count: 3,
        modifier: Modifier.voided,
      },
    ]);
  });

  test('leaves the key off entirely where the blazon said nothing', () => {
    const [borne] = inEnglish.parse('Azure a lozenge or').chargesOrOrdinaries ?? [];
    expect(borne).not.toHaveProperty('modifier');
  });

  test('is borne beside other things, each keeping its own', () => {
    expect(
      inEnglish.parse('Azure a lozenge voided or, a billet argent').chargesOrOrdinaries
    ).toEqual([
      { type: ChargeType.lozenge, tincture: Metals.or, modifier: Modifier.voided },
      { type: ChargeType.billet, tincture: Metals.argent },
    ]);
  });
});

describe('where the word may stand', () => {
  test('stands between the charge and its tincture, which is where armorials put it', () => {
    // Parker blazons "Argent, two bars voided gules", and blason-armoiries
    // "d'azur, à l'étoile évidée d'argent": blazon takes its word order from
    // French, so what qualifies the charge follows it and the tincture is last.
    expect(inEnglish.parse('Azure a lozenge voided or').chargesOrOrdinaries?.[0]).toHaveProperty(
      'modifier',
      Modifier.voided
    );
    expect(
      inFrench.parse("D'azur à la losange évidée d'or").chargesOrOrdinaries?.[0]
    ).toHaveProperty('modifier', Modifier.voided);
  });

  test('is read after the tincture too, an armorial being free to say it late', () => {
    expect(inEnglish.parse('Azure a lozenge or voided')).toEqual(
      inEnglish.parse('Azure a lozenge voided or')
    );
    expect(inFrench.parse("D'azur à la losange d'or évidée")).toEqual(
      inFrench.parse("D'azur à la losange évidée d'or")
    );
  });

  test('is one reading and not two, where the name has already said the tincture', () => {
    // "A besant voided" writes no tincture, so the word could stand in either
    // place and be the same blazon. Where a modifier stands it is taken, which
    // leaves exactly one reading of it.
    expect(inEnglish.parse('Azure a besant voided').chargesOrOrdinaries).toEqual([
      { type: ChargeType.roundel, tincture: Metals.or, modifier: Modifier.voided },
    ]);
    expect(inFrench.parse("D'azur au besant évidé")).toEqual(
      inEnglish.parse('Azure a besant voided')
    );
  });

  test('is refused before the charge, blazon setting no adjective there', () => {
    // "A voided lozenge" is modern English describing a shield rather than
    // blazon naming one: the word stands where a charge was owed, and names none.
    expect(() => inEnglish.parse('Azure a voided lozenge or')).toThrow('Unknown ordinary: voided');
    expect(() => inFrench.parse("D'azur à l'évidée losange d'or")).toThrow(UnknownOrdinary);
  });

  test('is refused twice over, one charge having one thing said of it', () => {
    expect(() => inEnglish.parse('Azure a lozenge voided or voided')).toThrow();
  });
});

describe('what a charge will take', () => {
  test('is declared with the charge rather than with either vocabulary', () => {
    expect(modifiersOf(ChargeType.roundel)).toEqual([Modifier.voided]);
    expect(modifiersOf(ChargeType.annulet)).toEqual([]);
    expect(allowsModifier(ChargeType.roundel, Modifier.voided)).toBe(true);
  });

  test('is one list and not one modifier, a charge being able to take two', () => {
    // The three heraldry named twice over: a lozenge voided is a mascle and a
    // lozenge pierced a rustre, a mullet pierced is the molette, and a billet is
    // as ready to be pierced as to be voided.
    for (const type of [ChargeType.billet, ChargeType.lozenge, ChargeType.mullet]) {
      expect(modifiersOf(type)).toEqual([Modifier.voided, Modifier.pierced]);
    }
    // And the roundel, which heraldry named once: voided it is the annulet, and
    // pierced it would be an annulet again by another road.
    expect(allowsModifier(ChargeType.roundel, Modifier.pierced)).toBe(false);
    expect(() => inEnglish.parse('Azure a roundel pierced or')).toThrow(
      'Wrong modifier: roundel is never pierced'
    );
  });

  test('refuses a charge that is already what the modifier says', () => {
    // An annulet is a roundel voided, so voiding one again names no figure.
    expect(() => inEnglish.parse('Azure an annulet voided or')).toThrow(WrongModifier);
    expect(() => inEnglish.parse('Azure an annulet voided or')).toThrow(
      'Wrong modifier: annulet is never voided'
    );
  });

  test('refuses it by the same reckoning in either tongue', () => {
    expect(() => inFrench.parse("D'azur à l'annelet évidé d'or")).toThrow(
      'Wrong modifier: annelet is never évidé'
    );
  });

  test('refuses a band what is done to a charge, a band having no middle to take out', () => {
    expect(() => inFrench.parse("D'azur à la fasce évidée d'or")).toThrow(WrongModifier);
    expect(() => inEnglish.parse('Azure a fess voided or')).toThrow(WrongModifier);
  });

  test('refuses a charge what is done to a band, the two lists never meeting', () => {
    expect(() => inEnglish.parse('Azure a lozenge indented or')).toThrow(
      'Wrong modifier: lozenge is never indented'
    );
    expect(() => inFrench.parse("D'azur à la losange dentelée d'or")).toThrow(
      'Wrong modifier: losange is never dentelé'
    );
  });

  test.each(CHARGES)('is asked of %s before the blazon is allowed to say it', (type) => {
    // Whatever the model says each charge takes, the parser takes exactly that:
    // a charge given a modifier in the model and refused here would be a promise
    // the vocabulary could not keep.
    for (const modifier of MODIFIERS) {
      const written = writeEnglish.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
      });
      if (allowsModifier(type, modifier)) {
        expect(inEnglish.parse(written).chargesOrOrdinaries?.[0]).toHaveProperty(
          'modifier',
          modifier
        );
      } else {
        expect(() => inEnglish.parse(written)).toThrow(WrongModifier);
      }
    }
  });
});

describe('a modifier agreeing with the charge in French', () => {
  test.each([
    ["D'azur au tourteau évidé de gueules", 'the masculine article and the masculine word'],
    ["D'azur à la billette évidée d'or", 'the feminine article and the feminine word'],
    ["D'azur à la losange évidée d'or", 'a word written feminine'],
    ["D'azur au losange évidé d'or", 'the same word written masculine'],
  ])('reads %s: %s', (blazon) => {
    expect(inFrench.parse(blazon).chargesOrOrdinaries?.[0]).toHaveProperty(
      'modifier',
      Modifier.voided
    );
  });

  test.each([
    ["D'azur au tourteau évidée de gueules", 'évidé'],
    ["D'azur à la billette évidé d'or", 'évidée'],
    ["D'azur au losange évidée d'or", 'évidé'],
    ["D'azur à la losange évidé d'or", 'évidée'],
    // Said late, and agreeing no better for it.
    ["D'azur au tourteau de gueules évidée", 'évidé'],
  ])('refuses %s, which is owed "%s"', (blazon, expected) => {
    expect(() => inFrench.parse(blazon)).toThrow(WrongAgreement);
    expect(() => inFrench.parse(blazon)).toThrow(`Wrong agreement: expected "${expected}"`);
  });

  test('agrees in number as well as in gender, several being named in the plural', () => {
    expect(
      inFrench.parse("D'azur à trois billettes évidées d'or").chargesOrOrdinaries?.[0]
    ).toHaveProperty('count', 3);
    expect(() => inFrench.parse("D'azur à trois billettes évidée d'or")).toThrow(
      'Wrong agreement: expected "évidées"'
    );
    expect(() => inFrench.parse("D'azur à trois tourteaux évidées de gueules")).toThrow(
      'Wrong agreement: expected "évidés"'
    );
  });

  test('takes the gender off the word where the article never said one', () => {
    // The count has taken the article's place, so nothing in the phrase says a
    // gender and the word's own governs: a billette is feminine wherever it
    // stands.
    expect(inFrench.parse("D'azur à trois billettes évidées d'or")).toEqual(
      inEnglish.parse('Azure three billets voided or')
    );
  });

  test('agrees the same wherever the word stands', () => {
    expect(inFrench.parse("D'azur à la billette évidée d'or")).toEqual(
      inFrench.parse("D'azur à la billette d'or évidée")
    );
  });
});

describe('the two participles French voids a charge with', () => {
  test('are both read, being two words rather than two spellings of one', () => {
    expect(inFrench.parse("D'azur à la losange vidée d'or")).toEqual(
      inFrench.parse("D'azur à la losange évidée d'or")
    );
    expect(inFrench.parse("D'azur au besant vidé")).toEqual(
      inEnglish.parse('Azure a besant voided')
    );
  });

  test('each agrees on its own terms, and is asked for on its own terms', () => {
    expect(inFrench.parse("D'azur à trois billettes vidées d'or").chargesOrOrdinaries).toEqual(
      inFrench.parse("D'azur à trois billettes évidées d'or").chargesOrOrdinaries
    );
    expect(() => inFrench.parse("D'azur au losange vidée d'or")).toThrow(
      'Wrong agreement: expected "vidé"'
    );
  });

  test('come back as whichever of the two the charge is written with', () => {
    // Vidé claims no charge and is therefore the general word; évidé claims the
    // star, which the dictionaries say it of. Either is read of either charge,
    // and each charge answers in its own.
    expect(writeFrench.write(inFrench.parse("D'azur à la billette vidée d'or"))).toBe(
      "D'azur à la billette vidée d'or."
    );
    expect(writeFrench.write(inFrench.parse("D'azur à la billette évidée d'or"))).toBe(
      "D'azur à la billette vidée d'or."
    );
    expect(writeFrench.write(inFrench.parse("D'azur à l'étoile évidée d'or"))).toBe(
      "D'azur à l'étoile évidée d'or."
    );
    expect(writeFrench.write(inFrench.parse("D'azur à l'étoile vidée d'or"))).toBe(
      "D'azur à l'étoile évidée d'or."
    );
  });

  test('are refused alike by a charge that will take neither', () => {
    expect(() => inFrench.parse("D'azur à l'annelet vidé d'or")).toThrow(
      'Wrong modifier: annelet is never vidé'
    );
  });
});

describe('writing a modified charge', () => {
  test('writes it between the charge and its tincture, in either tongue', () => {
    const blazon = inEnglish.parse('Azure a billet voided or');
    expect(writeEnglish.write(blazon)).toBe('Azure a billet voided or.');
    expect(writeFrench.write(blazon)).toBe("D'azur à la billette vidée d'or.");
  });

  test('writes the settled order whichever order was read', () => {
    expect(writeEnglish.write(inEnglish.parse('Azure a billet or voided'))).toBe(
      'Azure a billet voided or.'
    );
    expect(writeFrench.write(inFrench.parse("D'azur à la billette d'or vidée"))).toBe(
      "D'azur à la billette vidée d'or."
    );
  });

  test('agrees the French word with the gender the charge is written back in', () => {
    // The billette is feminine and the besant masculine, and what is said of
    // each follows the word rather than anything the blazon supplied.
    expect(writeFrench.write(inFrench.parse("D'azur à la billette d'or vidée"))).toBe(
      "D'azur à la billette vidée d'or."
    );
    expect(writeFrench.write(inFrench.parse("D'azur au besant vidé"))).toBe(
      "D'azur au besant vidé."
    );
  });

  test('agrees it in number too', () => {
    const blazon = inEnglish.parse('Or three billets voided sable');
    expect(writeFrench.write(blazon)).toBe("D'or à trois billettes vidées de sable.");
    expect(writeEnglish.write(blazon)).toBe('Or three billets voided sable.');
  });

  test('writes it after a tincture the name had already said, where the name says one', () => {
    const blazon = inEnglish.parse('Azure a besant voided');
    expect(writeEnglish.write(blazon)).toBe('Azure a besant voided.');
    expect(writeFrench.write(blazon)).toBe("D'azur au besant vidé.");
  });

  test('reads back everything it writes', () => {
    // Every charge under every modifier it will take, so that a tongue keeping a
    // word for one charge is held to reading its own writing: the star comes
    // back évidée and is understood, as the lozenge comes back vidée.
    for (const type of CHARGES) {
      for (const modifier of modifiersOf(type)) {
        const blazon: Blazon = {
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        };
        expect(inFrench.parse(writeFrench.write(blazon))).toEqual(blazon);
        expect(inEnglish.parse(writeEnglish.write(blazon))).toEqual(blazon);
      }
    }
  });

  test('says nothing of a band the blazon said nothing of', () => {
    expect(
      writeEnglish.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
      })
    ).toBe('Azure a fess or.');
  });
});

describe('a band drawn along a modified line', () => {
  test('is the same band, with the line beside the tincture', () => {
    expect(inEnglish.parse('Azure a fess indented or')).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Metals.or, modifier: Modifier.indented },
      ],
    });
  });

  test('is read in either tongue into the one model', () => {
    expect(inFrench.parse("D'azur à la fasce dentelée d'or")).toEqual(
      inEnglish.parse('Azure a fess indented or')
    );
  });

  // The line a band is drawn along is the band's own, so however the field
  // beneath it was cut makes no difference — a quartered field least of all,
  // its line crossing itself where the band's does not.
  test.each<[string, FieldType]>([
    ['Quarterly', FieldType.cross],
    ['Per saltire', FieldType.saltire],
  ])('is borne on a field %s as readily as on a plain one', (named, type) => {
    expect(inEnglish.parse(`${named} argent and azure a fess indented gules`)).toEqual({
      field: { type, firstTincture: Metals.argent, secondTincture: Colours.azure },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.gules, modifier: Modifier.indented },
      ],
    });
  });

  test('stands where a charge’s modifier stands, and is read late as readily', () => {
    expect(inEnglish.parse('Azure a fess or indented')).toEqual(
      inEnglish.parse('Azure a fess indented or')
    );
    expect(inFrench.parse("D'azur à la fasce d'or dentelée")).toEqual(
      inFrench.parse("D'azur à la fasce dentelée d'or")
    );
  });

  test('carries the line however many bands are borne', () => {
    expect(inEnglish.parse('Or three bends indented sable').chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.bend,
        tincture: Colours.sable,
        count: 3,
        modifier: Modifier.indented,
      },
    ]);
  });

  test('leaves the key off entirely where the blazon said nothing', () => {
    const [borne] = inEnglish.parse('Azure a fess or').chargesOrOrdinaries ?? [];
    expect(borne).not.toHaveProperty('modifier');
  });

  test('agrees in French as anything said of a band agrees', () => {
    // The fasce is feminine and the chef masculine, and the participle takes the
    // gender of whichever it stands after.
    expect(inFrench.parse("D'azur au chef dentelé d'or").chargesOrOrdinaries?.[0]).toHaveProperty(
      'modifier',
      Modifier.indented
    );
    expect(() => inFrench.parse("D'azur au chef dentelée d'or")).toThrow(
      'Wrong agreement: expected "dentelé"'
    );
    expect(() => inFrench.parse("D'azur à la fasce dentelé d'or")).toThrow(
      'Wrong agreement: expected "dentelée"'
    );
    expect(() => inFrench.parse("D'azur à trois bandes dentelée d'or")).toThrow(
      'Wrong agreement: expected "dentelées"'
    );
  });

  test('is refused by a band the model gives no such line', () => {
    expect(() => inEnglish.parse('Azure a cross indented or')).toThrow(
      'Wrong modifier: cross is never indented'
    );
    expect(() => inFrench.parse("D'azur à la jumelle dentelée d'or")).toThrow(WrongModifier);
  });

  test('cuts the teeth inside a bordure, whose outer edge is the shield’s own', () => {
    // Every other band has two free edges and keeps its width between them. A
    // bordure has one: the shield's outline is not a line a blazon may modify,
    // so the band is deeper where a tooth reaches and shallower where a notch
    // does, and what is drawn is the plain band with teeth standing on it.
    const arms = (modifier?: Modifier) =>
      drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Metals.or, modifier }],
      });
    expect(arms(Modifier.indented)).not.toBe(arms());
    // The stroke that follows the shield's curve is still there, and is what
    // keeps the outer edge the outline's own.
    expect(arms(Modifier.indented)).toContain('stroke-width');
    expect(arms(Modifier.indented)).toContain('<polygon');
  });

  test.each(ORDINARIES)('is asked of %s before the blazon is allowed to say it', (type) => {
    // Whatever the model says each band takes, the parser takes exactly that: a
    // band given a line in the model and refused here would be a promise the
    // vocabulary could not keep.
    for (const modifier of MODIFIERS) {
      const written = writeEnglish.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
      });
      if (admitsModifier(type, modifier)) {
        expect(inEnglish.parse(written).chargesOrOrdinaries?.[0]).toHaveProperty(
          'modifier',
          modifier
        );
      } else {
        expect(() => inEnglish.parse(written)).toThrow(WrongModifier);
      }
    }
  });

  test('comes back in either tongue, the line written where the voiding is', () => {
    const blazon = inEnglish.parse('Azure a fess indented or');
    expect(writeEnglish.write(blazon)).toBe('Azure a fess indented or.');
    expect(writeFrench.write(blazon)).toBe("D'azur à la fasce dentelée d'or.");
    const several = inEnglish.parse('Or three bends indented sable');
    expect(writeEnglish.write(several)).toBe('Or three bends indented sable.');
    expect(writeFrench.write(several)).toBe("D'or à trois bandes dentelées de sable.");
  });

  test('reads back everything it writes, every band under every line it takes', () => {
    for (const type of ORDINARIES) {
      for (const modifier of modifiersOn(type)) {
        const blazon: Blazon = {
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        };
        expect(inFrench.parse(writeFrench.write(blazon))).toEqual(blazon);
        expect(inEnglish.parse(writeEnglish.write(blazon))).toEqual(blazon);
      }
    }
  });

  test('is drawn with teeth rather than drawn straight', () => {
    const drawn = (blazon: string) => drawer.draw(inEnglish.parse(blazon));
    for (const type of ORDINARIES.filter((type) => admitsModifier(type, Modifier.indented))) {
      const arms = (modifier?: Modifier) =>
        drawer.draw({
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        });
      expect(arms(Modifier.indented)).not.toBe(arms());
      // Teeth are corners, and a band of corners is a polygon where the plain
      // band was a rectangle or a polygon of four.
      expect(arms(Modifier.indented)).toContain('<polygon');
    }
    // The band keeps its place and its number: three indented fesses lie where
    // three plain ones lay, and there are three of them either way.
    expect(drawn('Azure three fesses indented or')).not.toBe(drawn('Azure three fesses or'));
  });

  test('draws a band the model gives no line as the plain band it is', () => {
    // Nothing can ask for this — the parser refuses the modifier first — so what
    // it guards is a drawing fallen behind the model, not a blazon.
    const drawn = (modifier?: Modifier) =>
      drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.cross, tincture: Metals.or, modifier }],
      });
    expect(drawn(Modifier.indented)).toBe(drawn());
  });
});

/** The angle, in degrees, at the point of the first tooth a band is cut with. */
function point(blazon: string): number {
  const [from, apex, to] = corners(blazon);
  const limb = ([x, y]: readonly [number, number]): readonly [number, number] => [
    x - apex[0],
    y - apex[1],
  ];
  const [fromX, fromY] = limb(from);
  const [toX, toY] = limb(to);
  const cosine = (fromX * toX + fromY * toY) / (Math.hypot(fromX, fromY) * Math.hypot(toX, toY));
  return (Math.acos(cosine) * 180) / Math.PI;
}

/** The corners of the first band an English blazon draws. */
function corners(blazon: string): readonly (readonly [number, number])[] {
  const [, points] = /<polygon points="([^"]*)"/.exec(drawer.draw(inEnglish.parse(blazon))) ?? [];
  return (points ?? '')
    .split(' ')
    .map((corner) => corner.split(',').map(Number) as [number, number]);
}

describe('the three saw-toothed lines, which differ in the teeth and in nothing else', () => {
  test('are three terms and not one term written three ways', () => {
    const line = (blazon: string) => inEnglish.parse(blazon).chargesOrOrdinaries?.[0];
    expect(line('Azure a fess indented or')).toHaveProperty('modifier', Modifier.indented);
    expect(line('Azure a fess dancetty or')).toHaveProperty('modifier', Modifier.dancetty);
    expect(line('Azure a fess vivré or')).toHaveProperty('modifier', Modifier.vivre);
  });

  test('are the same three in French, which tells them apart by the same measure', () => {
    const line = (blazon: string) => inFrench.parse(blazon).chargesOrOrdinaries?.[0];
    expect(line("D'azur à la fasce dentelée d'or")).toHaveProperty('modifier', Modifier.indented);
    expect(line("D'azur à la fasce denchée d'or")).toHaveProperty('modifier', Modifier.dancetty);
    expect(line("D'azur à la fasce vivrée d'or")).toHaveProperty('modifier', Modifier.vivre);
  });

  test('cross the tongues each into its own, denché never answering dentelé', () => {
    expect(inFrench.parse("D'azur à la fasce denchée d'or")).toEqual(
      inEnglish.parse('Azure a fess dancetty or')
    );
    expect(inFrench.parse("D'azur à la fasce denchée d'or")).not.toEqual(
      inEnglish.parse('Azure a fess indented or')
    );
  });

  // Parker's own example of the line English never named, and the arms the
  // armorial of Franche-Comté writes the same way.
  test('read the arms of LA BAUME MONTREVEL, which is what asked for the vivré', () => {
    const arms = inFrench.parse("D'or à la bande vivrée d'azur.");
    expect(arms.chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Colours.azure, modifier: Modifier.vivre },
    ]);
    expect(writeEnglish.write(arms)).toBe('Or a bend vivré azure.');
    expect(writeFrench.write(arms)).toBe("D'or à la bande vivrée d'azur.");
  });

  test('agree the two new French participles as the first one agrees', () => {
    expect(() => inFrench.parse("D'azur au chef denchée d'or")).toThrow(
      'Wrong agreement: expected "denché"'
    );
    expect(() => inFrench.parse("D'azur à la fasce vivré d'or")).toThrow(
      'Wrong agreement: expected "vivrée"'
    );
    expect(() => inFrench.parse("D'azur à trois bandes denchée d'or")).toThrow(WrongAgreement);
    expect(inFrench.parse("D'azur à trois bandes vivrées d'or").chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Metals.or, count: 3, modifier: Modifier.vivre },
    ]);
  });

  test('read dancetté, which is the accent the armorials keep on the English word', () => {
    expect(inEnglish.parse('Azure a fess dancetté or')).toEqual(
      inEnglish.parse('Azure a fess dancetty or')
    );
    // Written back under the spelling the vocabulary leads with, as every
    // alternate spelling is.
    expect(writeEnglish.write(inEnglish.parse('Azure a fess dancetté or'))).toBe(
      'Azure a fess dancetty or.'
    );
  });

  test('stand unchanged in English however many bands are borne', () => {
    expect(writeEnglish.write(inEnglish.parse('Or three bends vivré sable'))).toBe(
      'Or three bends vivré sable.'
    );
    expect(writeFrench.write(inEnglish.parse('Or three bends vivré sable'))).toBe(
      "D'or à trois bandes vivrées de sable."
    );
  });

  test('cut fewer teeth for the dancetty than for the indented, being the larger', () => {
    expect(corners('Azure a fess dancetty or').length).toBeLessThan(
      corners('Azure a fess indented or').length
    );
  });

  test('bring the vivré to a right angle, where the dancetty comes to a sharper one', () => {
    // What parts the two is the angle at the point of the tooth, so that is
    // what is measured. The vivré's is square — "the lines forming them produce
    // right angles" — and the dancetty's is the acute one Parker says the
    // armorials usually draw, which is what "more open" is said against.
    expect(point('Azure a fess vivré or')).toBeCloseTo(90, 0);
    expect(point('Azure a fess dancetty or')).toBeLessThan(90);
    expect(point('Azure a fess vivré or')).toBeGreaterThan(point('Azure a fess dancetty or'));
    // The right angle is the line's and not the fess's: it is cut the same
    // wherever it is cut, which is what makes a bend vivré read as a staircase.
    expect(point('Azure a bend vivré or')).toBeCloseTo(90, 0);
    expect(point('Azure a chevron vivré or')).toBeCloseTo(90, 0);
  });

  test('draw a different band apiece, of every band that takes them', () => {
    for (const type of ORDINARIES.filter((type) => admitsModifier(type, Modifier.vivre))) {
      const arms = (modifier?: Modifier) =>
        drawer.draw({
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        });
      const drawn = [
        arms(),
        arms(Modifier.indented),
        arms(Modifier.dancetty),
        arms(Modifier.vivre),
        arms(Modifier.engrailed),
      ];
      expect(new Set(drawn).size).toBe(drawn.length);
    }
  });
});

/**
 * The corners of one hollow of the first band an English blazon draws: from the
 * point of it, round the bite, to the next point.
 *
 * The line is walked in steps rather than cut in corners, so a hollow is the run
 * of them between one point and the next — which is what has to lie on a circle
 * for the line to be the line it says it is.
 */
function hollow(blazon: string): readonly (readonly [number, number])[] {
  const walked = corners(blazon);
  return walked.slice(POINT, POINT + 2 * POINT + 1);
}

/** How many steps of a scalloped line stand between its notch and its point. */
const POINT = 6;

/**
 * How far the corners of a hollow stray from the circle through its two ends and
 * its middle, which is nothing at all if the hollow is round.
 *
 * It is the measure the engrailed line turns on: a hollow reckoned square to the
 * line it is cut in is a circle, and the same hollow reckoned any other way is
 * that circle leaned over, which is an ellipse and not what either tongue asked
 * for.
 */
function outOfRound(walked: readonly (readonly [number, number])[]): number {
  const [centre, radius] = circleThrough(
    walked[0],
    walked[(walked.length - 1) / 2],
    walked[walked.length - 1]
  );
  return Math.max(
    ...walked.map((at) => Math.abs(Math.hypot(at[0] - centre[0], at[1] - centre[1]) - radius))
  );
}

/** The circle through three corners, as its middle and how far round it reaches. */
function circleThrough(
  [aX, aY]: readonly [number, number],
  [bX, bY]: readonly [number, number],
  [cX, cY]: readonly [number, number]
): readonly [readonly [number, number], number] {
  const twice = 2 * (aX * (bY - cY) + bX * (cY - aY) + cX * (aY - bY));
  const square = (x: number, y: number) => x * x + y * y;
  const x =
    (square(aX, aY) * (bY - cY) + square(bX, bY) * (cY - aY) + square(cX, cY) * (aY - bY)) / twice;
  const y =
    (square(aX, aY) * (cX - bX) + square(bX, bY) * (aX - cX) + square(cX, cY) * (bX - aX)) / twice;
  return [[x, y], Math.hypot(aX - x, aY - y)];
}

describe('the engrailed line, which is cut round where the three are cut straight', () => {
  test('is a term of its own, and the fourth line a band may be drawn along', () => {
    expect(inEnglish.parse('Azure a fess engrailed or')).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Metals.or, modifier: Modifier.engrailed },
      ],
    });
    expect(modifiersOn(OrdinaryType.fess)).toContain(Modifier.engrailed);
  });

  test('is read in either tongue into the one model, and written in either', () => {
    expect(inFrench.parse("D'azur à la fasce engrêlée d'or")).toEqual(
      inEnglish.parse('Azure a fess engrailed or')
    );
    const arms = inEnglish.parse('Azure a fess engrailed or');
    expect(writeEnglish.write(arms)).toBe('Azure a fess engrailed or.');
    expect(writeFrench.write(arms)).toBe("D'azur à la fasce engrêlée d'or.");
  });

  test('reads the arms the dictionary writes the word of', () => {
    // Au blason des armoiries gives these for the engrêlé, under Montigny; the
    // chequy field and the brochant are beyond this vocabulary, so what is read
    // is the band itself.
    const arms = inFrench.parse("D'argent à la bande engrêlée de gueules");
    expect(arms.chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Colours.gules, modifier: Modifier.engrailed },
    ]);
    expect(writeEnglish.write(arms)).toBe('Argent a bend engrailed gules.');
  });

  test('is borne in number, and agrees in French however many there are', () => {
    expect(inEnglish.parse('Or three bends engrailed sable').chargesOrOrdinaries).toEqual([
      {
        type: OrdinaryType.bend,
        tincture: Colours.sable,
        count: 3,
        modifier: Modifier.engrailed,
      },
    ]);
    expect(writeFrench.write(inEnglish.parse('Or three bends engrailed sable'))).toBe(
      "D'or à trois bandes engrêlées de sable."
    );
    expect(inFrench.parse("D'azur à trois bandes engrêlées d'or").chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Metals.or, count: 3, modifier: Modifier.engrailed },
    ]);
  });

  test('agrees with the band it stands after, and is refused where it does not', () => {
    // The fasce is feminine and the chef masculine, as with every participle.
    expect(inFrench.parse("D'azur au chef engrêlé d'or").chargesOrOrdinaries?.[0]).toHaveProperty(
      'modifier',
      Modifier.engrailed
    );
    expect(() => inFrench.parse("D'azur au chef engrêlée d'or")).toThrow(
      'Wrong agreement: expected "engrêlé"'
    );
    expect(() => inFrench.parse("D'azur à la fasce engrêlé d'or")).toThrow(
      'Wrong agreement: expected "engrêlée"'
    );
    expect(() => inFrench.parse("D'azur à trois bandes engrêlée d'or")).toThrow(WrongAgreement);
  });

  test('reads ingrailed, which is the other spelling Parker heads his entry with', () => {
    expect(inEnglish.parse('Azure a fess ingrailed or')).toEqual(
      inEnglish.parse('Azure a fess engrailed or')
    );
    // Written back under the spelling the vocabulary leads with, as every
    // alternate spelling is.
    expect(writeEnglish.write(inEnglish.parse('Azure a fess ingrailed or'))).toBe(
      'Azure a fess engrailed or.'
    );
  });

  test('is refused by a charge, which has no line to cut, and by a band given none', () => {
    expect(() => inEnglish.parse('Azure a lozenge engrailed or')).toThrow(
      'Wrong modifier: lozenge is never engrailed'
    );
    expect(() => inFrench.parse("D'azur à la losange engrêlée d'or")).toThrow(
      'Wrong modifier: losange is never engrêlé'
    );
    // The cross and the saltire the dictionaries do engrail — "se dit du pal, de
    // la croix, de la bande, du sautoir" — and this drawing cannot yet cut
    // either, so the word is refused rather than promised.
    expect(() => inEnglish.parse('Azure a cross engrailed or')).toThrow(
      'Wrong modifier: cross is never engrailed'
    );
    expect(() => inFrench.parse("D'azur à la jumelle engrêlée d'or")).toThrow(WrongModifier);
  });

  test('is drawn of every band the three saws are drawn of, and drawn unlike any of them', () => {
    expect(ORDINARIES.filter((type) => admitsModifier(type, Modifier.engrailed))).toEqual(
      ORDINARIES.filter((type) => admitsModifier(type, Modifier.indented))
    );
    for (const type of ORDINARIES.filter((type) => admitsModifier(type, Modifier.engrailed))) {
      const arms = (modifier?: Modifier) =>
        drawer.draw({
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        });
      expect(arms(Modifier.engrailed)).not.toBe(arms());
      expect(arms(Modifier.engrailed)).not.toBe(arms(Modifier.indented));
    }
  });

  test('cuts a hollow that is round, where the saws cut it straight', () => {
    // A hollow is an arc swung between one point of the line and the next, so
    // every corner the drawing walks it in stands on the one circle — and a run
    // of corners that stood on a straight line would have no circle through it
    // at all, which is what this measure refuses.
    expect(outOfRound(hollow('Azure a fess engrailed or'))).toBeLessThan(1 / 10);
    // A saw has nothing between its notch and its point: three corners are the
    // whole of a tooth, where a hollow is walked round. Roundness costs corners,
    // and this is where they go.
    expect(corners('Azure a fess engrailed or').length).toBeGreaterThan(
      4 * corners('Azure a fess dancetty or').length
    );
  });

  test('cuts it round on a band that runs at a slant, which asks it to lean', () => {
    // The hollow is measured square to the line it is cut in rather than the way
    // the band's own width is measured, which is what keeps it a circle and what
    // stands its points out of the band instead of straight down the field. A
    // chevron is the band that tells: its two limbs run neither flat nor
    // upright, and a hollow reckoned any other way comes out an ellipse.
    expect(outOfRound(hollow('Azure a chevron engrailed or'))).toBeLessThan(1 / 10);
    expect(outOfRound(hollow('Azure a bend engrailed or'))).toBeLessThan(1 / 10);
    expect(outOfRound(hollow('Azure a bend sinister engrailed or'))).toBeLessThan(1 / 10);
  });

  test('keeps the chevron its point, both limbs meeting where the band bends', () => {
    // Each limb is cut square to itself, so the two reach the apex along
    // different ways and would end in different places; they are brought
    // together there, and the band bends as it always did.
    const apex = corners('Azure a chevron engrailed or').filter(([x]) => Math.abs(x - 100) < 1 / 2);
    expect(apex.length).toBeGreaterThan(0);
    const plain = corners('Azure a chevron or').filter(([x]) => Math.abs(x - 100) < 1 / 2);
    // The point is where it was, give or take the half bite every cut stands
    // about the line by.
    for (const [, y] of apex) {
      expect(Math.min(...plain.map(([, was]) => Math.abs(y - was)))).toBeLessThan(10);
    }
  });

  test('stands its points about the line the plain band had, as every cut does', () => {
    // Half the bite into the field and half into the band: a fess engrailed
    // reaches above where the plain fess ended and bites below it, which is what
    // leaves the band widest at its points — "the teeth or points of which being
    // outward enter the field".
    const [, edge] = /<rect[^>]* y="([-\d.]+)"/.exec(
      drawer.draw(inEnglish.parse('Azure a fess or'))
    ) as RegExpExecArray;
    const cut = corners('Azure a fess engrailed or').map(([, y]) => y);
    expect(Math.min(...cut)).toBeLessThan(Number(edge));
    expect(Math.max(...cut.filter((y) => y < Number(edge) + 40))).toBeGreaterThan(Number(edge));
  });
});

describe('piercing a charge, which is not voiding it', () => {
  test('is a term of its own rather than a second word for the voiding', () => {
    expect(inEnglish.parse('Azure a billet pierced or').chargesOrOrdinaries).toEqual([
      { type: ChargeType.billet, tincture: Metals.or, modifier: Modifier.pierced },
    ]);
    expect(inEnglish.parse('Azure a billet pierced or')).not.toEqual(
      inEnglish.parse('Azure a billet voided or')
    );
  });

  test('is said with percé in French, which the dictionaries file under vidé', () => {
    expect(inFrench.parse("D'azur à la billette percée d'or")).toEqual(
      inEnglish.parse('Azure a billet pierced or')
    );
    // Filed together and never written for one another: a billette vidée is the
    // outline of a billette and a billette percée is a billette with a hole.
    expect(inFrench.parse("D'azur à la billette percée d'or")).not.toEqual(
      inFrench.parse("D'azur à la billette vidée d'or")
    );
  });

  test('agrees as the voiding does, being a participle like it', () => {
    expect(inFrench.parse("D'or à trois billettes percées de sable").chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.billet,
        tincture: Colours.sable,
        count: 3,
        modifier: Modifier.pierced,
      },
    ]);
    expect(() => inFrench.parse("D'or à trois billettes percée de sable")).toThrow(
      'Wrong agreement: expected "percées"'
    );
  });

  test('comes back as itself in either tongue', () => {
    const blazon = inEnglish.parse('Or three billets pierced sable');
    expect(writeEnglish.write(blazon)).toBe('Or three billets pierced sable.');
    expect(writeFrench.write(blazon)).toBe("D'or à trois billettes percées de sable.");
  });

  test('draws a hole in the charge where the voiding draws its outline', () => {
    const drawn = (blazon: string) => drawer.draw(inEnglish.parse(blazon));
    expect(drawn('Azure a billet pierced or')).not.toBe(drawn('Azure a billet voided or'));
    // The hole is round and the charge keeps its own shape around it, where the
    // voided one keeps nothing but a band along its sides.
    expect(drawn('Azure a billet pierced or')).toContain('A ');
    expect(drawn('Azure a billet pierced or')).toContain('fill-rule="evenodd"');
  });

  test('is drawn the same way of every charge that takes it, each in its own room', () => {
    // The three heraldry named: the rustre, the molette and the pierced billet.
    // Each keeps its own outline and loses a round bite of the middle, and the
    // bite is half the room that figure has — so no two are the same drawing,
    // and none of them is the voided one.
    const drawn = (blazon: string) => drawer.draw(inEnglish.parse(blazon));
    const pierced = CHARGES.filter((type) => allowsModifier(type, Modifier.pierced));
    expect(pierced).toEqual([ChargeType.billet, ChargeType.lozenge, ChargeType.mullet]);
    for (const type of pierced) {
      const written = writeEnglish.write({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier: Modifier.pierced }],
      });
      expect(drawn(written)).toContain('fill-rule="evenodd"');
      expect(drawn(written)).toContain('A ');
      expect(drawn(written)).not.toBe(
        drawn(
          writeEnglish.write({
            field: { type: FieldType.plain, tincture: Colours.azure },
            chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier: Modifier.voided }],
          })
        )
      );
    }
  });
});

describe('the names heraldry gave a modified charge', () => {
  test('are the charge and what was done to it, and not a charge of their own', () => {
    // A mascle is a lozenge voided, so it reads as one: the model holds the
    // lozenge it always held, and the name is the vocabulary's business.
    expect(inEnglish.parse('Azure a mascle or').chargesOrOrdinaries).toEqual([
      { type: ChargeType.lozenge, tincture: Metals.or, modifier: Modifier.voided },
    ]);
    expect(inEnglish.parse('Azure a mascle or')).toEqual(
      inEnglish.parse('Azure a lozenge voided or')
    );
    expect(inEnglish.parse('Azure a rustre or')).toEqual(
      inEnglish.parse('Azure a lozenge pierced or')
    );
    expect(inFrench.parse("D'azur à la molette d'or")).toEqual(
      inEnglish.parse('Azure a mullet pierced or')
    );
  });

  test('are read in either tongue, each tongue spelling its own', () => {
    expect(inFrench.parse("D'azur à la macle d'or")).toEqual(inEnglish.parse('Azure a mascle or'));
    expect(inFrench.parse("D'azur au rustre d'or")).toEqual(inEnglish.parse('Azure a rustre or'));
  });

  test('take the article their own gender asks for, which is not the charge’s', () => {
    // La macle and la molette against le rustre, the losange being feminine and
    // the word for its pierced self masculine.
    expect(() => inFrench.parse("D'azur au macle d'or")).toThrow();
    expect(() => inFrench.parse("D'azur à la rustre d'or")).toThrow();
  });

  test('are borne in number as any other name is', () => {
    expect(inEnglish.parse('Or three mascles sable').chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.lozenge,
        tincture: Colours.sable,
        count: 3,
        modifier: Modifier.voided,
      },
    ]);
    expect(inFrench.parse("D'or à trois molettes de sable")).toEqual(
      inEnglish.parse('Or three mullets pierced sable')
    );
  });

  test('say the modifier twice where a blazon writes it, and are understood', () => {
    // "A mascle voided" is "a besant or" again: the word already said it, and
    // saying it a second time changes nothing about the arms.
    expect(inEnglish.parse('Azure a mascle voided or')).toEqual(
      inEnglish.parse('Azure a mascle or')
    );
    expect(inFrench.parse("D'azur à la macle vidée d'or")).toEqual(
      inFrench.parse("D'azur à la macle d'or")
    );
  });

  test('refuse a modifier that says something else, there being no telling which was meant', () => {
    expect(() => inEnglish.parse('Azure a mascle pierced or')).toThrow(WrongModifier);
    expect(() => inEnglish.parse('Azure a mascle pierced or')).toThrow(
      'Wrong modifier: mascle is never pierced'
    );
    expect(() => inFrench.parse("D'azur à la molette vidée d'or")).toThrow(
      'Wrong modifier: molette is never vidé'
    );
  });

  test('are what a modified charge comes back as, the tincture following as ever', () => {
    const voided = inEnglish.parse('Azure a lozenge voided or');
    expect(writeEnglish.write(voided)).toBe('Azure a mascle or.');
    expect(writeFrench.write(voided)).toBe("D'azur à la macle d'or.");
    const pierced = inEnglish.parse('Or three lozenges pierced sable');
    expect(writeEnglish.write(pierced)).toBe('Or three rustres sable.');
    expect(writeFrench.write(pierced)).toBe("D'or à trois rustres de sable.");
  });

  test('leave the plain charge its plain name, a name meaning what it says', () => {
    expect(writeEnglish.write(inEnglish.parse('Azure a lozenge or'))).toBe('Azure a lozenge or.');
    expect(writeFrench.write(inFrench.parse("D'azur à l'étoile d'or"))).toBe(
      "D'azur à l'étoile d'or."
    );
  });

  test('are not invented where the tongue has none, the modifier being written instead', () => {
    // English names no pierced star — molette is French, and the English molet
    // is an old spelling of the mullet itself — so English blazons the two words
    // where French has the one.
    const blazon = inFrench.parse("D'azur à la molette d'or");
    expect(writeEnglish.write(blazon)).toBe('Azure a mullet pierced or.');
    expect(writeFrench.write(blazon)).toBe("D'azur à la molette d'or.");
    // Nor does either tongue name a voided star or a pierced billet.
    expect(writeFrench.write(inEnglish.parse('Azure a mullet voided or'))).toBe(
      "D'azur à l'étoile évidée d'or."
    );
    expect(writeFrench.write(inEnglish.parse('Azure a billet pierced or'))).toBe(
      "D'azur à la billette percée d'or."
    );
  });

  test('read back everything they write', () => {
    for (const type of CHARGES) {
      for (const modifier of modifiersOf(type)) {
        const blazon: Blazon = {
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type, tincture: Metals.or, modifier }],
        };
        expect(inFrench.parse(writeFrench.write(blazon))).toEqual(blazon);
        expect(inEnglish.parse(writeEnglish.write(blazon))).toEqual(blazon);
      }
    }
  });
});

describe('drawing a modified charge', () => {
  const drawn = (blazon: string) => drawer.draw(inEnglish.parse(blazon));

  test('draws the middle out rather than drawing the charge whole', () => {
    expect(drawn('Azure a lozenge voided or')).not.toBe(drawn('Azure a lozenge or'));
  });

  test('leaves the hole open, so that the field shows through it', () => {
    // A hole and not a second paint: nothing is painted in the middle, and the
    // even-odd rule is what opens it.
    expect(drawn('Azure a lozenge voided or')).toContain('fill-rule="evenodd"');
  });

  test('stands the modified charge where the plain one stood, and in the same number', () => {
    const plain = drawn('Or three billets sable');
    const voided = drawn('Or three billets voided sable');
    expect((plain.match(/<rect/g) ?? []).length).toBe(3);
    expect((voided.match(/fill-rule="evenodd"/g) ?? []).length).toBe(3);
  });

  test('draws a roundel voided as the annulet it is, heraldry naming the one figure twice', () => {
    expect(drawn('Azure a roundel voided or')).toBe(drawn('Azure an annulet or'));
  });

  test('takes the middle out of a star as readily as out of a lozenge', () => {
    expect(drawn('Azure a mullet voided or')).not.toBe(drawn('Azure a mullet or'));
    expect(drawn('Azure a mullet voided or')).toContain('fill-rule="evenodd"');
    // The rays survive the voiding: five points outside and five within, which
    // is what parts a voided star from a ring with a star-shaped hole.
    expect((drawn('Azure a mullet voided or').match(/ L /g) ?? []).length).toBe(18);
  });
});
