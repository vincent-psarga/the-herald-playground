import { describe, expect, test } from 'vitest';
import {
  DIVISIONS,
  DivisionType,
  FieldType,
  Furred,
  VARIATIONS,
  VariationType,
  half,
  painted,
} from '../../../domain/models/Field';
import { ChargeType } from '../../../domain/models/Charge';
import { OrdinaryType } from '../../../domain/models/Ordinary';
import { Colours, Furs, Metals, SHADES, Shade, TINCTURES } from '../../../domain/models/Tinctures';
import { ColorModel, isPattern } from '../../../domain/services/IBlazonDrawer';
import { HatchingColours } from '../../../infra/colours/HatchingColours';
import { WikipediaColours } from '../../../infra/colours/WikipediaColours';
import { FrenchBlazonParser } from '../../parser/FrenchBlazonParser';
import { SvgBlazonDrawer } from './SvgBlazonDrawer';

const drawer = new SvgBlazonDrawer(WikipediaColours);
const parser = new FrenchBlazonParser();

const fills = (svg: string) => Array.from(svg.matchAll(/fill="(#[0-9a-f]{6})"/g), (m) => m[1]);

/**
 * Every paint laid inside the shield, in the order it is laid, whether the shape
 * that carries it is filled or stroked: a bordure is drawn as a thick line
 * following the shield's own edge, and is painted no less for that. The shield's
 * outline is drawn outside the clipped group, so it is left out of the reckoning.
 */
const paints = (svg: string) => Array.from(inside(svg).matchAll(/="(#[0-9a-f]{6})"/g), (m) => m[1]);

/**
 * What is drawn inside the clipped group. The closing tag is looked for after
 * the opening one rather than from the start of the drawing, a pattern in the
 * defs being free to carry a group of its own and to close it first.
 */
const inside = (svg: string) => {
  const from = svg.indexOf('<g clip-path');
  return svg.slice(from, svg.indexOf('</g>', from));
};

/**
 * Where each figure of one paint was drawn, and how big, in the drawing's own
 * coordinates.
 *
 * A figure is written about its own origin and placed by scaling its numbers, so
 * the numbers in its path are where it ended up: every one of them is a
 * coordinate, x first and y second, over and over. What is drawn inside a part
 * of a divided field is drawn in the part's own corner and moved there by the
 * one translation, which is added back here so that every box is answered for in
 * the same coordinates.
 */
const spotted = (svg: string, tincture: Shade) => {
  const paint = WikipediaColours[tincture];
  const fill = isPattern(paint) ? paint.fill : paint;
  const moved = /<g transform="translate\((-?[\d.]+) (-?[\d.]+)\)">/.exec(inside(svg));
  const [dx, dy] = [Number(moved?.[1] ?? 0), Number(moved?.[2] ?? 0)];
  return Array.from(
    inside(svg).matchAll(new RegExp(`<path d="([^"]+)" fill="${fill}"/>`, 'g')),
    ([, path]) => {
      const numbers = Array.from(path.matchAll(/-?\d*\.?\d+/g), (found) => Number(found[0]));
      const xs = numbers.filter((_, along) => along % 2 === 0).map((x) => x + dx);
      const ys = numbers.filter((_, along) => along % 2 === 1).map((y) => y + dy);
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        size: Math.max(...xs) - Math.min(...xs),
      };
    }
  );
};

