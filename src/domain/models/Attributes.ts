import { isCompony } from './Compony';
import { Tinctured, isCounterchanged } from './Counterchanged';
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
 * with the charge, as its modifiers are: only a ring has a stone in it, and only
 * a beast has claws and a tongue.
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
  /**
   * The claws of a beast: "a lion gules armed azure", "au lion de gueules armé
   * d'azur".
   *
   * Parker has it of the whole company at once — "when any beast of prey has
   * teeth and claws, or any beast of chase (except stags, &c.) horns and hoofs,
   * or any bird of prey beak and talons, of a tincture different from its body,
   * it is said to be armed of such a tincture" — and the French dictionary keeps
   * it off the cloven-footed, which are onglés instead.
   *
   * What is drawn is the claws. The teeth this vocabulary does not draw, and a
   * blazon arming a beast that has none will have to wait for one.
   */
  armed = 'Attribute.armed',
  /**
   * The tongue of a beast: "a lion gules langued azure", "au lion de gueules
   * lampassé d'azur".
   *
   * Said of the quadrupeds. French keeps langué for the birds and the reptiles
   * and lampassé for the rest — "s'il s'agit d'un oiseau il est préférable de le
   * dire langué" — where English says langued of either.
   */
  langued = 'Attribute.langued',
  /**
   * The crown a beast wears: "a lion or crowned gules", "au lion d'or couronné
   * de gueules".
   *
   * A part the blazon gives the beast rather than one it has, as the ring's
   * stone is: a lion is not crowned until something says so. Which crown is
   * settled where the blazon leaves it unsaid — "a ducal coronet is implied
   * unless some other be expressly mentioned" — and no blazon here can mention
   * another, so the ducal one is the only one drawn.
   */
  crowned = 'Attribute.crowned',
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

/**
 * The tincture a part is drawn in: its own, or the charge's where it has none.
 *
 * Nothing at all where it has none and the charge has none to lend, which is a
 * charge counterchanged: what such a charge is painted with is the field's two
 * and neither of them is a tincture the part could borrow. A charge cut into
 * compons would be painted two at once and lend neither, were a charge ever
 * cut so. The part is then left
 * unsaid and undrawn rather than guessed at — a blazon that wanted it painted
 * had only to name its tincture, an attribute being owed one.
 */
export function paintedIn(attributed: Attributed, charge: Tinctured): Tincture | undefined {
  if (attributed.tincture !== undefined) {
    return attributed.tincture;
  }
  return isCounterchanged(charge) || isCompony(charge) ? undefined : charge;
}

/** Whether a list of attributes already names one, an attribute being said once. */
export function namesPart(attributes: readonly Attributed[], attribute: Attribute): boolean {
  return attributes.some((said) => said.attribute === attribute);
}
