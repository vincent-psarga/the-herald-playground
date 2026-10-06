import { Tincture } from './Tinctures';

/**
 * A figure painted out of the field it is laid on rather than out of a tincture
 * of its own: every part of it takes the tincture opposite the part of the field
 * beneath it. Where the field is metal the figure is colour, and where the field
 * is colour the figure is metal.
 *
 * It is not a tincture and must never become one. A colouring answers for the
 * tinctures — it says what gules is painted with — and there is nothing here for
 * it to answer: what this is painted with is whatever the field under it is not,
 * which is known only once the field is known. So it stands beside the tinctures
 * rather than among them, and every record keyed on Tincture is left alone.
 *
 * One term, though French has two phrases for it and the dictionaries disagree
 * about which of them means what. Parker covers both with one sentence — the
 * field is "separated by one of the lines of partition named from the ordinaries
 * (per pale, per bend, &c.)", and "the charges, or parts of charges, placed upon
 * the metal are of the colour, and vice versa" — and under that rule the two
 * French cases are one thing seen twice. A figure lying wholly in one half comes
 * out wholly of the other tincture; a figure crossing the line comes out cut by
 * it. Nothing here says which, so nothing here has to choose between the two
 * traditions: the shape of the figure answers it.
 */
export const COUNTERCHANGED = 'Counterchanged';

export type Counterchanged = typeof COUNTERCHANGED;

/**
 * What something borne is painted with: a tincture it names, or the field's own
 * two, reversed.
 *
 * A band alone, for now. A charge is counterchanged as readily — heraldry does
 * it constantly, and Parker's sentence says "charges" before it says "parts of
 * charges" — but the phrase French uses of charges is the other of its two, and
 * neither is read of one yet.
 */
export type Tinctured = Tincture | Counterchanged;

/** Whether what is borne takes the field's tinctures rather than naming one. */
export function isCounterchanged(tinctured: Tinctured): tinctured is Counterchanged {
  return tinctured === COUNTERCHANGED;
}