describe('SvgBlazonDrawer', () => {
  test('draws an SVG document', () => {
    const svg = drawer.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 200 240"');
  });

  test('opens and closes every tag it writes', () => {
    const svg = drawer.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    for (const tag of ['svg', 'defs', 'clipPath', 'g']) {
      expect(svg.split(`<${tag}`).length - 1).toBe(svg.split(`</${tag}>`).length - 1);
    }
  });

  const PLAIN = SHADES.filter((tincture) => !isPattern(WikipediaColours[tincture]));

  test.each(PLAIN)('paints a plain field of %s with its own colour', (tincture) => {
    expect(fills(drawer.draw({ field: { type: FieldType.plain, tincture } }))).toEqual([
      WikipediaColours[tincture],
    ]);
  });

  // A fur is no shade, so the colouring holds none: the drawer cuts the pelt
  // from the pair the fur is understood to have and carries the definition.
  test.each(Object.values(Furs))('covers a field of %s with a pelt of its own', (fur) => {
    const svg = drawer.draw({ field: { type: FieldType.plain, tincture: fur } });
    const id = svg.match(/<pattern id="([^"]+)"/)?.[1];
    expect(id).toBeDefined();
    expect(inside(svg)).toContain(`fill="url(#${id})"`);
  });

  test('clips the field to the shield and outlines it', () => {
    const svg = drawer.draw({ field: { type: FieldType.plain, tincture: Metals.argent } });
    expect(svg).toContain('clip-path="url(#blason-shield)"');
    expect(svg).toContain('stroke-width="3"');
  });

  describe('divided fields', () => {
    // The first tincture is laid before the second, and each is laid once
    // however many pieces the line left it: a quarterly field is painted in two
    // passes like any other partition, each pass covering two quarters.
    test.each(DIVISIONS)('paints both halves of a field per %s, the first first', (type) => {
      const svg = drawer.draw({
        field: { type, parts: [half(Colours.azure), half(Metals.or)] },
      });
      expect([...new Set(fills(svg))]).toEqual([
        WikipediaColours[Colours.azure],
        WikipediaColours[Metals.or],
      ]);
    });

    test('gives the first tincture the half in chief', () => {
      const perPale = drawer.draw({
        field: { type: FieldType.pale, parts: [half(Colours.gules), half(Metals.argent)] },
      });
      // Dexter is the viewer's left, so the first tincture starts at x=0. Each
      // half covers a box of the field, written as the path that also cuts off
      // whatever the half carries.
      expect(perPale).toContain(`<path d="M 0 0 H 100 V 240 H 0 Z" fill="#ff0000"/>`);
      expect(perPale).toContain(`<path d="M 100 0 H 200 V 240 H 100 Z" fill="#ffffff"/>`);
    });

    test('paints a half that carries nothing and says no more about it', () => {
      // Which is every divided field in the armorials: two shapes, no clip and
      // no group, exactly as it was drawn before a half could carry anything.
      const svg = drawer.draw({
        field: { type: FieldType.pale, parts: [half(Colours.gules), half(Metals.argent)] },
      });
      expect(svg).not.toContain('<clipPath id="blason-part');
      expect(svg).not.toContain('<g transform');
    });

    test('gives the first tincture the quarters ranked 1 and 4', () => {
      const quarterly = drawer.draw({
        field: {
          type: FieldType.cross,
          parts: painted(FieldType.cross, Colours.gules, Metals.argent),
        },
      });
      // The quarters are ranked along the chief and then along the base, from
      // dexter — the viewer's left — so the first and the fourth stand corner to
      // corner and one tincture takes both.
      expect(quarterly).toContain(`<path d="M 0 0 H 100 V 120 H 0 Z" fill="#ff0000"/>`);
      expect(quarterly).toContain(`<path d="M 100 120 H 200 V 240 H 100 Z" fill="#ff0000"/>`);
      expect(quarterly).toContain(`<path d="M 100 0 H 200 V 120 H 100 Z" fill="#ffffff"/>`);
      expect(quarterly).toContain(`<path d="M 0 120 H 100 V 240 H 0 Z" fill="#ffffff"/>`);
    });

    test('gives the first tincture the triangles in chief and in base', () => {
      const perSaltire = drawer.draw({
        field: {
          type: FieldType.saltire,
          parts: painted(FieldType.saltire, Colours.gules, Metals.argent),
        },
      });
      // Ranked in chief, at dexter, at senestre, in pointe — so the first and
      // the fourth are the two standing on the top and bottom edges, and the
      // pair between them are the flanks.
      expect(perSaltire).toContain(`<path d="M 0 0 L 200 0 L 100 120 Z" fill="#ff0000"/>`);
      expect(perSaltire).toContain(`<path d="M 0 240 L 200 240 L 100 120 Z" fill="#ff0000"/>`);
      expect(perSaltire).toContain(`<path d="M 0 0 L 0 240 L 100 120 Z" fill="#ffffff"/>`);
      expect(perSaltire).toContain(`<path d="M 200 0 L 200 240 L 100 120 Z" fill="#ffffff"/>`);
    });

    test('paints the same tincture on both sides when asked', () => {
      const svg = drawer.draw({
        field: { type: FieldType.fess, parts: [half(Colours.sable), half(Colours.sable)] },
      });
      expect(fills(svg)).toEqual(['#000000', '#000000']);
    });
  });

  describe('a part cut into pieces of its own', () => {
    const bendy = (pieces: number) => ({
      field: {
        type: FieldType.bendy as const,
        firstTincture: Metals.or,
        secondTincture: Colours.azure,
        pieces,
      },
    });

    const quartered = (pieces = 6) =>
      drawer.draw({
        field: {
          type: FieldType.cross,
          parts: [bendy(pieces), half(Colours.gules), half(Colours.gules), bendy(pieces)],
        },
      });

    // The part is painted the first tincture by the painting that covers every
    // part, and the pieces are laid over it in the second — which is how a whole
    // field cut into pieces is painted, and is why the part needs no paint of
    // its own.
    test('lays the pieces over the part, in the second tincture', () => {
      const svg = quartered();
      const laid = fills(svg);
      // Every part first, the cut ones in the first tincture of their own
      // field; then nothing but the second tincture, which is every other piece
      // of the two quarters that are cut.
      expect(laid.slice(0, 4)).toEqual([
        WikipediaColours[Metals.or],
        WikipediaColours[Colours.gules],
        WikipediaColours[Colours.gules],
        WikipediaColours[Metals.or],
      ]);
      expect(laid.length).toBeGreaterThan(4);
      expect(new Set(laid.slice(4))).toEqual(new Set([WikipediaColours[Colours.azure]]));
      expect(svg).toContain(`<clipPath id="blason-part-1">`);
      expect(svg).toContain(`<clipPath id="blason-part-4">`);
    });

    // Measured against the quarter, so the count a blazon gives is the count
    // that shows there: a bandé of eight in a quarter is eight across the
    // quarter and not eight across the shield.
    test('cuts the part into as many pieces as the blazon counted', () => {
      const pieces = (svg: string) => (svg.match(/<polygon/g) ?? []).length;
      expect(pieces(quartered(6))).toBeLessThan(pieces(quartered(10)));
    });

    test('draws nothing of the kind where no part is cut', () => {
      const svg = drawer.draw({
        field: { type: FieldType.cross, parts: painted(FieldType.cross, Metals.or, Colours.gules) },
      });
      expect(svg).not.toContain('<clipPath id="blason-part');
    });
  });

  describe('a half that carries something', () => {
    const lilies = (type: DivisionType, count = 3) =>
      drawer.draw({
        field: {
          type,
          parts: [
            {
              field: { type: FieldType.plain, tincture: Colours.azure },
              chargesOrOrdinaries: [{ type: ChargeType.fleurDeLis, tincture: Metals.or, count }],
            },
            half(Colours.gules),
          ],
        },
      });

    test('draws what the half bears, over the two halves', () => {
      const svg = lilies(FieldType.pale);
      expect(paints(svg)).toEqual([
        WikipediaColours[Colours.azure],
        WikipediaColours[Colours.gules],
        ...Array.from({ length: 3 }, () => WikipediaColours[Metals.or]),
      ]);
    });

    test('cuts off at the line whatever the half carries', () => {
      const svg = lilies(FieldType.pale);
      expect(svg).toContain('<clipPath id="blason-part-1"><path d="M 0 0 H 100 V 240 H 0 Z"/>');
      expect(svg).toContain('<g clip-path="url(#blason-part-1)">');
    });

    test('fits the figures into the half rather than into the field', () => {
      // Two abreast and one below, as three charges always stand — but reckoned
      // off the half, so they stand between the edge of the field and the line
      // and are drawn small enough to leave room for each other there.
      const spots = spotted(lilies(FieldType.pale), Metals.or);
      expect(spots).toHaveLength(3);
      for (const { x, size } of spots) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x + size).toBeLessThanOrEqual(100);
      }
      // Smaller than the same three on a whole field, the half having half the room.
      const whole = spotted(
        drawer.draw({
          field: { type: FieldType.plain, tincture: Colours.azure },
          chargesOrOrdinaries: [{ type: ChargeType.fleurDeLis, tincture: Metals.or, count: 3 }],
        }),
        Metals.or
      );
      expect(spots[0].size).toBeLessThan(whole[0].size);
    });

    test('puts the figures where the half is, and not where the other half is', () => {
      // The half at dexter keeps them left of the line; the half in chief keeps
      // them above it; and a half cut off by a diagonal keeps them in the
      // quarter its triangle holds whole.
      const dexter = spotted(lilies(FieldType.pale), Metals.or);
      expect(Math.max(...dexter.map(({ x, size }) => x + size))).toBeLessThanOrEqual(100);
      const inChief = spotted(lilies(FieldType.fess), Metals.or);
      expect(Math.max(...inChief.map(({ y, size }) => y + size))).toBeLessThanOrEqual(120);
      const beyondTheBend = spotted(lilies(FieldType.bend), Metals.or);
      expect(Math.min(...beyondTheBend.map(({ x }) => x))).toBeGreaterThanOrEqual(100);
      expect(Math.max(...beyondTheBend.map(({ y, size }) => y + size))).toBeLessThanOrEqual(120);
    });

    test('draws a band the half bears, cut off at the line', () => {
      const svg = drawer.draw({
        field: {
          type: FieldType.fess,
          parts: [
            {
              field: { type: FieldType.plain, tincture: Metals.or },
              chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.sable }],
            },
            half(Colours.gules),
          ],
        },
      });
      // Across the half it lies on, at that half's own waist and a third of its
      // depth — which is a band of a whole field's width and a half field's
      // height, drawn inside the half in chief.
      expect(svg).toContain('<rect x="0" y="40" width="200" height="40" fill="#000000"/>');
      expect(svg).toContain('<clipPath id="blason-part-1">');
    });

    test('sows a half with the lattice the whole field is sown in', () => {
      // A semy is the field's own state rather than something borne, so it is
      // laid in the field's lattice and cut off at the line: the figures run on
      // to the line and stop there, in step with whatever is sown beyond it.
      const sown = drawer.draw({
        field: {
          type: FieldType.pale,
          parts: [
            {
              field: {
                type: FieldType.plain,
                tincture: Colours.azure,
                semy: { type: ChargeType.billet, tincture: Metals.or },
              },
            },
            half(Colours.gules),
          ],
        },
      });
      const whole = drawer.draw({
        field: {
          type: FieldType.plain,
          tincture: Colours.azure,
          semy: { type: ChargeType.billet, tincture: Metals.or },
        },
      });
      const spots = (svg: string) => Array.from(svg.matchAll(/<rect x="(-?\d+)"/g), (m) => m[1]);
      expect(spots(sown)).toEqual(spots(whole));
      expect(sown).toContain('<clipPath id="blason-part-1">');
    });
  });

  describe('a half the drawing cannot yet follow', () => {
    // A band that follows its frame's own outline follows the part's box, which
    // is the field's own edge on the sides the line did not cut and is not the
    // field's edge anywhere else: a bordure borne on a half is drawn down the
    // line as well, where heraldry ends it there — "hold-overs from the days of
    // dimidiation still exist for Ordinaries like the bordure, orle and
    // tressure, which do not surround the shield but end at the line of
    // partition" — and it loses the curve of the base, which the part's box
    // knows nothing of. Held here so that it changes on purpose.
    test("follows the part's own box with a band that follows an outline", () => {
      const svg = drawer.draw({
        field: {
          type: FieldType.pale,
          parts: [
            {
              field: { type: FieldType.plain, tincture: Colours.azure },
              chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Metals.or }],
            },
            half(Colours.gules),
          ],
        },
      });
      expect(svg).toContain('<path d="M 0 0 H 100 V 240 H 0 Z" fill="none" stroke="#ffd700"');
    });

    // A half cut again is the one thing left undrawn: its second tincture is
    // nowhere and neither is the line between them, and neither tongue reads
    // such a half, so this says what the drawing does while it lags the model.
    test('paints a half that is itself cut with the tincture it is laid on', () => {
      const svg = drawer.draw({
        field: {
          type: FieldType.pale,
          parts: [
            {
              field: {
                type: FieldType.fess,
                parts: [half(Colours.azure), half(Metals.argent)],
              },
            },
            half(Colours.gules),
          ],
        },
      });
      expect(fills(svg)).toEqual([
        WikipediaColours[Colours.azure],
        WikipediaColours[Colours.gules],
      ]);
    });
  });

  describe('divided fields, hatched', () => {
    // A hatched shield rules each of its tinctures in the defs and paints out of
    // them, so a tincture missing from that list is a tincture drawn in nothing
    // at all. The halves are asked rather than the field, each half being arms
    // with a field of its own.
    test('rules both halves of a hatched field', () => {
      const svg = new SvgBlazonDrawer(HatchingColours).draw({
        field: { type: FieldType.pale, parts: [half(Colours.azure), half(Colours.vert)] },
      });
      const defs = svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));
      expect(defs).toContain('hatch-azure');
      expect(defs).toContain('hatch-vert');
    });
  });

  describe('a field bearing an ordinary', () => {
    test.each(Object.values(OrdinaryType))('lays %s over the field', (type) => {
      const svg = drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type, tincture: Metals.or }],
      });
      // The field is painted first and the ordinary over it, so the shield's own
      // colour comes before the band's in the document. A saltire contributes two
      // shapes rather than one, so what follows is counted rather than listed.
      const [field, ...borne] = paints(svg);
      expect(field).toBe(WikipediaColours[Colours.azure]);
      expect(borne.length).toBeGreaterThan(0);
      expect(borne.every((fill) => fill === WikipediaColours[Metals.or])).toBe(true);
    });

    test('draws a fess as a band across the middle of the shield', () => {
      const svg = drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
      });
      expect(svg).toContain('<rect x="0" y="80" width="200" height="80" fill="#ffd700"/>');
    });

    test('draws a saltire as two limbs crossing, painted alike', () => {
      const svg = drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.saltire, tincture: Metals.argent }],
      });
      expect(svg.split('<polygon').length - 1).toBe(2);
      expect(fills(svg).slice(1)).toEqual(['#ffffff', '#ffffff']);
    });

    test('keeps the ordinary inside the shield', () => {
      const svg = drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.azure },
        chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Metals.or }],
      });
      const arms = svg.slice(svg.indexOf('<g clip-path'), svg.indexOf('</g>'));
      expect(arms).toContain('<polygon');
    });

    test('lays an ordinary on a divided field over both halves', () => {
      const svg = drawer.draw({
        field: { type: FieldType.pale, parts: [half(Colours.azure), half(Metals.or)] },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.gules }],
      });
      expect(fills(svg)).toEqual(['#0000ff', '#ffd700', '#ff0000']);
    });

    test('paints an ordinary of the same tincture as its field', () => {
      const svg = drawer.draw({
        field: { type: FieldType.plain, tincture: Colours.sable },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.sable }],
      });
      expect(fills(svg)).toEqual(['#000000', '#000000']);
    });

    test('carries the pattern an ordinary is painted with', () => {
      const hatched = new SvgBlazonDrawer(HatchingColours);
      const svg = hatched.draw({
        field: { type: FieldType.plain, tincture: Metals.or },
        chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.azure }],
      });
      const paint = HatchingColours[Colours.azure];
      expect(isPattern(paint)).toBe(true);
      expect(svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'))).toContain('hatch-azure');
      expect(svg).toContain(isPattern(paint) ? `fill="${paint.fill}"` : '');
    });

    test('draws nothing extra when the field bears nothing', () => {
      const bare = drawer.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
      expect(bare).not.toContain('<polygon');
      expect(bare).not.toContain('<rect');
    });

    test('draws what was read from a blazon', () => {
      const svg = drawer.draw(parser.parse("D'azur à la fasce d'or"));
      expect(fills(svg)).toEqual(['#0000ff', '#ffd700']);
    });
  });

  describe('colours', () => {
    const monochrome = Object.fromEntries(
      SHADES.map((tincture) => [tincture, '#123456'])
    ) as ColorModel;

    test('prefers the colours given at the call over the ones it was built with', () => {
      const svg = drawer.draw(
        { field: { type: FieldType.plain, tincture: Colours.vert } },
        { colorModel: monochrome }
      );
      expect(fills(svg)).toEqual(['#123456']);
    });

    test('falls back to the colours it was built with', () => {
      expect(
        fills(drawer.draw({ field: { type: FieldType.plain, tincture: Colours.vert } }))
      ).toEqual(['#008000']);
    });

    test('escapes a colour that would otherwise break out of the attribute', () => {
      const hostile = { ...WikipediaColours, [Colours.vert]: '"><script/>' };
      const svg = drawer.draw(
        { field: { type: FieldType.plain, tincture: Colours.vert } },
        { colorModel: hostile }
      );
      expect(svg).not.toContain('<script/>');
      expect(svg).toContain('&quot;&gt;&lt;script/&gt;');
    });
  });

  test('draws what was read from a blazon', () => {
    const svg = drawer.draw(parser.parse("Parti d'azur et d'or"));
    expect(fills(svg)).toEqual(['#0000ff', '#ffd700']);
  });
});

