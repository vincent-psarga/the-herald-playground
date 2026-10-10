import { describe, expect, test } from 'vitest';
import { ChargedPlainField } from '../../domain/errors/parsing/ChargedPlainField';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { ChargeType } from '../../domain/models/Charge';
import { Field, FieldType, Semy, half, isPlain } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Furs, Metals } from '../../domain/models/Tinctures';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { FrenchBlazonWriter } from '../writer/FrenchBlazonWriter';

const parser = new FrenchBlazonParser();
/** What a field was sown with, asked of a field that can have been sown at all. */
const sowing = (field: Field): Semy | undefined => (isPlain(field) ? field.semy : undefined);

const writer = new FrenchBlazonWriter();

describe('a field sown with a charge', () => {
  test('reads "semé de" and the figure in the plural', () => {
    expect(parser.parse("D'azur semé de billettes d'or")).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Colours.azure,
        semy: { type: ChargeType.billet, tincture: Metals.or },
      },
    });
  });

  test('elides the article before a figure that asks for it', () => {
    expect(parser.parse("D'azur semé d'annelets d'or").field).toMatchObject({
      semy: { type: ChargeType.annulet, tincture: Metals.or },
    });
  });

  test('refuses an article the figure does not elide before', () => {
    expect(() => parser.parse("D'azur semé d'billettes d'or")).toThrow(
      'Wrong elision: expected "de billettes"'
    );
  });

  test('counts nothing: a semy is sown past counting', () => {
    expect(sowing(parser.parse("D'azur semé de billettes d'or").field)).not.toHaveProperty('count');
  });

  test('reads the field’s own word for the strewing where French has one', () => {
    expect(parser.parse("D'azur billeté d'or")).toEqual(
      parser.parse("D'azur semé de billettes d'or")
    );
  });

  test('sows a fur as readily as a shade, heraldry being the blazon’s business', () => {
    expect(parser.parse("D'hermine billeté d'or").field).toMatchObject({
      tincture: Furs.ermine,
      semy: { type: ChargeType.billet, tincture: Metals.or },
    });
  });

  test('bears a band over the sown field, as any other field does', () => {
    expect(parser.parse("D'azur billeté d'or à la bordure de gueules")).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Colours.azure,
        semy: { type: ChargeType.billet, tincture: Metals.or },
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
    });
  });

  test('is case insensitive, and closes with the optional full stop', () => {
    expect(parser.parse("D'AZUR BILLETÉ D'OR.")).toEqual(parser.parse("d'azur billeté d'or"));
  });

  test('refuses a figure the vocabulary does not hold', () => {
    expect(() => parser.parse("D'azur semé de châteaux d'or")).toThrow(UnknownOrdinary);
  });

  test('refuses a tincture the vocabulary does not hold', () => {
    expect(() => parser.parse("D'azur billeté de fuchsia")).toThrow(UnknownTincture);
  });

  // A half is a field, so the sowing belongs to the half whose tincture it
  // follows — which is how the armorials write it: "Parti de gueules semé de
  // larmes d'argent, et de sinople semé de larmes d'or" sows each half with its
  // own. There is still no sowing of a divided field entire: nothing in the
  // model holds one, and nothing in either tongue says it here.
  test('sows the half whose tincture it follows, not the field entire', () => {
    expect(parser.parse("Parti d'azur et d'or semé de billettes d'argent").field).toEqual({
      type: FieldType.pale,
      parts: [
        half(Colours.azure),
        {
          field: {
            type: FieldType.plain,
            tincture: Metals.or,
            semy: { type: ChargeType.billet, tincture: Metals.argent },
          },
        },
      ],
    });
  });

  test('sows the first half where the blazon sows it there', () => {
    expect(parser.parse("Parti d'azur semé de billettes d'or et d'argent").field).toMatchObject({
      parts: [
        {
          field: { semy: { type: ChargeType.billet, tincture: Metals.or } },
        },
        { field: { tincture: Metals.argent } },
      ],
    });
  });
});

