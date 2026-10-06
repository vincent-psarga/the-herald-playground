import { paintedIn } from '../../../domain/models/Attributes';
import { Blazon, ChargeOrOrdinary, isOrdinary } from '../../../domain/models/Blazon';
import { Charge, numberBorne } from '../../../domain/models/Charge';
import { Modifier } from '../../../domain/models/Modifier';
import {
  Division,
  Field,
  Semy,
  isDivision,
  isFurred,
  isPlain,
  isVariation,
} from '../../../domain/models/Field';
import { borne } from '../../../domain/models/Ordinary';
import { FIRST } from '../../../domain/translations/Ranks';
import { Tincture } from '../../../domain/models/Tinctures';
import { Ink, Painter } from './Ground';
import { laid } from './painting/laid';
import { modelled } from './painting/modelled';
import { over } from './painting/over';
import { plain } from './painting/plain';
import { split } from './painting/split';
import { escapeAttribute } from './escaping';
import { filled } from './shapes/path';
import {
  BorneFigure,
  ChargeFigure,
  CutBand,
  DivisionFigure,
  OrdinaryFigure,
} from './vocabulary/Figures';
import { CHARGES } from './vocabulary/charges';
import { DIVISIONS } from './vocabulary/coverings/divisions';
import { peltOf } from './vocabulary/coverings/furred';
import { ORDINARIES } from './vocabulary/ordinaries';
import { INKS } from './vocabulary/tinctures';
import { VARIATIONS } from './vocabulary/coverings/variations';

/**
 * A blazon read into the vocabulary that knows how to draw it.
 *
 * This is the one place the model and the drawing meet: everything under
 * vocabulary/ is named after a term and knows nothing of Blazon, and everything
 * under shapes/ and painting/ knows nothing of heraldry at all.
 *
 * The field first, then whatever it bears: what is laid on the field is laid
 * over it, not under. Several are painted in the order the blazon named them,
 * each over the last, which is what that order is for — a bordure blazoned after
 * three bends covers where they meet the edge, and blazoned before them is
 * covered by them. A band and a charge answer to the same order: a bend blazoned
 * after a billet is drawn over the billet, and before it is drawn under.
 */
export function arms(blazon: Blazon): Painter {
  return over(field(blazon.field, PART), ...(blazon.chargesOrOrdinaries ?? []).map(bearing));
}

/**
 * What a part of a divided field answers to, so that what is drawn inside it can
 * be cut off at the line.
 *
 * Two SVGs inlined in one document share an id space, as the shield's own clip
 * knows, and the parts of one field must be told apart from each other besides —
 * so the rank of the part is written on the end of it. A part cut again would
 * want its own parts named under it, which is why the name is handed down rather
 * than spelled out where it is used.
 */
const PART = 'blason-part';

/**
 * The field, cut whichever of the four ways it is cut, and sown over where it
 * was sown.
 *
 * A varied field is painted the first tincture entire and every other piece laid
 * over it in the second, which puts the first piece where the armorials put it:
 * in chief, or against the dexter chief corner. A pelt covers the whole field
 * rather than cutting it, so there is nothing to lay over anything.
 */
function field(field: Field, within: string): Painter {
  if (isVariation(field)) {
    return over(
      plain(INKS[field.firstTincture]),
      laid(
        (frame) => VARIATIONS[field.type].pieces(frame, field.pieces),
        INKS[field.secondTincture]
      )
    );
  }
  if (isFurred(field)) {
    return plain((ground) => escapeAttribute(peltOf(ground, field).fill));
  }
  if (isDivision(field)) {
    return divided(field, within);
  }
  return field.semy === undefined
    ? plain(INKS[field.tincture])
    : over(plain(INKS[field.tincture]), sown(field.semy));
}

/**
 * A divided field: both parts painted over the whole of what they cover, and
 * then whatever either of them carries drawn inside it.
 *
 * The painting comes first and takes both parts whatever they carry, so that a
 * part carrying nothing but its tincture is one shape and no more — which is
 * every divided field in the armorials, and is drawn exactly as it was before a
 * part could carry anything.
 */
function divided(division: Division, within: string): Painter {
  const figure = DIVISIONS[division.type];
  const parts = division.parts;
  return over(
    laidIn(figure, parts),
    ...parts.map((part, rank) => carried(figure, rank, part, `${within}-${rank + 1}`))
  );
}