describe('painting with patterns rather than colours', () => {
  const hatched = new SvgBlazonDrawer(HatchingColours);

  const defs = (svg: string) => svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));

  test('fills the field by referring to the pattern', () => {
    const svg = hatched.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    expect(svg).toContain('fill="url(#hatch-azure)"');
  });

  test('carries the definition the fill refers to', () => {
    const svg = hatched.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    expect(defs(svg)).toContain('<pattern id="hatch-azure"');
  });

  test('carries only the patterns the field is painted with', () => {
    const svg = hatched.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    expect(defs(svg)).not.toContain('hatch-gules');
    expect(defs(svg)).not.toContain('hatch-vert');
  });

  test('carries both patterns of a divided field', () => {
    const svg = hatched.draw({
      field: { type: FieldType.pale, parts: [half(Colours.azure), half(Colours.gules)] },
    });
    expect(defs(svg)).toContain('<pattern id="hatch-azure"');
    expect(defs(svg)).toContain('<pattern id="hatch-gules"');
  });

  test('carries a shared pattern once, not twice', () => {
    const svg = hatched.draw({
      field: { type: FieldType.fess, parts: [half(Colours.sable), half(Colours.sable)] },
    });
    expect(svg.split('<pattern id="hatch-sable"').length - 1).toBe(1);
  });

  test('still paints a tincture that wants a plain colour', () => {
    const svg = hatched.draw({ field: { type: FieldType.plain, tincture: Metals.argent } });
    expect(svg).toContain('fill="#ffffff"');
    expect(defs(svg)).not.toContain('<pattern');
  });

  test('needs no pattern at all for a colour model that has none', () => {
    const svg = drawer.draw({ field: { type: FieldType.plain, tincture: Colours.azure } });
    expect(defs(svg)).not.toContain('<pattern');
  });
});

