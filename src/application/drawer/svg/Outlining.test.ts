import { describe, expect, test } from 'vitest';
import { Blazon } from '../../../domain/models/Blazon';
import { ChargeType } from '../../../domain/models/Charge';
import { FieldType, half } from '../../../domain/models/Field';
import { OrdinaryType } from '../../../domain/models/Ordinary';
import { Colours, Metals } from '../../../domain/models/Tinctures';
import { HatchingColours } from '../../../infra/colours/HatchingColours';
import { WikipediaColours } from '../../../infra/colours/WikipediaColours';
import { SvgBlazonDrawer } from './SvgBlazonDrawer';

/**
 * A colouring that rules its tinctures needs a line round every shape, which a
 * colouring that paints in colour neither needs nor wants: vertical ruling laid
 * against vertical ruling reads as neither, where gules laid against azure reads
 * as both. The engravers drew those lines, and these are theirs.
 */
const hatched = new SvgBlazonDrawer(HatchingColours);
const coloured = new SvgBlazonDrawer(WikipediaColours);

/**
 * What is drawn inside the clipped group. The shield's own outline is drawn
 * outside it, and would otherwise count as a line round a shape.
 */
const inside = (svg: string) => {
  const from = svg.indexOf('<g clip-path');
  return svg.slice(from, svg.indexOf('</g>', from));
};

/** Every shape drawn there, in the order it is drawn. */
const shapes = (svg: string): readonly string[] =>
  Array.from(inside(svg).matchAll(/<(?:path|rect|circle|polygon)\b[^>]*>/g), ([shape]) => shape);

/** The shapes drawn in the ink the hatching rules in, which are its outlines. */
const outlines = (svg: string) =>
  shapes(svg).filter((shape) => shape.includes(`"${HatchingColours.ink}"`));

const ON_HATCHING: Blazon = {
  field: { type: FieldType.plain, tincture: Colours.gules },
  chargesOrOrdinaries: [{ type: OrdinaryType.bend, tincture: Colours.azure }],
};

describe('the outline a hatched drawing carries', () => {
  test('draws a line round a band, which its ruling alone would not show', () => {
    expect(outlines(hatched.draw(ON_HATCHING))).toHaveLength(1);
  });

  /*
   * The bug this keeps out: a line drawn along a shape's boundary rather than
   * under its fill would have been drawn over the fill of everything laid
   * before it, and a bend would have carried its own outline across the ruling
   * of the field at the wrong width.
   */
  test('lays the line under the fill it belongs to, not over it', () => {
    const drawn = shapes(hatched.draw(ON_HATCHING));
    const line = drawn.findIndex((shape) => shape.includes(`"${HatchingColours.ink}"`));
    expect(drawn[line + 1]).toContain('url(#hatch-azure)');
  });

  test('outlines each piece of a field cut over and over', () => {
    const svg = hatched.draw({
      field: {
        type: FieldType.barry,
        firstTincture: Metals.argent,
        secondTincture: Colours.azure,
        pieces: 6,
      },
    });
    expect(outlines(svg)).toHaveLength(3);
  });

  test('outlines each charge borne, however many are borne', () => {
    const svg = hatched.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: ChargeType.roundel, tincture: Metals.or, count: 3 }],
    });
    expect(outlines(svg)).toHaveLength(3);
  });

  /*
   * A cross is a pale and a fess crossing, and a line round each of them would
   * rule two straight through the middle of the charge. Laid under both fills,
   * what survives is the line round the twelve-cornered figure the two make
   * together.
   */
  test('rules no line through a charge drawn as two shapes crossing', () => {
    const svg = hatched.draw({
      field: { type: FieldType.plain, tincture: Colours.gules },
      chargesOrOrdinaries: [{ type: OrdinaryType.cross, tincture: Metals.or }],
    });
    const [field, ...borne] = shapes(svg);
    expect(field).toContain('url(#hatch-gules)');
    expect(borne.slice(0, 2).every((shape) => shape.includes(`"${HatchingColours.ink}"`))).toBe(
      true
    );
    expect(borne.slice(2)).toEqual(borne.slice(2).filter((shape) => shape.includes('hatch-or')));
    expect(borne).toHaveLength(4);
  });

  /*
   * A band is a line already and has no inside for a fill to cover an outline
   * back to, so it is drawn the wider by the outline on either side of it and
   * filled over at its own width.
   */
  test('outlines a bordure by drawing it wider, it being a line and not a shape', () => {
    const svg = hatched.draw({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.sable }],
    });
    const widths = shapes(svg)
      .map((shape) => Number(shape.match(/stroke-width="([\d.]+)"/)?.[1]))
      .filter((width) => !Number.isNaN(width));
    const [line, band] = widths;
    expect(line).toBeGreaterThan(band);
  });

  test('draws a line along the cut of a divided field', () => {
    const svg = hatched.draw({
      field: { type: FieldType.pale, parts: [half(Metals.or), half(Colours.gules)] },
    });
    expect(outlines(svg)).toHaveLength(2);
  });

  /*
   * The field alone is never outlined: it covers the frame entire, and the
   * frame's own outline is drawn round the whole drawing already.
   */
  test("leaves a plain field to the shield's own outline", () => {
    const svg = hatched.draw({ field: { type: FieldType.plain, tincture: Colours.vert } });
    expect(shapes(svg)).toHaveLength(1);
  });
});

describe('what a colouring that paints in colour draws instead', () => {
  test('draws no outline at all, its tinctures telling themselves apart', () => {
    expect(inside(coloured.draw(ON_HATCHING))).not.toContain('stroke');
  });

  test('draws one shape for each thing painted, not two', () => {
    expect(shapes(coloured.draw(ON_HATCHING))).toHaveLength(2);
  });
});
