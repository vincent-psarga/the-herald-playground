import { describe, expect, test } from 'vitest';
import {
  DIVISIONS,
  Division,
  FURS,
  FieldKind,
  FieldType,
  Furred,
  PIECES,
  Plain,
  VARIATIONS,
  Variation,
  VariationType,
  cutInPieces,
  half,
  isDivision,
  isFurred,
  isPlain,
  isVariation,
  kindOf,
  usualPieces,
} from './Field';
import { ChargeType } from './Charge';
import { Colours, Metals } from './Tinctures';

const PLAIN: Plain = { type: FieldType.plain, tincture: Metals.or };

const DIVIDED: Division = {
  type: FieldType.fess,
  parts: [half(Metals.or), half(Colours.azure)],
};

const VARIED: Variation = {
  type: FieldType.barry,
  firstTincture: Metals.or,
  secondTincture: Colours.azure,
  pieces: 6,
};

const FURRED: Furred = {
  type: FieldType.vairy,
  firstTincture: Metals.or,
  secondTincture: Colours.azure,
};

describe('every field term, under one kind', () => {
  test('names every term in the vocabulary, each under a single kind', () => {
    // Asked of the definitions rather than of a list kept beside them, so that
    // a term declared under no kind — or counted under two — is refused here
    // rather than quietly left out of whatever reads, writes or draws its kind.
    const named = [FieldType.plain, ...DIVISIONS, ...VARIATIONS, ...FURS];
    expect(new Set(named).size).toBe(named.length);
    expect(new Set(named)).toEqual(new Set(Object.values(FieldType)));
  });

  test.each(DIVISIONS)('%s is declared a division', (type) => {
    expect(kindOf(type)).toBe(FieldKind.division);
  });

  test.each(VARIATIONS)('%s is declared a variation', (type) => {
    expect(kindOf(type)).toBe(FieldKind.variation);
  });

  test.each(FURS)('%s is declared a furred field', (type) => {
    expect(kindOf(type)).toBe(FieldKind.furred);
  });

  test('the plain field is a term like the rest, and names no cut of the field', () => {
    expect(kindOf(FieldType.plain)).toBe(FieldKind.plain);
  });
});

describe('telling one kind of field from another', () => {
  test('a plain field is plain, and is none of divided, varied or furred', () => {
    expect(isPlain(PLAIN)).toBe(true);
    expect(isDivision(PLAIN)).toBe(false);
    expect(isVariation(PLAIN)).toBe(false);
    expect(isFurred(PLAIN)).toBe(false);
  });

  test('a divided field is divided, and is neither variation nor pelt', () => {
    expect(isDivision(DIVIDED)).toBe(true);
    expect(isVariation(DIVIDED)).toBe(false);
    expect(isFurred(DIVIDED)).toBe(false);
    expect(isPlain(DIVIDED)).toBe(false);
  });

  test('a furred field is furred, and is neither division nor variation', () => {
    // All three carry a type and two tinctures, so what tells them apart is the
    // kind their term was declared under rather than the shape of the object.
    expect(isFurred(FURRED)).toBe(true);
    expect(isDivision(FURRED)).toBe(false);
    expect(isVariation(FURRED)).toBe(false);
  });

  test('a varied field is a variation, and is neither division nor pelt', () => {
    // Both name a line and both carry two tinctures, so what tells them apart is
    // the kind their term was declared under rather than the shape of the object.
    expect(isVariation(VARIED)).toBe(true);
    expect(isDivision(VARIED)).toBe(false);
    expect(isFurred(VARIED)).toBe(false);
  });

  test.each(DIVISIONS)('%s is a division', (type) => {
    expect(isDivision({ ...DIVIDED, type })).toBe(true);
  });

  test.each(VARIATIONS)('%s is a variation', (type) => {
    expect(isVariation({ ...VARIED, type })).toBe(true);
  });

  test.each(FURS)('%s is a furred field', (type) => {
    expect(isFurred({ ...FURRED, type })).toBe(true);
  });
});

describe('the halves of a divided field', () => {
  test('a half of one tincture is a plain field bearing nothing', () => {
    expect(half(Metals.or)).toEqual({ field: { type: FieldType.plain, tincture: Metals.or } });
  });

  test('leaves the list off rather than bearing an empty one', () => {
    // Which is what keeps one half from having two ways to be written: a half
    // that bears nothing reads back as the tincture it was written as, exactly
    // as a plain field bearing nothing does.
    expect(half(Metals.or).chargesOrOrdinaries).toBeUndefined();
  });

  test('a half is arms, so it bears what a shield bears', () => {
    const charged: Division = {
      type: FieldType.pale,
      parts: [
        {
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type: ChargeType.fleurDeLis, tincture: Metals.or, count: 3 }],
        },
        half(Colours.gules),
      ],
    };
    expect(isDivision(charged)).toBe(true);
    expect(charged.parts[0].chargesOrOrdinaries).toHaveLength(1);
  });
});

describe('how many pieces a varied field is understood to have', () => {
  test.each<VariationType>([FieldType.barry, FieldType.paly, FieldType.bendy, FieldType.chevronny])(
    '%s is understood to be cut in six',
    (type) => {
      expect(usualPieces(type)).toBe(6);
    }
  );

  test('the pily is understood to be cut in no particular number', () => {
    // Neither tongue settles one, so a blazon that says nothing is refused
    // rather than guessed at.
    expect(usualPieces(FieldType.pily)).toBeUndefined();
  });

  test('says of every varied field in the vocabulary which it is', () => {
    for (const type of VARIATIONS) {
      const usual = usualPieces(type);
      expect(usual === undefined || cutInPieces(type, usual)).toBe(true);
    }
  });
});

describe('a number of pieces a field may be cut into', () => {
  test.each([2, 4, 6, 8, 10, 16])('%i pieces is a field cut evenly', (pieces) => {
    expect(cutInPieces(FieldType.barry, pieces)).toBe(true);
  });

  test.each([3, 5, 7, 9])('%i pieces is no barry: the tinctures would not alternate', (pieces) => {
    expect(cutInPieces(FieldType.barry, pieces)).toBe(false);
  });

  test.each([0, 1])('%i is no number of pieces at all', (pieces) => {
    expect(cutInPieces(FieldType.barry, pieces)).toBe(false);
    expect(cutInPieces(FieldType.pily, pieces)).toBe(false);
  });

  test.each([3, 5, 7])('the pily is counted odd as readily as even: %i', (pieces) => {
    // Its pieces interlock rather than follow one another, so a whole pile at
    // either flank leaves an odd count — Parker counts "seven traits".
    expect(cutInPieces(FieldType.pily, pieces)).toBe(true);
  });

  test('counts pieces from two, which is the fewest a field can be cut into', () => {
    expect(PIECES).toBe(2);
    expect(cutInPieces(FieldType.paly, PIECES)).toBe(true);
  });
});