describe('WikipediaColours', () => {
  test.each(SHADES)('paints %s', (tincture) => {
    const paint = WikipediaColours[tincture];
    expect(isPattern(paint) ? paint.fill : paint).toMatch(/^(#[0-9a-f]{6}|url\(#.+\))$/);
  });

  test('paints no two shades alike', () => {
    const used = SHADES.map((tincture) => {
      const paint = WikipediaColours[tincture];
      return isPattern(paint) ? paint.fill : paint;
    });
    expect(new Set(used).size).toBe(used.length);
  });

  test('draws every tincture, the furs included, though it paints only shades', () => {
    for (const tincture of TINCTURES) {
      expect(
        fills(drawer.draw({ field: { type: FieldType.plain, tincture } })).length + 1
      ).toBeGreaterThan(0);
      expect(drawer.draw({ field: { type: FieldType.plain, tincture } })).toContain('<path d=');
    }
  });
});

describe('a field bearing several of one ordinary', () => {
  const polygons = (svg: string) => svg.split('<polygon').length - 1;
  const rects = (svg: string) => svg.split('<rect').length - 1;

  test('draws as many bands as are borne, painted alike', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.chevron, tincture: Metals.or, count: 3 }],
    });
    expect(polygons(svg)).toBe(3);
    expect(fills(svg).slice(1)).toEqual(Array(3).fill(WikipediaColours[Metals.or]));
  });

  test('draws two pales as two bands, evenly spaced across the field', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.pale, tincture: Metals.or, count: 2 }],
    });
    // A fifth apiece, with a fifth of the field between them and at either edge.
    expect(svg).toContain('<rect x="40" y="0" width="40" height="240" fill="#ffd700"/>');
    expect(svg).toContain('<rect x="120" y="0" width="40" height="240" fill="#ffd700"/>');
  });

  test('narrows the bands to make room for each other', () => {
    const one = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or }],
    });
    const three = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Metals.or, count: 3 }],
    });
    const heights = (svg: string) =>
      Array.from(svg.matchAll(/<rect [^>]*height="(\d+)"/g), (match) => Number(match[1]));
    expect(heights(one)).toEqual([80]);
    expect(heights(three).every((height) => height < 80)).toBe(true);
    expect(rects(three)).toBe(3);
  });

  test('leaves a single band exactly where it was drawn before there could be two', () => {
    const counted = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.bend, tincture: Metals.or, count: 1 }],
    });
    const plain = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.bend, tincture: Metals.or }],
    });
    expect(counted).toBe(plain);
  });

  test('draws but one of an ordinary borne but once, whatever count it was handed', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.chief, tincture: Metals.or, count: 3 }],
    });
    expect(rects(svg)).toBe(1);
  });

  test('keeps every band inside the shield', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.bendSinister, tincture: Metals.or, count: 4 }],
    });
    const arms = svg.slice(svg.indexOf('<g clip-path'), svg.indexOf('</g>'));
    expect(polygons(arms)).toBe(4);
  });

  test('paints several bands with one pattern, not one apiece', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Furs.ermine, count: 3 }],
    });
    expect(svg.split('<pattern').length - 1).toBe(1);
  });
});