/**
 * Every part painted with the tincture its own field is laid on, each over the
 * whole of what it covers.
 *
 * One ink to a part, in rank order, so that a field of four is painted exactly
 * as a field of two is and neither has to know how many parts the other has.
 */
function laidIn(figure: DivisionFigure, parts: readonly Blazon[]): Painter {
  return split((frame) => figure.parts(frame).map((part) => filled(part.covers)), parts.map(inkOf));
}

/**
 * What one part of a divided field carries, drawn inside the part.
 *
 * Nothing at all where the part carries nothing but its tincture: the painting
 * above has already said the whole of such a part, and a drawing that wrapped it
 * in a clip to say no more would be paying for what is not there.
 *
 * What it bears is drawn in the room the part gives it — the part's own corner,
 * its own reaches — so that three lilies in the half at dexter stand in that
 * half, drawn to the size the half has room for. Its sowing is not: a semy is
 * the field's own state rather than something borne, and it is laid in the
 * lattice the whole field is sown in and cut off at the line, which is how an
 * armorial draws a sown half — the figures running on to the line and stopping
 * there, in step with whatever is sown on the other side of it.
 *
 * Both are cut off at the line by the part's own outline, which is what the clip
 * is for: a band drawn across a part keeps its width and its angle and ends
 * where the part ends, as everything else here is drawn past its edge and left
 * to a clip.
 */
function carried(figure: DivisionFigure, rank: number, part: Blazon, clip: string): Painter {
  const field = part.field;
  const semy = isPlain(field) ? field.semy : undefined;
  const borne = part.chargesOrOrdinaries ?? [];
  const cut = isVariation(field) ? field : undefined;
  if (cut === undefined && semy === undefined && borne.length === 0) {
    return () => '';
  }
  const laidOn = over(...borne.map(bearing));
  // The pieces of a part cut into them, laid over the part's own paint exactly
  // as a whole field's are: the painting above has already covered the part in
  // the first tincture, so what is left to draw is every other piece.
  const cutUp =
    cut === undefined
      ? undefined
      : laid((frame) => VARIATIONS[cut.type].pieces(frame, cut.pieces), INKS[cut.secondTincture]);
  return (ground) => {
    const { covers, room, at } = figure.parts(ground.frame)[rank];
    // Measured against the part rather than the field, so a bandé of six in a
    // quarter is six pieces across the quarter, and put where the part is.
    const inside = (painter: Painter) =>
      `<g transform="translate(${at[0]} ${at[1]})">${painter({ ...ground, frame: room })}</g>`;
    const pieces = cutUp === undefined ? '' : inside(cutUp);
    const sowing = semy === undefined ? '' : sown(semy)(ground);
    const bearings = borne.length === 0 ? '' : inside(laidOn);
    return [
      `<clipPath id="${clip}"><path d="${covers}"/></clipPath>`,
      `<g clip-path="url(#${clip})">${pieces}${sowing}${bearings}</g>`,
    ].join('');
  };
}

/**
 * What one part of a divided field is painted with.
 *
 * A part is arms, and what paints it is the tincture its field is laid on: the
 * part's own where its field is plain, and the first its field names where the
 * part is itself cut. A part cut again is the one thing here that is not drawn —
 * its second tincture is nowhere, and neither is the line between them — and it
 * is a field neither tongue reads yet.
 */
function inkOf(part: Blazon): Ink {
  return INKS[groundOf(part.field)];
}

/**
 * The tincture a field is laid on: its own where it is plain, and the first it
 * names where it is cut — which is the piece in chief, or the one at dexter.
 */
function groundOf(field: Field): Tincture {
  if (isDivision(field)) {
    return groundOf(field.parts[FIRST - 1].field);
  }
  return isPlain(field) ? field.tincture : field.firstTincture;
}

/**
 * A field sown with a charge: the same figure the charge is drawn as, small and
 * past counting, laid in a lattice over the whole field.
 *
 * It is laid over the tincture and under everything the field bears, which is
 * where it belongs: a semy is the field's own state, so a bordure blazoned after
 * it covers it exactly as it covers the tincture beneath.
 *
 * Nothing is clipped here. The lattice is laid past every edge and the shield's
 * own outline cuts it, which is what gives a semy the half figures along the
 * edges that say it runs on beyond them.
 */
function sown(semy: Semy): Painter {
  return laid((frame) => CHARGES[semy.type].strewn(frame), INKS[semy.tincture]);
}

