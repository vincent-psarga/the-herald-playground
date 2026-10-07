import { describe, expect, test } from 'vitest';
import { Colours, Metals, SHADES } from '../../domain/models/Tinctures';
import { isPattern } from '../../domain/services/IBlazonDrawer';
import { HatchingColours } from './HatchingColours';

const patternOf = (tincture: (typeof SHADES)[number]) => {
  const paint = HatchingColours[tincture];
  if (!isPattern(paint)) {
    throw new Error(`${tincture} is not hatched`);
  }
  return paint;
};

describe('HatchingColours', () => {
  test.each(SHADES)('paints %s', (tincture) => {
    expect(HatchingColours[tincture]).toBeDefined();
  });

  /**
   * The furs are not shades and are none of a colouring's business: an ermine
   * spot is the same spot in every armorial, so the drawer cuts it. What this
   * contributes is the ink its marks are drawn in, which the spots want solid —
   * a spot six units tall filled with hatching ten wide reads as a smudge.
   */
  test('holds no fur, but declares the ink a fur is marked with', () => {
    expect(HatchingColours).not.toHaveProperty('Furs.ermine');
    expect(HatchingColours.ink).toBe('#111111');
  });

  test('leaves argent blank, the paper standing for the metal', () => {
    expect(HatchingColours[Metals.argent]).toBe('#ffffff');
  });

  test.each(SHADES.filter((tincture) => tincture !== Metals.argent))(
    'hatches %s rather than colouring it',
    (tincture) => {
      expect(isPattern(HatchingColours[tincture])).toBe(true);
    }
  );

  test('gives every hatch its own definition, so none masks another', () => {
    const hatched = SHADES.filter((tincture) => tincture !== Metals.argent);
    const fills = hatched.map((tincture) => patternOf(tincture).fill);
    expect(new Set(fills).size).toBe(fills.length);
  });

  test('names each definition with the fill that refers to it', () => {
    for (const tincture of SHADES.filter((candidate) => candidate !== Metals.argent)) {
      const { fill, definition } = patternOf(tincture);
      const id = fill.match(/^url\(#(.+)\)$/)?.[1];
      expect(id, `${tincture} has no usable fill`).toBeDefined();
      expect(definition).toContain(`id="${id}"`);
    }
  });

  describe('the marks each tincture carries', () => {
    test('rules azure horizontally and gules vertically', () => {
      expect(patternOf(Colours.azure).definition).toContain('M0 5 H10');
      expect(patternOf(Colours.gules).definition).toContain('M5 0 V10');
    });

    test('rules sable both ways at once', () => {
      const sable = patternOf(Colours.sable).definition;
      expect(sable).toContain('M0 5 H10');
      expect(sable).toContain('M5 0 V10');
    });

    test('turns vert onto the diagonal a bend runs along', () => {
      expect(patternOf(Colours.vert).definition).toContain('rotate(45)');
    });

    test('turns purpure onto the diagonal a bend sinister runs along', () => {
      expect(patternOf(Colours.purpure).definition).toContain('rotate(-45)');
    });

    test('dots or', () => {
      expect(patternOf(Metals.or).definition).toContain('<circle');
    });
  });
});
