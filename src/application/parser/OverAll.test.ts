import { describe, expect, test } from 'vitest';
import { Blazon, asLaid } from '../../domain/models/Blazon';
import { ChargeType } from '../../domain/models/Charge';
import { FieldType } from '../../domain/models/Field';
import { Modifier } from '../../domain/models/Modifier';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Metals } from '../../domain/models/Tinctures';
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

describe('something laid over everything else the field bears', () => {
  test('is the same band, with what the blazon said of it beside the tincture', () => {
    expect(inEnglish.parse('Argent over all a fess gules')).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.gules, overAll: true }],
    });
  });

  test('is read in either tongue into the one model', () => {
    expect(inFrench.parse("D'argent à la fasce de gueules brochant sur le tout")).toEqual(
      inEnglish.parse('Argent over all a fess gules')
    );
  });

  test('is said of a charge as readily as of a band', () => {
    // The armorials say it of both — "au lion brochant", "à la bande brochant" —
    // which is why the model carries it beside what is borne rather than on
    // either vocabulary.
    expect(inFrench.parse("D'argent à la billette de sable brochant").chargesOrOrdinaries).toEqual([
      { type: ChargeType.billet, tincture: Colours.sable, overAll: true },
    ]);
  });

  test('carries it however many are borne', () => {
    expect(
      inFrench.parse("D'argent à trois bandes de gueules brochant").chargesOrOrdinaries
    ).toEqual([{ type: OrdinaryType.bend, tincture: Colours.gules, count: 3, overAll: true }]);
  });

  test('leaves the key off entirely where the blazon said nothing', () => {
    const [borne] = inEnglish.parse('Argent a fess gules').chargesOrOrdinaries ?? [];
    expect(borne).not.toHaveProperty('overAll');
  });

  test('is said of one bearing and not of the rest', () => {
    expect(
      inFrench.parse("D'argent à la fasce de gueules brochant, à la bordure d'azur")
        .chargesOrOrdinaries
    ).toEqual([
      { type: OrdinaryType.fess, tincture: Colours.gules, overAll: true },
      { type: OrdinaryType.bordure, tincture: Colours.azure },
    ]);
  });
});

describe('where the words stand', () => {
  test('French says them after the tincture, English before the name', () => {
    // Parker writes "over all a bend gules"; Au blason des armoiries writes "à
    // trois bandes de gueules brochant". The one thing the two tongues disagree
    // about here is where in the phrase the words go.
    expect(writeEnglish.write(inEnglish.parse('Argent over all a fess gules'))).toBe(
      'Argent over all a fess gules.'
    );
    expect(writeFrench.write(inEnglish.parse('Argent over all a fess gules'))).toBe(
      "D'argent à la fasce de gueules brochant sur le tout."
    );
  });

  test('French reads the participle alone as readily as the whole phrase', () => {
    expect(inFrench.parse("D'argent à la fasce de gueules brochant")).toEqual(
      inFrench.parse("D'argent à la fasce de gueules brochant sur le tout")
    );
  });

  test('French reads the mark an armorial parts them from the phrase with', () => {
    expect(inFrench.parse("D'or au chef d'azur, brochant sur le tout")).toEqual(
      inFrench.parse("D'or au chef d'azur brochant sur le tout")
    );
  });

  test('French reads them after what was said of the charge, wherever that stood', () => {
    expect(inFrench.parse("D'azur à la losange vidée d'or brochant")).toEqual(
      inFrench.parse("D'azur à la losange d'or vidée brochant")
    );
    expect(inFrench.parse("D'azur à la losange vidée d'or brochant").chargesOrOrdinaries).toEqual([
      {
        type: ChargeType.lozenge,
        tincture: Metals.or,
        modifier: Modifier.voided,
        overAll: true,
      },
    ]);
  });

  test('English reads them before the count as before the article', () => {
    expect(inEnglish.parse('Argent over all three bends gules').chargesOrOrdinaries).toEqual([
      { type: OrdinaryType.bend, tincture: Colours.gules, count: 3, overAll: true },
    ]);
  });

  test('is refused where the other tongue would have put them', () => {
    // Neither tongue is given the other's word order: French sets no adjective
    // before what it qualifies, and English writes the words in front and
    // nowhere else.
    expect(() => inFrench.parse("D'argent brochant à la fasce de gueules")).toThrow();
    expect(() => inEnglish.parse('Argent a fess gules over all')).toThrow();
  });
});