/**
 * A band or a charge, drawn by whichever vocabulary its term belongs to, however
 * many of it are borne: two chevrons are two bands of one tincture, not two
 * charges each with its own.
 *
 * One tincture, unless the blazon painted the band's line in one of its own. Then
 * the cut band is laid in the line's tincture and the band inside the cut is laid
 * over it in the band's, so that what shows of the line is the teeth and nothing
 * else, pinching away to nothing where a notch comes back to the band. The band
 * keeps its place and its width either way: what a blazon paints there is the
 * line, not a second band laid underneath.
 */
function bearing(one: ChargeOrOrdinary): Painter {
  if (isOrdinary(one)) {
    const count = borne(one);
    const cut = drawn(ORDINARIES[one.type], one.modifier);
    if (one.modifierTincture === undefined || !isCutBand(cut)) {
      return laid((frame) => cut.shapes(frame, count), INKS[one.tincture]);
    }
    return over(
      laid((frame) => cut.shapes(frame, count), INKS[one.modifierTincture]),
      laid((frame) => cut.within(frame, count), INKS[one.tincture])
    );
  }
  const figure = drawn(CHARGES[one.type], one.modifier);
  const count = numberBorne(one);
  return over(
    laid((frame) => figure.shapes(frame, count), INKS[one.tincture]),
    ...painting(one, figure, count),
    ...modelling(figure, count)
  );
}

/**
 * The marks the figure is modelled by, washed over everything the blazon painted
 * and in no tincture of its own.
 *
 * Last of all, the parts included: a lion armed gules has its claws shaded like
 * the rest of it, the modelling being a fact about the drawing rather than about
 * which paint lies where. Nothing at all for the figures that are not modelled,
 * which is every one of them but the beast.
 */
function modelling(figure: ChargeFigure, count: number): readonly Painter[] {
  const marks = figure.modelling;
  return marks === undefined ? [] : [modelled((frame) => marks(frame, count))];
}

/**
 * The parts of a charge painted apart from the rest, each over the whole figure
 * in a tincture of its own: a gem-ring's stone, standing on the hoop.
 *
 * Laid after the charge and in the order the blazon named them, a part being a
 * part of the figure rather than something beside it. A part whose tincture the
 * blazon never named is painted in the charge's own, which draws it as the name
 * that said it means: a gem-ring or is a gold hoop with a gold stone.
 *
 * A part the vocabulary has no drawing for is not drawn, exactly as a modifier
 * it has no drawing for leaves the charge plain. It cannot arrive here — the
 * parser refuses a part the charge has not got — so this says what to do about a
 * drawing that has fallen behind the model.
 */
function painting(one: Charge, figure: ChargeFigure, count: number): readonly Painter[] {
  return (one.attributes ?? []).flatMap((painted) => {
    const part = figure.parts[painted.attribute];
    return part === undefined
      ? []
      : [laid((frame) => part.shapes(frame, count), INKS[paintedIn(painted, one.tincture)])];
  });
}

/**
 * Whether a figure knows what it looks like inside its own cut, which every band
 * drawn along a line does.
 *
 * Nothing can arrive here without it — the parser gives a tincture to no modifier
 * but a line, and every line a band may be drawn along is drawn both ways — so
 * what this guards is a drawing fallen behind the model, which is painted in the
 * one tincture as it would have been before a line could be painted at all.
 */
function isCutBand(figure: BorneFigure | CutBand): figure is CutBand {
  return 'within' in figure;
}

/**
 * The figure something is drawn as: its own, or the one a modifier leaves of it.
 *
 * A band and a charge are asked alike, though what each is asked about differs:
 * the charge's middle is taken out and the band's line is cut into teeth. Which
 * modifier either may carry is settled long before the drawing, so all there is
 * to do here is look the second drawing up.
 *
 * Anything the blazon modified in a way the vocabulary has no second drawing for
 * is drawn plain rather than not at all. It cannot arrive here — the parser
 * refuses a modifier the term does not take, and every one it does take is
 * drawn — so this says what to do about a drawing that has fallen behind the
 * model rather than about anything a blazon can say.
 */
function drawn(figure: ChargeFigure, modifier?: Modifier): ChargeFigure;
function drawn(figure: OrdinaryFigure, modifier?: Modifier): BorneFigure | CutBand;
function drawn(
  figure: OrdinaryFigure | ChargeFigure,
  modifier?: Modifier
): BorneFigure | CutBand | ChargeFigure {
  return modifier === undefined ? figure : (figure.modified[modifier] ?? figure);
}
