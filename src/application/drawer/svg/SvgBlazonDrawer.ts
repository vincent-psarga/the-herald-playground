import { Blazon } from '../../../domain/models/Blazon';
import { isCompony } from '../../../domain/models/Compony';
import { isCounterchanged } from '../../../domain/models/Counterchanged';
import { isDivision, isFurred, isVariation } from '../../../domain/models/Field';
import { Tincture } from '../../../domain/models/Tinctures';
import { ColorModel, DrawOptions, IBlazonDrawer } from '../../../domain/services/IBlazonDrawer';
import { arms } from './Arms';
import { definitions, document } from './Document';
import { Ground } from './Ground';
import { SHIELD_FRAME } from './shapes/shield';
import { peltOf } from './vocabulary/coverings/furred';

const DEFAULT_OUTLINE = '#1a1a1a';

/** Draws a blazon as an SVG shield. */
export class SvgBlazonDrawer implements IBlazonDrawer {
  /**
   * The outline is a property of the ground the arms are drawn on, not of the
   * arms, so it is supplied rather than assumed: a shield drawn near-black
   * vanishes on a dark page, which is the one thing a drawing must never do.
   */
  constructor(
    private readonly colours: ColorModel,
    private readonly outline: string = DEFAULT_OUTLINE
  ) {}

  draw(blazon: Blazon, drawOptions?: DrawOptions): string {
    const ground: Ground = {
      frame: SHIELD_FRAME,
      colours: drawOptions?.colorModel ?? this.colours,
    };
    return document(
      SHIELD_FRAME,
      definitions(ground, tincturesOf(blazon), peltFor(ground, blazon)),
      arms(blazon)(ground),
      this.outline
    );
  }
}

/**
 * Every tincture the drawing will ask for, so that whatever each is painted with
 * is defined beside it. What a field is sown with counts among them: a semy is
 * painted with a tincture like anything else, and a hatched one needs its ruling
 * placed or it is drawn in nothing at all.
 *
 * A band painted out of the field names none of its own and adds none here: what
 * it is painted with is the field's two, which are already among these. A band
 * cut into compons adds both of its own.
 */
function tincturesOf(blazon: Blazon): readonly Tincture[] {
  const painted = blazon.field;
  const field =
    isDivision(painted) || isVariation(painted) || isFurred(painted)
      ? [painted.firstTincture, painted.secondTincture]
      : [painted.tincture, ...(painted.semy === undefined ? [] : [painted.semy.tincture])];
  return [
    ...field,
    ...(blazon.chargesOrOrdinaries ?? []).flatMap(({ tincture }) =>
      isCounterchanged(tincture) ? [] : isCompony(tincture) ? tincture.compony : [tincture]
    ),
  ];
}

/** The pelt a furred field is covered with, where the field is furred at all. */
function peltFor(ground: Ground, blazon: Blazon) {
  return isFurred(blazon.field) ? peltOf(ground, blazon.field) : undefined;
}
