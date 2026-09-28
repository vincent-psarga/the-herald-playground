import { Blazon, ChargeOrOrdinary, isOrdinary } from '../../../domain/models/Blazon';
import { Charge, numberBorne } from '../../../domain/models/Charge';
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
import { over } from './painting/over';
import { plain } from './painting/plain';
import { split } from './painting/split';
import { escapeAttribute } from './escaping';
import { filled } from './shapes/path';
import { BorneFigure, ChargeFigure, DivisionFigure } from './vocabulary/Figures';
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
  if (semy === undefined && borne.length === 0) {
    return () => '';
  }
  const laidOn = over(...borne.map(bearing));
  return (ground) => {
    const { covers, room, at } = figure.parts(ground.frame)[rank];
    const sowing = semy === undefined ? '' : sown(semy)(ground);
    const bearings =
      borne.length === 0
        ? ''
        : `<g transform="translate(${at[0]} ${at[1]})">${laidOn({ ...ground, frame: room })}</g>`;
    return [
      `<clipPath id="${clip}"><path d="${covers}"/></clipPath>`,
      `<g clip-path="url(#${clip})">${sowing}${bearings}</g>`,
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
 */
function bearing(one: ChargeOrOrdinary): Painter {
  const [figure, count] = isOrdinary(one)
    ? ([ORDINARIES[one.type], borne(one)] as const)
    : ([drawn(one), numberBorne(one)] as const);
  return laid((frame) => figure.shapes(frame, count), INKS[one.tincture]);
}

/**
 * The figure a charge is drawn as: its own, or the one a modifier leaves of it.
 *
 * A charge the blazon modified in a way the vocabulary has no second drawing for
 * is drawn plain rather than not at all. It cannot arrive here — the parser
 * refuses a modifier the charge does not take, and every one it does take is
 * drawn — so this says what to do about a drawing that has fallen behind the
 * model rather than about anything a blazon can say.
 */
function drawn(one: Charge): BorneFigure {
  const figure: ChargeFigure = CHARGES[one.type];
  return one.modifier === undefined ? figure : (figure.modified[one.modifier] ?? figure);
}