describe('a strewing whose word means a tincture', () => {
  test('understands a besanté to be gold, the word being the gold coin', () => {
    expect(parser.parse("D'azur besanté").field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Metals.or },
    });
  });

  test('takes the other metal where the blazon names it', () => {
    expect(parser.parse("D'azur besanté d'argent").field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Metals.argent },
    });
  });

  test('refuses a besanté of a colour: the word is the metal disc', () => {
    expect(() => parser.parse("D'or besanté de gueules")).toThrow(InvalidTincture);
  });

  test('owes a tourtelé its colour, the word meaning no one of them', () => {
    expect(parser.parse("D'or tourtelé de gueules").field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Colours.gules },
    });
  });

  test('refuses a tourtelé of a metal: the word is the coloured disc', () => {
    expect(() => parser.parse("D'azur tourtelé d'or")).toThrow(InvalidTincture);
  });
});

describe('writing a sown field back', () => {
  test('names the strewing where French has a word for it', () => {
    expect(writer.write(parser.parse("D'azur semé de billettes d'or"))).toBe(
      "D'azur billeté d'or."
    );
  });

  test('sows it in as many words where French has none', () => {
    expect(writer.write(parser.parse("D'azur semé d'annelets d'or"))).toBe(
      "D'azur semé d'annelets d'or."
    );
  });

  test('leaves the tincture off a word that already means it', () => {
    expect(writer.write(parser.parse("D'azur besanté d'or"))).toBe("D'azur besanté.");
  });

  test('writes the tincture where the word means no one of them', () => {
    expect(writer.write(parser.parse("D'or tourtelé de gueules"))).toBe(
      "D'or tourtelé de gueules."
    );
  });

  test.each([
    "D'azur billeté d'or",
    "D'azur semé d'annelets d'or",
    "D'azur semé de losanges d'or",
    "D'azur besanté",
    "D'azur besanté d'argent",
    "D'or tourtelé de gueules",
    "D'hermine billeté d'or",
    "D'azur billeté d'or à la bordure de gueules",
  ])('reads %s back into the blazon it wrote', (blazon) => {
    expect(parser.parse(writer.write(parser.parse(blazon)))).toEqual(parser.parse(blazon));
  });
});

describe('a field the blazon calls plain', () => {
  test('is the plain field it was, the word saying nothing the model can hold', () => {
    expect(parser.parse("D'azur plain")).toEqual({
      field: { type: FieldType.plain, tincture: Colours.azure },
    });
  });

  test('is never written back: what it said is said by there being nothing else', () => {
    expect(writer.write(parser.parse("D'azur plain"))).toBe("D'azur.");
  });

  test('refuses anything laid on it, which is the whole of what the word promises', () => {
    expect(() => parser.parse("D'azur plain au besant")).toThrow(ChargedPlainField);
    expect(() => parser.parse("D'azur plain au besant")).toThrow(
      'A plain field bears nothing: one was laid on it'
    );
  });

  test('counts what was laid on it, there being no word to name', () => {
    expect(() => parser.parse("D'azur plain au chef d'or, à la bordure de gueules")).toThrow(
      'A plain field bears nothing: 2 were laid on it'
    );
  });

  test('points at what was laid rather than at the word that forbade it', () => {
    try {
      parser.parse("D'azur plain au besant");
      expect.unreachable('the blazon should have been refused');
    } catch (cause) {
      expect((cause as ChargedPlainField).position?.column).toBe(14);
    }
  });

  test('calls a fur plain as readily: it is a tincture like any other', () => {
    expect(parser.parse("D'hermine plain")).toEqual({
      field: { type: FieldType.plain, tincture: Furs.ermine },
    });
  });

  // Said of a half rather than of the division, a half being a field like any
  // other: "Parti d'azur à six macles d'argent, et d'hermine plain" is how the
  // armorials write it, the word telling the charged half from the bare one. It
  // promises what it always promises, and the half that breaks the promise is
  // refused.
  test('is said of a half, which is a field like any other', () => {
    expect(parser.parse("Parti d'azur et d'or plain").field).toEqual({
      type: FieldType.pale,
      parts: [half(Colours.azure), half(Metals.or)],
    });
    expect(() => parser.parse("Parti de vair plain à la fasce d'or, et de gueules")).toThrow(
      ChargedPlainField
    );
  });

  test('is never both plain and sown', () => {
    expect(() => parser.parse("D'azur plain billeté d'or")).toThrow();
  });

  test('reads no "plein", which is another word about another thing', () => {
    expect(() => parser.parse("D'azur plein")).toThrow();
  });
});