describe('a bar gemel', () => {
  const bars = (svg: string) =>
    Array.from(svg.matchAll(/<rect [^>]*y="(\d+)"[^>]*height="(\d+)"/g), (match) => ({
      at: Number(match[1]),
      across: Number(match[2]),
    }));

  const drawn = (count?: number) =>
    bars(
      drawer.draw({
        field: { type: FieldType.plain, tincture: Metals.argent },
        chargesOrOrdinaries: [{ type: OrdinaryType.barGemel, tincture: Colours.gules, count }],
      })
    );

  test('draws one gemel as two bars, not one band', () => {
    expect(drawn()).toHaveLength(2);
  });

  test('draws three gemels as six bars: the count counts charges, not bands', () => {
    expect(drawn(3)).toHaveLength(6);
  });

  test("spends a fess's room on the pair, and stays inside it", () => {
    const [first, second] = drawn();
    const fess = { at: 80, across: 80 };
    expect(first.at).toBe(fess.at);
    expect(second.at + second.across).toBe(fess.at + fess.across);
  });

  test('keeps the pair tighter than the field left around it', () => {
    // What makes two bars read as one charge is that the gap inside them is
    // narrower than anything separating them from the next.
    const [first, second, third] = drawn(2);
    const inside = second.at - (first.at + first.across);
    const between = third.at - (second.at + second.across);
    expect(inside).toBeLessThan(between);
  });
});

describe('a bordure', () => {
  const armsOf = (svg: string) => svg.slice(svg.indexOf('<g clip-path'), svg.indexOf('</g>'));

  const bordure = drawer.draw({
    field: { type: FieldType.plain, tincture: Metals.argent },
    chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
  });

  test("follows the shield's own edge rather than crossing the field", () => {
    // It is the shield's outline stroked thickly and clipped to itself, so it
    // keeps the curve of the base that no band of rectangles would follow.
    const band = armsOf(bordure);
    expect(band).toContain('stroke="#ff0000"');
    expect(band).not.toContain('<rect');
    expect(band).not.toContain('<polygon');
  });

  test('lies inside the shield, an eighth of the field wide', () => {
    // A stroke straddles the line it follows and the clip path takes the outer
    // half away, so the width asked for is half of what is drawn.
    expect(armsOf(bordure)).toContain('stroke-width="50"');
  });

  test('leaves the shield the parser drew it on visible around it', () => {
    expect(fills(bordure)[0]).toBe(WikipediaColours[Metals.argent]);
  });

  test('is painted with a pattern as readily as with a colour', () => {
    const hatched = new SvgBlazonDrawer(HatchingColours);
    const svg = hatched.draw({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.azure }],
    });
    const paint = HatchingColours[Colours.azure];
    expect(isPattern(paint)).toBe(true);
    expect(svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'))).toContain('hatch-azure');
    expect(armsOf(svg)).toContain(isPattern(paint) ? `stroke="${paint.fill}"` : '');
  });

  test('draws but one of it, whatever count it was handed', () => {
    const twice = drawer.draw({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules, count: 2 }],
    });
    expect(twice).toBe(bordure);
  });
});

