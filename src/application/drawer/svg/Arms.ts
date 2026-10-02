import { Blazon, ChargeOrOrdinary, isOrdinary } from '../../../domain/models/Blazon';
import { numberBorne } from '../../../domain/models/Charge';
import { Modifier } from '../../../domain/models/Modifier';
import { Field, Semy, isDivision, isFurred, isVariation } from '../../../domain/models/Field';
import { borne } from '../../../domain/models/Ordinary';
import { Painter } from './Ground';
import { laid } from './painting/laid';
import { over } from './painting/over';
import { plain } from './painting/plain';
import { split } from './painting/split';
import { escapeAttribute } from './escaping';
import { BorneFigure, ChargeFigure, OrdinaryFigure } from './vocabulary/Figures';
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
  return over(field(blazon.field), ...(blazon.chargesOrOrdinaries ?? []).map(bearing));
}

/**
 * The field, cut whichever of the four ways it is cut, and sown over where it
 * was sown.
 *
 * A varied field is painted the first tincture entire and every other piece laid
 * over it in the second, which puts the first piece where the armorials put it:
 * in chief, or against the dexter chief corner. A pelt covers the whole field
 * rather than cutting it, so there is nothing to lay over anything.
 */
function field(field: Field): Painter {
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
    return split(
      (frame) => DIVISIONS[field.type].halves(frame),
      INKS[field.firstTincture],
      INKS[field.secondTincture]
    );
  }
  return field.semy === undefined
    ? plain(INKS[field.tincture])
    : over(plain(INKS[field.tincture]), sown(field.semy));
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
    : ([CHARGES[one.type], numberBorne(one)] as const);
  return laid((frame) => drawn(figure, one.modifier).shapes(frame, count), INKS[one.tincture]);
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
function drawn(figure: OrdinaryFigure | ChargeFigure, modifier?: Modifier): BorneFigure {
  return modifier === undefined ? figure : (figure.modified[modifier] ?? figure);
}