describe('what French will not read', () => {
  test('an agreeing writing, the locution being invariable', () => {
    // "Brochant sur le tout" is invariable, and the armorials write it unchanged
    // after a plural — "à trois chevrons de gueules, brochant sur le burelé".
    // So "brochantes" is no writing of this word, and is not quietly accepted.
    expect(() => inFrench.parse("D'argent à trois bandes de gueules brochantes")).toThrow();
  });

  test('the phrase that says which one thing is covered', () => {
    // "Brochant sur le coupé" names what it covers instead of covering
    // everything, which is a second reading and is not promised here. The
    // participle is read and what follows it is left unread, so the blazon is
    // refused rather than drawn as though it had said "sur le tout".
    expect(() => inFrench.parse("D'argent à la fasce de gueules brochant sur le coupé")).toThrow();
  });
});

describe('writing it back', () => {
  test('writes the whole French phrase, whichever writing was read', () => {
    expect(writeFrench.write(inFrench.parse("D'argent à la fasce de gueules brochant"))).toBe(
      "D'argent à la fasce de gueules brochant sur le tout."
    );
  });

  test('writes it unchanged however many are borne, French agreeing with nothing', () => {
    expect(writeFrench.write(inEnglish.parse('Argent over all three bends gules'))).toBe(
      "D'argent à trois bandes de gueules brochant sur le tout."
    );
  });

  test('writes it after everything else said of the charge', () => {
    const blazon = inFrench.parse("D'azur à la losange vidée d'or brochant");
    expect(writeFrench.write(blazon)).toBe("D'azur à la macle d'or brochant sur le tout.");
    expect(writeEnglish.write(blazon)).toBe('Azure over all a mascle or.');
  });

  test('says nothing where the blazon said nothing', () => {
    expect(writeFrench.write(inFrench.parse("D'argent à la fasce de gueules"))).toBe(
      "D'argent à la fasce de gueules."
    );
    expect(writeEnglish.write(inEnglish.parse('Argent a fess gules'))).toBe('Argent a fess gules.');
  });

  test('reads back everything it writes, in either tongue', () => {
    const blazon: Blazon = {
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.gules, overAll: true },
        { type: ChargeType.billet, tincture: Colours.sable, count: 3 },
      ],
    };
    expect(inFrench.parse(writeFrench.write(blazon))).toEqual(blazon);
    expect(inEnglish.parse(writeEnglish.write(blazon))).toEqual(blazon);
  });
});

describe('what is drawn', () => {
  const laidOver = "D'argent à la fasce de gueules brochant, à trois billettes de sable";
  const named = "D'argent à la fasce de gueules, à trois billettes de sable";

  test('is laid last though it was named first', () => {
    expect(asLaid(inFrench.parse(laidOver).chargesOrOrdinaries ?? [])).toEqual([
      { type: ChargeType.billet, tincture: Colours.sable, count: 3 },
      { type: OrdinaryType.fess, tincture: Colours.gules, overAll: true },
    ]);
  });

  test('covers what the order alone would have put over it', () => {
    expect(drawer.draw(inFrench.parse(laidOver))).not.toBe(drawer.draw(inFrench.parse(named)));
    expect(drawer.draw(inFrench.parse(laidOver))).toBe(
      drawer.draw(inFrench.parse("D'argent à trois billettes de sable, à la fasce de gueules"))
    );
  });

  test('changes nothing where the order had already said it', () => {
    // Said of the thing named last, the words say what the order says anyway —
    // which is why Parker calls them understood over a particoloured field.
    expect(
      drawer.draw(
        inFrench.parse("D'argent à trois billettes de sable, à la fasce de gueules brochant")
      )
    ).toBe(
      drawer.draw(inFrench.parse("D'argent à trois billettes de sable, à la fasce de gueules"))
    );
  });

  test('keeps the order among several laid over all', () => {
    expect(
      asLaid([
        { type: OrdinaryType.fess, tincture: Colours.gules, overAll: true },
        { type: ChargeType.billet, tincture: Colours.sable },
        { type: OrdinaryType.bordure, tincture: Colours.azure, overAll: true },
      ])
    ).toEqual([
      { type: ChargeType.billet, tincture: Colours.sable },
      { type: OrdinaryType.fess, tincture: Colours.gules, overAll: true },
      { type: OrdinaryType.bordure, tincture: Colours.azure, overAll: true },
    ]);
  });
});