describe('a field bearing more than one ordinary', () => {
  const ARMS = {
    field: { type: FieldType.plain, tincture: Metals.or },
    bends: { type: OrdinaryType.bend, tincture: Colours.sable, count: 3 },
    bordure: { type: OrdinaryType.bordure, tincture: Colours.gules },
  } as const;

  test('paints every one of them, each in its own tincture', () => {
    const svg = drawer.draw({ field: ARMS.field, chargesOrOrdinaries: [ARMS.bends, ARMS.bordure] });
    expect(paints(svg)).toEqual([
      WikipediaColours[Metals.or],
      ...Array(3).fill(WikipediaColours[Colours.sable]),
      WikipediaColours[Colours.gules],
    ]);
  });

  test('paints them in the order they were blazoned, the last one over the rest', () => {
    // The order is the whole of what it says: a bordure blazoned after the bends
    // covers where they run out to the edge, and blazoned before them is covered.
    const over = paints(
      drawer.draw({ field: ARMS.field, chargesOrOrdinaries: [ARMS.bends, ARMS.bordure] })
    );
    const under = paints(
      drawer.draw({ field: ARMS.field, chargesOrOrdinaries: [ARMS.bordure, ARMS.bends] })
    );
    expect(over.at(-1)).toBe(WikipediaColours[Colours.gules]);
    expect(under.at(-1)).toBe(WikipediaColours[Colours.sable]);
  });

  test('carries the patterns all of them are painted with', () => {
    const hatched = new SvgBlazonDrawer(HatchingColours);
    const svg = hatched.draw({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.azure },
        { type: OrdinaryType.bordure, tincture: Colours.gules },
      ],
    });
    const defs = svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));
    expect(defs).toContain('hatch-azure');
    expect(defs).toContain('hatch-gules');
  });

  test('draws what was read from a blazon that bears two', () => {
    const svg = drawer.draw(parser.parse("D'or à trois bandes de sable ; à la bordure de gueules"));
    expect(paints(svg)).toEqual([
      WikipediaColours[Metals.or],
      ...Array(3).fill(WikipediaColours[Colours.sable]),
      WikipediaColours[Colours.gules],
    ]);
  });
});

describe('a varied field', () => {
  const varied = (type: VariationType, pieces: number) =>
    drawer.draw({
      field: {
        type,
        firstTincture: Metals.argent,
        secondTincture: Colours.gules,
        pieces,
      },
    });

  const ARGENT = WikipediaColours[Metals.argent];
  const GULES = WikipediaColours[Colours.gules];

  test.each(VARIATIONS)('cuts a field %s into pieces of both tinctures', (type) => {
    const painted = paints(varied(type, 6));
    // The field is painted the first tincture entire and every other piece laid
    // over it in the second, so the first paint is the field's own.
    expect(painted[0]).toBe(ARGENT);
    expect(painted.slice(1)).not.toHaveLength(0);
    expect(painted.slice(1).every((paint) => paint === GULES)).toBe(true);
  });

  test.each(VARIATIONS)('lays half the pieces of %s over the other half', (type) => {
    // Six pieces are three laid over a field of three, whatever their shape.
    expect(paints(varied(type, 6))).toHaveLength(1 + 3);
    expect(paints(varied(type, 8))).toHaveLength(1 + 4);
  });

  test('draws a barry of six as six bands across, sharing the shield from head to foot', () => {
    const svg = varied(FieldType.barry, 6);
    // The shield runs from 6 to 234, not the drawing's 0 to 240, so the bands
    // are 38 apiece and the first of them begins at the top of the shield.
    expect(svg).toContain('<rect x="0" y="44" width="200" height="38"');
    expect(svg).toContain('<rect x="0" y="120" width="200" height="38"');
    expect(svg).toContain('<rect x="0" y="196" width="200" height="38"');
  });

  test('draws a paly of six as six bands down, the first at dexter', () => {
    const svg = varied(FieldType.paly, 6);
    // Dexter is the viewer's left, and the bands share the shield's own width —
    // 6 to 194 — so the second piece, which is the first one laid over, begins
    // a sixth of that in rather than a sixth of the drawing.
    expect(svg).toContain('<rect x="37" y="0" width="32" height="240"');
    expect(svg).toContain('<rect x="163" y="0" width="31" height="240"');
  });

  test('gives the sinister chief corner of a bendy to the first tincture', () => {
    // Which is where the armorials start counting: "Bandé de gueules et d'argent
    // de six pièces" puts the gules in that corner. The last piece is therefore
    // never one of those laid over, so no piece reaches the top edge's far end.
    const svg = varied(FieldType.bendy, 6);
    expect(svg).toContain('<polygon points="82,0 136,0 336,240 282,240"');
    expect(svg).not.toContain('<polygon points="136,0');
  });

  test('spreads a bendy across the shield rather than across the drawing', () => {
    // The lowest diagonal of a bendy falls where a square shield would have a
    // corner and a heater has only its point, so the pieces are measured over
    // what the shield actually reaches: six pieces, six of them drawn.
    const svg = varied(FieldType.bendy, 6);
    expect(svg).toContain('<polygon points="-131,0 -78,0 122,240 69,240"');
  });

  test('draws a pily as piles driven up between the piles from the chief', () => {
    const svg = varied(FieldType.pily, 6);
    // Three piles from the chief share the shield's width; the three laid over
    // point up where two of those meet, the last at the sinister flank.
    expect(svg).toContain('<polygon points="38,240 69,0 100,240"');
    expect(svg).toContain('<polygon points="163,240 194,0 225,240"');
  });

  test('counts a pily odd as readily as even, its piles interlocking', () => {
    expect(paints(varied(FieldType.pily, 7))).toHaveLength(1 + 3);
  });

  test('draws a chevronny of six as six chevron pieces, the first in chief', () => {
    const svg = varied(FieldType.chevronny, 6);
    // A chevron reaches a hundred below its point, so the points share the room
    // from a hundred above the head of the shield down to its foot: the second
    // piece — the first one laid over — points 39 above the top of the shield.
    expect(svg).toContain('<polygon points="0,61 100,-39 200,61');
    expect(svg).toContain('<polygon points="0,279 100,179 200,279');
  });

  test('cuts a field in two, which is the fewest it can be cut into', () => {
    expect(paints(varied(FieldType.barry, 2))).toEqual([ARGENT, GULES]);
  });

  test('carries the patterns both its tinctures are painted with', () => {
    const hatched = new SvgBlazonDrawer(HatchingColours);
    const svg = hatched.draw({
      field: {
        type: FieldType.paly,
        firstTincture: Colours.azure,
        secondTincture: Colours.gules,
        pieces: 6,
      },
    });
    const defs = svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));
    expect(defs).toContain('hatch-azure');
    expect(defs).toContain('hatch-gules');
  });

  test('lays an ordinary over the pieces', () => {
    const svg = drawer.draw({
      field: {
        type: FieldType.bendy,
        firstTincture: Metals.or,
        secondTincture: Colours.azure,
        pieces: 6,
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.gules }],
    });
    expect(paints(svg).at(-1)).toBe(WikipediaColours[Colours.gules]);
  });

  test('draws what was read from a blazon', () => {
    expect(drawer.draw(parser.parse("Fascé d'argent et de gueules"))).toBe(
      varied(FieldType.barry, 6)
    );
  });
});

