import { Modifier } from '../../../../domain/models/Modifier';
import { Cut, DANCETTY, INDENTED, VIVRE } from '../shapes/teeth';
import { BorneFigure } from './Figures';

/**
 * The teeth each modifier is cut with, and nothing for the modifiers that cut no
 * line at all.
 *
 * Keyed on every modifier rather than on the three lines, so that a modifier
 * added to the model breaks this until it has been said whether it is a line and
 * how big its teeth are. Voided and pierced are what is done to a charge's
 * middle, which no line does and no band has.
 */
const CUT: Readonly<Record<Modifier, Cut | undefined>> = {
  [Modifier.voided]: undefined,
  [Modifier.pierced]: undefined,
  [Modifier.indented]: INDENTED,
  [Modifier.dancetty]: DANCETTY,
  [Modifier.vivre]: VIVRE,
};

/**
 * The same band drawn along each of the modified lines.
 *
 * A band says once how it is cut and is given the three drawings, because the
 * lines differ in the teeth and in nothing a band knows about: a fess cut along
 * any of them is still a fess, still where it was, still as wide. Writing the
 * three out band by band would be writing the same drawing three times and
 * inviting them to drift apart.
 */
export function alongLines(
  band: (cut: Cut) => BorneFigure
): Readonly<Partial<Record<Modifier, BorneFigure>>> {
  return Object.fromEntries(
    Object.entries(CUT)
      .filter(([, cut]) => cut !== undefined)
      .map(([modifier, cut]) => [modifier, band(cut as Cut)])
  );
}
