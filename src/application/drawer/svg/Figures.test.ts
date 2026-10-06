import { describe, expect, test } from 'vitest';
import { ChargeType } from '../../../domain/models/Charge';
import { Colours, Metals } from '../../../domain/models/Tinctures';
import { HatchingColours } from '../../../infra/colours/HatchingColours';
import { WikipediaColours } from '../../../infra/colours/WikipediaColours';
import { SvgBlazonDrawer } from './SvgBlazonDrawer';
import { placed } from './shapes/path';
import { CHARGES } from './vocabulary/charges';
import { DIVISIONS as DIVISIONS_DRAWN } from './vocabulary/coverings/divisions';
import { SHIELD_FRAME } from './shapes/shield';
import { DIVISIONS, FieldType, dividedInto } from '../../../domain/models/Field';
import { Blazon } from '../../../domain/models/Blazon';

const drawer = new SvgBlazonDrawer(WikipediaColours);
const hatched = new SvgBlazonDrawer(HatchingColours);

const borne = (type: ChargeType): Blazon => ({
  field: { type: FieldType.plain, tincture: Colours.azure },
  chargesOrOrdinaries: [{ type, tincture: Metals.or }],
});

/** What is drawn inside the clipped group, the outline being drawn outside it. */
const inside = (svg: string) => {
  const from = svg.indexOf('<g clip-path');
  return svg.slice(from, svg.lastIndexOf('</g>'));
};

describe('a figure written about its own origin', () => {
  const UNIT = 'M-0.5 -0.5 L0.5 -0.5 L0.5 0.5 Z';

  test('is put where it belongs and drawn the size it was asked for', () => {
    expect(placed(UNIT, 100, 50, 10)({ fill: '#fff' })).toBe(
      '<path d="M95 45 L105 45 L105 55 Z" fill="#fff"/>'
    );
  });

  /*
   * The bug this keeps out: placed by a transform instead, the scale would carry
   * into whatever fills the figure, and a hatched charge would be drawn with its
   * ruling blown up until the whole of it was one stripe — which showed as a
   * charge that was simply not there.
   */
  test('is not placed by a transform, which would scale its filling with it', () => {
    expect(placed(UNIT, 100, 50, 10)({ fill: '#fff' })).not.toContain('scale');
  });

  test('leaves what fills it alone, so a pattern keeps the size it was defined at', () => {
    const svg = hatched.draw(borne(ChargeType.fleurDeLis));
    const ruling = HatchingColours[Metals.or];
    expect(typeof ruling).not.toBe('string');
    expect(inside(svg)).toContain((ruling as { fill: string }).fill);
    expect(inside(svg)).not.toContain('scale');
  });
});

describe('the figures each new charge is drawn as', () => {
  test('draws a goutte as a shape of its own rather than as a disc or a box', () => {
    const svg = inside(drawer.draw(borne(ChargeType.goutte)));
    expect(svg).toContain('<path');
    expect(svg).not.toContain('<circle');
    expect(svg).not.toContain('<rect');
  });

  test('draws a mullet as a polygon of ten corners: five rays and the angles between', () => {
    const svg = inside(drawer.draw(borne(ChargeType.mullet)));
    const points = svg.match(/points="([^"]+)"/)?.[1] ?? '';
    expect(points.trim().split(/\s+/)).toHaveLength(10);
  });

  test('stands the mullet on a ray rather than on a flat', () => {
    const svg = inside(drawer.draw(borne(ChargeType.mullet)));
    const [first] = (svg.match(/points="([^"]+)"/)?.[1] ?? '').trim().split(/\s+/);
    const [x] = first.split(',').map(Number);
    expect(x).toBe(SHIELD_FRAME.width / 2);
  });

  test('draws a fleur-de-lis in one path, so one tincture fills the whole of it', () => {
    const svg = inside(drawer.draw(borne(ChargeType.fleurDeLis)));
    expect(svg.match(/<path/g) ?? []).toHaveLength(2);
  });

  test.each([ChargeType.goutte, ChargeType.larme, ChargeType.mullet, ChargeType.fleurDeLis])(
    'sows %s with the same figure it is borne as',
    (type) => {
      const figure = CHARGES[type];
      const spot = { x: 100, y: 100, size: 20 };
      expect(figure.strewn(SHIELD_FRAME).length).toBeGreaterThan(20);
      expect(figure.at(spot)({ fill: '#fff' })).toBe(figure.at(spot)({ fill: '#fff' }));
    }
  );
});

describe('what a partition hands the drawing', () => {
  // The model says how many parts a line leaves and the drawing has to leave
  // that many: a figure with fewer would leave a part unpainted and one with
  // more would paint ground no part of the blazon claims. Neither shows itself
  // in a drawing that is merely looked at, so it is asked here.
  test.each(DIVISIONS)('%s is cut into as many parts as the model declares', (type) => {
    expect(dividedInto(type, DIVISIONS_DRAWN[type].parts(SHIELD_FRAME).length)).toBe(true);
  });
});