describe('a furred field', () => {
  const hatched = new SvgBlazonDrawer(HatchingColours);
  const defs = (svg: string) => svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));
  const vairy: Furred = {
    type: FieldType.vairy,
    firstTincture: Metals.or,
    secondTincture: Colours.gules,
  };

  test('covers the whole shield with the fur rather than cutting it', () => {
    const svg = drawer.draw({ field: vairy });
    // One shape inside the clip, and it is the shield itself: nothing is laid
    // over anything, the pelt being the whole of the field.
    expect(inside(svg).match(/<path /g)).toHaveLength(1);
  });

  test('fills the field by referring to the fur it was cut into', () => {
    expect(drawer.draw({ field: vairy })).toContain('fill="url(#vairy-ffd700-ff0000)"');
  });

  test('carries the definition the fill refers to', () => {
    expect(defs(drawer.draw({ field: vairy }))).toContain('<pattern id="vairy-ffd700-ff0000"');
  });

  test('cuts the bells out of the two tinctures it was given', () => {
    const cut = defs(drawer.draw({ field: vairy }));
    expect(cut).toContain(`fill="${WikipediaColours[Metals.or]}"`);
    expect(cut).toContain(`fill="${WikipediaColours[Colours.gules]}"`);
  });

  test('gives the first tincture the ground the bells are laid on, which reaches the chief', () => {
    const cut = defs(drawer.draw({ field: vairy }));
    expect(cut.indexOf(`fill="${WikipediaColours[Metals.or]}"`)).toBeLessThan(
      cut.indexOf(`fill="${WikipediaColours[Colours.gules]}"`)
    );
  });

  test('cuts the bells out of whatever the colouring paints those tinctures with', () => {
    const cut = defs(hatched.draw({ field: vairy }));
    // The bells are filled with the rulings themselves, whose own definitions
    // the drawing carries for having named the two tinctures.
    expect(cut).toContain('<pattern id="hatch-or"');
    expect(cut).toContain('<pattern id="hatch-gules"');
    expect(cut).toContain('fill="url(#hatch-or)"');
    expect(cut).toContain('fill="url(#hatch-gules)"');
  });

  /**
   * Ids are shared across a whole page rather than owned by one drawing, so two
   * colourings must never name one definition alike: a shield shown in colour
   * beside the same shield hatched would otherwise take the other's.
   */
  test('names its fur differently from colouring to colouring', () => {
    const inColour = drawer.draw({ field: vairy });
    const inHatching = hatched.draw({ field: vairy });
    const idOf = (svg: string) => svg.match(/<pattern id="(vairy-[^"]+)"/)?.[1];
    expect(idOf(inColour)).toBeDefined();
    expect(idOf(inHatching)).toBeDefined();
    expect(idOf(inColour)).not.toBe(idOf(inHatching));
  });

  /**
   * A heater is inset from the edges of the drawing, so a pelt reckoned from the
   * drawing has its first figures cut through by the shield's own edge: the
   * points of the topmost bells swallowed along the chief, and the flare of
   * their bases along dexter. The tile is laid from the shield's corner instead,
   * and the two are read off one drawing so that neither may drift from the
   * other.
   */
  test('lays the bells from the corner of the shield, not the corner of the drawing', () => {
    const svg = drawer.draw({ field: vairy });
    const [, dexter, chief] = svg.match(/<path d="M(\d+) (\d+) H/) ?? [];
    expect(dexter).toBeDefined();
    expect(svg).toContain(`<pattern id="vairy-ffd700-ff0000" x="${dexter}" y="${chief}"`);
  });

  test('lays an ordinary over the pelt', () => {
    const svg = drawer.draw({
      field: vairy,
      chargesOrOrdinaries: [{ type: OrdinaryType.fess, tincture: Colours.azure }],
    });
    expect(paints(svg).at(-1)).toBe(WikipediaColours[Colours.azure]);
  });

  test('draws what was read from a blazon', () => {
    expect(drawer.draw(parser.parse("Vairé d'or et de gueules"))).toBe(
      drawer.draw({ field: vairy })
    );
  });
});

