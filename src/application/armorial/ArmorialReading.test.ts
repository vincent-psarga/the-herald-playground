import { describe, expect, test } from 'vitest';
import { UnknownTincture } from '../../domain/errors/parsing/UnknownTincture';
import { Armorial } from '../../domain/models/Armorial';
import { FieldType } from '../../domain/models/Field';
import { Languages } from '../../domain/models/Languages';
import { Colours, Metals } from '../../domain/models/Tinctures';
import { FrenchBlazonParser } from '../parser/FrenchBlazonParser';
import { readArmorial } from './ArmorialReading';

const parser = new FrenchBlazonParser();

function armorial(...blazons: readonly string[]): Armorial {
  return {
    name: 'An armorial',
    slug: 'an-armorial',
    language: Languages.fr,
    licence: 'MIT',
    entries: blazons.map((blazon, index) => ({
      name: `Entry ${index}`,
      blazon,
      image: '',
    })),
  };
}

describe('reading an armorial', () => {
  test('reads the blazons it understands', () => {
    const { entries } = readArmorial(armorial('De gueules'), parser);
    expect(entries[0]?.blazon).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
    });
  });

  test('keeps an entry it cannot read, unread', () => {
    const { entries } = readArmorial(armorial('Semé de fleurs-de-lis'), parser);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.blazon).toBeUndefined();
    expect(entries[0]?.entry.name).toBe('Entry 0');
  });

  test('keeps the entries in the order the armorial gives them', () => {
    const { entries } = readArmorial(armorial("D'or", 'De sable'), parser);
    expect(entries.map(({ blazon }) => blazon)).toEqual([
      { field: { type: FieldType.plain, tincture: Metals.or } },
      { field: { type: FieldType.plain, tincture: Colours.sable } },
    ]);
  });

  test('counts what was read against what there was', () => {
    const reading = readArmorial(armorial('De gueules', 'Gironné de tout'), parser);
    expect(reading).toMatchObject({ read: 1, total: 2, score: 50 });
  });

  test.each([
    [['De gueules'], 100],
    [['Un griffon'], 0],
    [['De gueules', "D'or", 'Un griffon'], 67],
  ])('scores %s at %i%%', (blazons, score) => {
    expect(readArmorial(armorial(...blazons), parser).score).toBe(score);
  });

  test('scores an armorial with no entries at nothing, rather than not at all', () => {
    expect(readArmorial(armorial(), parser)).toMatchObject({ read: 0, total: 0, score: 0 });
  });

  test('keeps the refusal beside the entry it refused', () => {
    const { entries } = readArmorial(armorial('De fuchsia'), parser);
    expect(entries[0]?.refusal).toBeInstanceOf(UnknownTincture);
    expect((entries[0]?.refusal as UnknownTincture).tincture).toBe('fuchsia');
  });

  test('keeps no refusal beside an entry it read', () => {
    const { entries } = readArmorial(armorial('De gueules'), parser);
    expect(entries[0]?.refusal).toBeUndefined();
  });

  test('reads with the parser it is given, not with one it chooses', () => {
    const reading = readArmorial(armorial('Per pale argent and gules'), {
      parse: () => ({ field: { type: FieldType.plain, tincture: Metals.argent } }),
    });
    expect(reading.score).toBe(100);
  });
});

describe('what an armorial asks for and the parser has not got', () => {
  const unknownIn = (...blazons: readonly string[]) =>
    readArmorial(armorial(...blazons), parser).unknown;

  test('files each word under the term the parser was expecting there', () => {
    expect(unknownIn('De fuchsia', "Gironné d'azur et d'or", "D'azur à la champagne d'or")).toEqual(
      {
        tinctures: ['fuchsia'],
        divisions: ['gironné'],
        ordinaries: ['champagne'],
      }
    );
  });

  test('names a word once, however many entries stumble on it', () => {
    expect(unknownIn('De fuchsia', 'De fuchsia', "Parti de fuchsia et d'or").tinctures).toEqual([
      'fuchsia',
    ]);
  });

  test('puts the words in order, so the list does not shuffle between readings', () => {
    expect(unknownIn('De zinzolin', 'De fuchsia', 'De mauve').tinctures).toEqual([
      'fuchsia',
      'mauve',
      'zinzolin',
    ]);
  });

  test('holds nothing at all for an armorial it reads entire', () => {
    expect(unknownIn('De gueules', "Parti d'azur et d'or")).toEqual({
      tinctures: [],
      divisions: [],
      ordinaries: [],
    });
  });

  test('counts no word where none was misnamed: the blazon merely ended', () => {
    // "Missing tincture in: à la fasce" names no word, so there is none to list.
    expect(unknownIn("D'azur à la fasce", 'Coupé')).toEqual({
      tinctures: [],
      divisions: [],
      ordinaries: [],
    });
  });

  describe('a term under an article that does not agree with it', () => {
    test('is no gap in the vocabulary: the parser holds the word', () => {
      expect(unknownIn('de or').tinctures).toEqual([]);
    });

    test('is no gap for an ordinary either', () => {
      expect(unknownIn("D'azur au fasce d'or").ordinaries).toEqual([]);
    });

    test('still leaves the refusal on the entry, for whoever wants to see it', () => {
      expect(readArmorial(armorial('de or'), parser).entries[0]?.refusal).toBeDefined();
    });
  });

  test('is quiet about a parser that refuses in some way of its own', () => {
    const reading = readArmorial(armorial('De gueules'), {
      parse: () => {
        throw new Error('I simply will not');
      },
    });
    expect(reading.entries[0]?.refusal).toBeUndefined();
    expect(reading.unknown).toEqual({ tinctures: [], divisions: [], ordinaries: [] });
  });
});
