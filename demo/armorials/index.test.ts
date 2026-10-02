import { describe, expect, test } from 'vitest';
import { ARMORIALS } from './index';

/**
 * The armorials are copied by hand, and a slug is the one field of an entry no
 * source supplies: it is the address the entry answers to on its roll's page,
 * written out beside the name it was made from. Two entries sharing one, or one
 * carrying a character an address cannot, would be a deep link quietly leading
 * to the wrong row or to none — which nothing else here would notice.
 */
describe('every armorial', () => {
  test.each(ARMORIALS.map((armorial) => [armorial.name, armorial] as const))(
    'gives each of its entries a slug of its own: %s',
    (_name, armorial) => {
      const slugs = armorial.entries.map((entry) => entry.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  );

  test.each(ARMORIALS.map((armorial) => [armorial.name, armorial] as const))(
    'writes every slug in the shape an address carries: %s',
    (_name, armorial) => {
      const malformed = armorial.entries
        .map((entry) => entry.slug)
        .filter((slug) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug));
      expect(malformed).toEqual([]);
    }
  );
});