describe('a field bearing charges', () => {
  const armsOf = (type: ChargeType, count?: number) =>
    drawer.draw({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [
        count === undefined
          ? { type, tincture: Colours.gules }
          : { type, tincture: Colours.gules, count },
      ],
    });

  const shapes = (svg: string) =>
    Array.from(inside(svg).matchAll(/<(rect|polygon|circle)\b/g), (match) => match[1]);

  test.each([
    [ChargeType.annulet, 'circle'],
    [ChargeType.billet, 'rect'],
    [ChargeType.lozenge, 'polygon'],
    [ChargeType.roundel, 'circle'],
  ])('draws %s as one shape of its own tincture', (type, tag) => {
    const svg = armsOf(type);
    expect(shapes(svg)).toEqual([tag]);
    expect(paints(svg).slice(1)).toEqual([WikipediaColours[Colours.gules]]);
  });

  test('draws as many as are borne, painted alike', () => {
    const svg = armsOf(ChargeType.billet, 3);
    expect(shapes(svg)).toEqual(['rect', 'rect', 'rect']);
    expect(paints(svg).slice(1)).toEqual(Array(3).fill(WikipediaColours[Colours.gules]));
  });

  test('leaves a single charge exactly where a count of one puts it', () => {
    expect(armsOf(ChargeType.lozenge, 1)).toBe(armsOf(ChargeType.lozenge));
  });

  test('shrinks them to make room for each other', () => {
    const heights = (svg: string) =>
      Array.from(svg.matchAll(/<rect [^>]*height="(\d+)"/g), (match) => Number(match[1]));
    const [alone] = heights(armsOf(ChargeType.billet));
    const many = heights(armsOf(ChargeType.billet, 6));
    expect(many).toHaveLength(6);
    expect(many.every((height) => height < alone)).toBe(true);
    expect(new Set(many).size).toBe(1);
  });

  test('lays three out two in chief and one in base, and centres the odd one', () => {
    const rows = Array.from(
      armsOf(ChargeType.billet, 3).matchAll(/<rect x="(\d+)" y="(\d+)"/g),
      (match) => [Number(match[1]), Number(match[2])] as const
    );
    const [first, second, third] = rows;
    expect(first[1]).toBe(second[1]);
    expect(third[1]).toBeGreaterThan(first[1]);
    // The pair sits either side of the middle, and the odd one on it.
    expect(first[0] + second[0]).toBe(2 * third[0]);
  });

  /**
   * Every corner of every charge drawn, which is what decides whether the clip
   * path takes a bite out of one: a band is drawn past the edges on purpose,
   * where a charge cut off by the shield is simply drawn wrong.
   */
  const corners = (svg: string): readonly (readonly [number, number])[] => {
    const drawn = inside(svg);
    return [
      ...Array.from(drawn.matchAll(/<rect x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)"/g))
        .map(([, x, y, width, height]) => [Number(x), Number(y), Number(width), Number(height)])
        .flatMap(([x, y, width, height]) => [[x, y] as const, [x + width, y + height] as const]),
      ...Array.from(drawn.matchAll(/<polygon points="([^"]+)"/g)).flatMap(([, points]) =>
        points.split(' ').map((point) => {
          const [x, y] = point.split(',').map(Number);
          return [x, y] as const;
        })
      ),
      ...Array.from(
        drawn.matchAll(/<circle cx="(-?\d+)" cy="(-?\d+)" r="([\d.]+)"([^>]*)\/>/g)
      ).flatMap(([, cx, cy, radius, rest]) => {
        // A ring is drawn as a line and spreads half its band either side of the
        // radius; a disc is filled and stops at it.
        const band = Number(rest.match(/stroke-width="(\d+)"/)?.[1] ?? 0);
        const out = Number(radius) + band / 2;
        return [
          [Number(cx) - out, Number(cy) - out] as const,
          [Number(cx) + out, Number(cy) + out] as const,
        ];
      }),
    ];
  };

  // The shield is drawn from 6 to 194 across and from 6 to 234 down, and narrows
  // towards its point, so a charge is kept well inside those rather than merely
  // within them.
  test.each(Object.values(ChargeType))('draws %s where the shield is, at every count', (type) => {
    for (const count of [1, 2, 3, 4, 5, 6]) {
      for (const [x, y] of corners(armsOf(type, count))) {
        expect(x).toBeGreaterThanOrEqual(20);
        expect(x).toBeLessThanOrEqual(180);
        expect(y).toBeGreaterThanOrEqual(20);
        expect(y).toBeLessThanOrEqual(200);
      }
    }
  });

  test('paints a charge over a band blazoned before it', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: OrdinaryType.fess, tincture: Colours.azure },
        { type: ChargeType.billet, tincture: Colours.gules, count: 3 },
      ],
    });
    expect(paints(svg)).toEqual([
      WikipediaColours[Metals.or],
      WikipediaColours[Colours.azure],
      ...Array(3).fill(WikipediaColours[Colours.gules]),
    ]);
  });

  test('paints a band over a charge blazoned before it, the order being the whole of it', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Metals.or },
      chargesOrOrdinaries: [
        { type: ChargeType.billet, tincture: Colours.gules, count: 3 },
        { type: OrdinaryType.fess, tincture: Colours.azure },
      ],
    });
    expect(paints(svg)).toEqual([
      WikipediaColours[Metals.or],
      ...Array(3).fill(WikipediaColours[Colours.gules]),
      WikipediaColours[Colours.azure],
    ]);
  });

  test('carries the pattern a charge of a patterned tincture calls for', () => {
    const svg = drawer.draw({
      field: { type: FieldType.plain, tincture: Colours.azure },
      chargesOrOrdinaries: [{ type: ChargeType.lozenge, tincture: Furs.ermine }],
    });
    const id = svg.match(/<pattern id="(ermine-[^"]+)"/)?.[1];
    expect(id).toBeDefined();
    expect(svg).toContain(`<polygon points="100,66 133,110 100,154 67,110" fill="url(#${id})"/>`);
  });

  test('draws a roundel as a plain disc, filled rather than drawn as a line', () => {
    const drawn = inside(armsOf(ChargeType.roundel));
    expect(drawn).toContain(`fill="${WikipediaColours[Colours.gules]}"`);
    expect(drawn).not.toContain('stroke-width');
  });

  test('draws the same disc whatever name the blazon gave it', () => {
    const besant = drawer.draw(parser.parse("D'argent au besant"));
    const tourteau = drawer.draw(parser.parse("D'argent au tourteau de gueules"));
    const discs = (svg: string) => inside(svg).replace(/fill="#[0-9a-f]{6}"/g, 'fill');
    expect(discs(besant)).toBe(discs(tourteau));
  });

  test('draws what the parser read, in either tongue', () => {
    expect(drawer.draw(parser.parse("D'argent à trois billettes de gueules"))).toBe(
      armsOf(ChargeType.billet, 3)
    );
    expect(drawer.draw(parser.parse("D'argent au tourteau de gueules"))).toBe(
      armsOf(ChargeType.roundel)
    );
  });
});
