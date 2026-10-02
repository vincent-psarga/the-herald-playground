import { describe, expect, test } from 'vitest';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { UnknownOrdinary } from '../../domain/errors/parsing/UnknownOrdinary';
import { ChargeType } from '../../domain/models/Charge';
import { Field, FieldType, Semy, isPlain } from '../../domain/models/Field';
import { OrdinaryType } from '../../domain/models/Ordinary';
import { Colours, Furs, Metals } from '../../domain/models/Tinctures';
import { EnglishBlazonParser } from '../parser/EnglishBlazonParser';
import { EnglishBlazonWriter } from '../writer/EnglishBlazonWriter';

const parser = new EnglishBlazonParser();
/** What a field was sown with, asked of a field that can have been sown at all. */
const sowing = (field: Field): Semy | undefined => (isPlain(field) ? field.semy : undefined);

const writer = new EnglishBlazonWriter();

describe('a field sown with a charge', () => {
  test('reads "semy of" and the figure in the plural', () => {
    expect(parser.parse('Azure semy of billets or')).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Colours.azure,
        semy: { type: ChargeType.billet, tincture: Metals.or },
      },
    });
  });

  test('reads the French participle too, which English armorials write', () => {
    expect(parser.parse('Azure semé of billets or')).toEqual(
      parser.parse('Azure semy of billets or')
    );
  });

  test('reads the field’s own word for the strewing where English has one', () => {
    expect(parser.parse('Azure billetty or')).toEqual(parser.parse('Azure semy of billets or'));
  });

  test('counts nothing: a semy is sown past counting', () => {
    expect(sowing(parser.parse('Azure semy of billets or').field)).not.toHaveProperty('count');
  });

  test('sows a fur as readily as a shade', () => {
    expect(parser.parse('Azure billetty ermine').field).toMatchObject({
      semy: { type: ChargeType.billet, tincture: Furs.ermine },
    });
  });

  test('bears a band over the sown field, as any other field does', () => {
    expect(parser.parse('Azure billetty or a bordure gules')).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Colours.azure,
        semy: { type: ChargeType.billet, tincture: Metals.or },
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
    });
  });

  test('refuses a figure the vocabulary does not hold', () => {
    expect(() => parser.parse('Azure semy of castles or')).toThrow(UnknownOrdinary);
  });

  test('says nothing of a field being plain: English has no such word for one', () => {
    expect(() => parser.parse('Azure plain')).toThrow();
  });
});

describe('a strewing whose word means a tincture', () => {
  test('understands a bezanty to be gold, the word being the gold coin', () => {
    expect(parser.parse('Azure bezanty').field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Metals.or },
    });
  });

  test('refuses a bezanty of any other tincture', () => {
    expect(() => parser.parse('Azure bezanty argent')).toThrow(InvalidTincture);
  });

  test('sows the other discs in as many words, English naming no adjective for them', () => {
    expect(parser.parse('Azure semy of plates').field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Metals.argent },
    });
    expect(parser.parse('Or semy of torteaux').field).toMatchObject({
      semy: { type: ChargeType.roundel, tincture: Colours.gules },
    });
  });
});

describe('writing a sown field back', () => {
  test('names the strewing where English has a word for it', () => {
    expect(writer.write(parser.parse('Azure semy of billets or'))).toBe('Azure billetty or.');
  });

  test('sows it in as many words where English has none', () => {
    expect(writer.write(parser.parse('Azure semy of annulets or'))).toBe(
      'Azure semy of annulets or.'
    );
  });

  test('leaves the tincture off a word that already means it', () => {
    expect(writer.write(parser.parse('Azure semy of roundels or'))).toBe('Azure bezanty.');
  });

  test('falls back on the long way round rather than a word that would be wrong', () => {
    expect(writer.write(parser.parse('Azure semy of roundels argent'))).toBe(
      'Azure semy of plates.'
    );
  });

  describe('the ways a sowing is written', () => {
    // One word, spelled as the armorials spell it: all of them are read and the
    // English one is written.
    test.each(['semy', 'semé', 'semee'])('reads "%s of annulets" as the same field', (sown) => {
      expect(parser.parse(`Azure ${sown} of annulets or`).field).toEqual(
        parser.parse('Azure semy of annulets or').field
      );
    });

    test.each(['semy-de-lis', 'semy-de-lys', 'semé-de-lis', 'semy de lis'])(
      'reads "%s" as the same field',
      (sown) => {
        expect(parser.parse(`Azure ${sown} or`).field).toEqual(
          parser.parse('Azure semy-de-lis or').field
        );
      }
    );

    test('writes the one spelling back, whichever was read', () => {
      expect(writer.write(parser.parse('Azure semee of annulets or'))).toBe(
        'Azure semy of annulets or.'
      );
      expect(writer.write(parser.parse('Azure semy-de-lys or'))).toBe('Azure semy-de-lis or.');
    });
  });

  test.each([
    'Azure billetty or',
    'Azure semy of annulets or',
    'Azure semy of lozenges or',
    'Azure bezanty',
    'Azure semy of plates',
    'Or semy of torteaux',
    'Ermine billetty or',
    'Azure billetty or a bordure gules',
  ])('reads %s back into the blazon it wrote', (blazon) => {
    expect(parser.parse(writer.write(parser.parse(blazon)))).toEqual(parser.parse(blazon));
  });
});
