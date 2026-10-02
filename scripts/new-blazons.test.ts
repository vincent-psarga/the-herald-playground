import { describe, expect, test } from 'vitest';
import { changed, gainedIn, lostIn, namesWhatItRead, type Measured } from './new-blazons.mjs';
import type { ReadArmorial } from './armorials.mjs';
import type { Blazon } from '../src/domain/models/Blazon';
import { FieldType } from '../src/domain/models/Field';
import { Colours } from '../src/domain/models/Tinctures';

/** Something the parser read. What it read is beside the point here. */
const READ: Blazon = { field: { type: FieldType.plain, tincture: Colours.gules } };

const entry = (slug: string, read = true) => ({
  slug,
  name: slug.toUpperCase(),
  blazon: `The blazon of ${slug}.`,
  ...(read ? { read: READ } : {}),
});

const roll = (slug: string, entries: ReadArmorial['entries']): ReadArmorial => ({
  slug,
  name: `The roll of ${slug}`,
  entries,
});

describe('what a branch gained', () => {
  test('is the entries it reads that the baseline did not', () => {
    const baseline: Measured[] = [{ slug: 'r', name: 'r', readSlug: ['one'] }];
    const current = [roll('r', [entry('one'), entry('two')])];
    expect(changed(baseline, current)).toEqual([
      {
        slug: 'r',
        name: 'The roll of r',
        gained: [{ slug: 'two', name: 'TWO', blazon: 'The blazon of two.' }],
        lost: [],
      },
    ]);
  });

  test('keeps the order the roll holds them in', () => {
    const baseline: Measured[] = [{ slug: 'r', name: 'r', readSlug: [] }];
    const current = [roll('r', [entry('alpha'), entry('beta'), entry('gamma')])];
    expect(changed(baseline, current)[0]?.gained.map(({ slug }) => slug)).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  // A roll the work copied in is blazons the site reads that it did not, which
  // is the thing being reported however they came to be read.
  test('is the whole of an armorial the baseline never knew', () => {
    const current = [roll('new', [entry('one'), entry('two', false)])];
    expect(changed([], current)[0]?.gained.map(({ slug }) => slug)).toEqual(['one']);
  });

  test('says nothing of an armorial that stood still', () => {
    const baseline: Measured[] = [{ slug: 'r', name: 'r', readSlug: ['one'] }];
    expect(changed(baseline, [roll('r', [entry('one'), entry('two', false)])])).toEqual([]);
  });
});

describe('what a branch lost', () => {
  test('is the entries the baseline read and it does not', () => {
    const baseline: Measured[] = [{ slug: 'r', name: 'r', readSlug: ['one', 'two'] }];
    const current = [roll('r', [entry('one'), entry('two', false)])];
    expect(changed(baseline, current)[0]?.lost).toEqual([
      { slug: 'two', name: 'TWO', blazon: 'The blazon of two.' },
    ]);
  });

  // The roll no longer holds it, so there is no name and no blazon to report it
  // under — and a reading that quietly dropped an entry is the one worth seeing.
  test('names by slug alone an entry that has left the roll', () => {
    const baseline: Measured[] = [{ slug: 'r', name: 'r', readSlug: ['one', 'gone'] }];
    expect(changed(baseline, [roll('r', [entry('one')])])[0]?.lost).toEqual([{ slug: 'gone' }]);
  });
});

describe('counting a set of changes', () => {
  const changes = [
    { slug: 'a', name: 'a', gained: [{ slug: 'x' }, { slug: 'y' }], lost: [] },
    { slug: 'b', name: 'b', gained: [{ slug: 'z' }], lost: [{ slug: 'w' }] },
  ];

  test('adds up across the armorials', () => {
    expect(gainedIn(changes)).toBe(3);
    expect(lostIn(changes)).toBe(1);
  });

  test('is nought where nothing changed', () => {
    expect(gainedIn([])).toBe(0);
    expect(lostIn([])).toBe(0);
  });
});

/**
 * A reading taken before the entries had slugs counts them and names none.
 * Differenced against, it would call every blazon on the branch new.
 */
describe('a baseline worth differencing', () => {
  test('names what it read, armorial by armorial', () => {
    expect(namesWhatItRead([{ slug: 'r', name: 'r', readSlug: ['one'] }])).toBe(true);
  });

  test('is refused where one armorial of it cannot say', () => {
    expect(
      namesWhatItRead([
        { slug: 'r', name: 'r', readSlug: ['one'] },
        { slug: 'other', name: 'other' },
      ])
    ).toBe(false);
  });

  test('is refused where there is none at all', () => {
    expect(namesWhatItRead(undefined)).toBe(false);
  });
});
