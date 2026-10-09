import type { Tinctured } from './Counterchanged';
import { Tincture } from './Tinctures';

/**
 * A band cut across into squares of two tinctures laid alternately along it:
 * "à la bordure componée de gueules et d'argent", "a bordure compony gules and
 * argent".
 *
 * Parker: "Said of an ordinary composed of small squares of two tinctures
 * alternately in one row." Every source keeps it to the bands — Au blason des
 * armoiries lists "pals, bandes, fasces, etc." — and none applies it to a field,
 * which cut the same way over and over is chequy, or to a charge.
 *
 * It is not a tincture any more than counterchanging is, and stands where a
 * tincture stands for the same reason: it answers the one question a tincture
 * answers, what the band is painted with. It names two of them rather than one,
 * so it is held as the pair, the first named first. No source says the first
 * named takes any particular compon — Briçonnet's bend is "componnée d'or et de
 * gueules" and its "premier compon de gueules" — so where the first lies is the
 * drawing's to say, and it says so where it draws it.
 *
 * How many compons the band is cut into is not held, no blazon this vocabulary
 * reads counting them. O'Kelly de Galway would have it counted — "On nomme le
 * nombre des compons en blasonnant", as Au blason des armoiries gives him — but
 * the armorials write "de six pièces" now and then and leave it off as often,
 * and a band of no stated number is cut into however many its definition is
 * understood to have.
 */
export type Compony = { readonly compony: readonly [Tincture, Tincture] };

/** Whether what is borne is cut into compons rather than painted in one tincture. */
export function isCompony(tinctured: Tinctured): tinctured is Compony {
  return typeof tinctured === 'object';
}
