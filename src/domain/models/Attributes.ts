import { Tincture } from './Tinctures';

/**
 * The attributes: a part of a charge, painted in a tincture of its own.
 *
 * An attribute is not a term and it is not a modifier. A modifier changes what
 * is left of the figure — a lozenge voided keeps its outline and loses its
 * middle — and the whole of what is left is painted in the charge's one
 * tincture. An attribute takes nothing away and adds no figure beside the
 * charge: it names a part the figure has already got, and says what colour that
 * part is drawn. "Au lion armé de gueules" is one lion with red claws, not a
 * lion and some claws.
 *
 * So an attribute carries a tincture where a modifier carries none, and a charge
 * bears as many of them at once as it has parts to name: a lion is armed and
 * lampassé in the one blazon. A modifier is one thing done to the figure and
 * there is one of it.
 *
 * Which of them a charge will take is the charge's own business and is declared
 * with the charge, as its modifiers are: only a ring has a stone in it.
 */
export enum Attribute {
  /**
   * The stone set in a ring: "a gem-ring or stoned azure", "à l'anneau d'or
   * chatonné d'azur".
   *
   * Parker files the figure under Ring — "the most important bearing of this
   * name is the Gem-ring, that is a finger-ring set with a jewel, and this is
   * sometimes described as stoned, gemmed, or jewelled of another tincture" —
   * and blazons "Gules, three gem-rings argent stoned azure".
   */
  stoned = 'Attribute.stoned',
}

/**
 * One attribute as a blazon said it: which part, and what tincture it is drawn
 * in.
 *
 * The tincture is left off rather than named where the blazon named none, which
 * is what a name that already says the part leaves behind: "a gem-ring or" has
 * its stone by being a gem-ring and says nothing of its colour, so the stone is
 * drawn in the charge's own tincture. Named, it is another tincture than the
 * charge's — which is what an attribute is for.
 */
export type Attributed = {
  readonly attribute: Attribute;
  readonly tincture?: Tincture;
};

/** The tincture a part is drawn in: its own, or the charge's where it has none. */
export function paintedIn(attributed: Attributed, charge: Tincture): Tincture {
  return attributed.tincture ?? charge;
}

/** Whether a list of attributes already names one, an attribute being said once. */
export function namesPart(attributes: readonly Attributed[], attribute: Attribute): boolean {
  return attributes.some((said) => said.attribute === attribute);
}
