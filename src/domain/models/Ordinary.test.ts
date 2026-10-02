import { describe, expect, test } from 'vitest';
import { LINES, Modifier } from './Modifier';
import {
  OrdinaryDefinitions,
  OrdinaryType,
  SEVERAL,
  admitsModifier,
  borne,
  modifiersOn,
} from './Ordinary';
import { Metals } from './Tinctures';

describe('an ordinary borne in number', () => {
  test.each([
    OrdinaryType.pale,
    OrdinaryType.fess,
    OrdinaryType.bend,
    OrdinaryType.bendSinister,
    OrdinaryType.chevron,
  ])('a field may bear several of %s', (type) => {
    expect(OrdinaryDefinitions[type].canBeBorneInNumbers).toBe(true);
  });

  test.each([OrdinaryType.chief, OrdinaryType.cross, OrdinaryType.saltire, OrdinaryType.bordure])(
    'a field bears but one %s',
    (type) => {
      expect(OrdinaryDefinitions[type].canBeBorneInNumbers).toBe(false);
    }
  );

  test('says of every ordinary in the vocabulary which it is', () => {
    for (const type of Object.values(OrdinaryType)) {
      expect(typeof OrdinaryDefinitions[type].canBeBorneInNumbers).toBe('boolean');
    }
  });

  test('every definition is filed under the ordinary it defines', () => {
    for (const type of Object.values(OrdinaryType)) {
      expect(OrdinaryDefinitions[type].type).toBe(type);
    }
  });
});

describe('what an ordinary may be drawn under', () => {
  test.each([
    OrdinaryType.chief,
    OrdinaryType.pale,
    OrdinaryType.fess,
    OrdinaryType.bend,
    OrdinaryType.bendSinister,
    OrdinaryType.chevron,
    OrdinaryType.bordure,
  ])('%s is drawn along every modified line', (type) => {
    expect(modifiersOn(type)).toEqual(LINES);
    for (const line of LINES) {
      expect(admitsModifier(type, line)).toBe(true);
    }
  });

  test.each([OrdinaryType.barGemel, OrdinaryType.cross, OrdinaryType.saltire])(
    '%s is drawn along the line it was always drawn along',
    (type) => {
      expect(modifiersOn(type)).toEqual([]);
      for (const line of LINES) {
        expect(admitsModifier(type, line)).toBe(false);
      }
    }
  );

  test('takes none of what is done to a charge, a band having no middle to take out', () => {
    for (const type of Object.values(OrdinaryType)) {
      expect(admitsModifier(type, Modifier.voided)).toBe(false);
      expect(admitsModifier(type, Modifier.pierced)).toBe(false);
    }
  });

  test('is declared with the ordinary rather than with either vocabulary', () => {
    expect(OrdinaryDefinitions[OrdinaryType.fess].allowedModifiers).toEqual([
      Modifier.indented,
      Modifier.dancetty,
      Modifier.vivre,
    ]);
    expect(OrdinaryDefinitions[OrdinaryType.cross].allowedModifiers).toEqual([]);
  });
});

describe('how many are borne', () => {
  test('is one where the blazon named no number', () => {
    expect(borne({ type: OrdinaryType.chevron, tincture: Metals.or })).toBe(1);
  });

  test('is what the blazon counted, where it counted', () => {
    expect(borne({ type: OrdinaryType.chevron, tincture: Metals.or, count: 3 })).toBe(3);
  });

  test('is one for an ordinary borne but once, whatever count it was handed', () => {
    expect(borne({ type: OrdinaryType.chief, tincture: Metals.or, count: 3 })).toBe(1);
  });

  test('counts several from two', () => {
    expect(SEVERAL).toBe(2);
  });
});
