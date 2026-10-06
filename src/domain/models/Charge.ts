import { Modifier } from './Modifier';
import { Tincture } from './Tinctures';

/**
 * The charges: the figures a field bears that follow no line across it.
 *
 * An ordinary is named after a line — the fess lies where the field is divided
 * per fess — and takes its place and its size from that line. A charge is named
 * after the thing it is a picture of, and owes the field nothing: it is set on
 * the field wherever the blazon says, as many times as the blazon says.
 *
 * Ten so far. Some are plain geometry and some are pictures of something: a
 * drop, a tear, a star, the lily heraldry drew as a smith would forge it, and
 * the moon with its horns up. A lion is
 * a charge by the same reckoning and is read by the same phrase, which is why
 * these are kept apart from the ordinaries rather than listed among them: what
 * will grow here is the beasts and the objects, and what an ordinary can be told
 * is quite another list.
 *
 * The roundel is one term and not a dozen, though heraldry gives it a dozen
 * names: a bezant, a plate and a torteau are the same disc in three tinctures,
 * and which name is written is the vocabulary's business rather than the
 * model's. What is drawn is a disc either way.
 *
 * Whether heraldry calls a lozenge a charge or a sub-ordinary is a quarrel this
 * does not enter. French calls them all meubles and is done with it.
 */
export enum ChargeType {
  annulet = 'Charge.annulet',
  billet = 'Charge.billet',
  lozenge = 'Charge.lozenge',
  roundel = 'Charge.roundel',
  goutte = 'Charge.goutte',
  /**
   * The straight-rayed star of five points, which French calls an étoile.
   *
   * It is not the estoile. That one is "as a rule represented of six points and
   * wavy", and where the rays are straight Parker says the figure "would then
   * more properly be described as a mullet of so many points" — so the figure
   * the armorials here draw is the mullet, whatever its cognate looks like.
   */
  mullet = 'Charge.mullet',
  fleurDeLis = 'Charge.fleurDeLis',
  /**
   * A cross small enough to be borne as a charge rather than laid across the
   * shield, and couped: "toutes les branches ont la même longueur" and "elle est
   * toujours alésée".
   *
   * It is the ordinary's own figure made small, so English names it so — a cross
   * couped — and it is not the crosslet, which Wiktionary has as "a small cross
   * with crossed arms" and which this vocabulary does not hold.
   */
  crossCouped = 'Charge.crossCouped',
  /** "A half-moon with the horns uppermost", which is the only way it is drawn here. */
  crescent = 'Charge.crescent',
  /**
   * The tear, which is not the drop however near it stands to one.
   *
   * French holds the two apart on purpose and says where the difference lies: a
   * goutte is a "petit meuble rond, ou hémisphérique, c'est en cela qu'il
   * diffère de la larme, avec laquelle il ne faut pas le confondre", where of
   * the larme "la partie supérieure en pointe, devient ondoyante, s'élargit et
   * se termine en rond". So the wave is in the tail and not in the flanks: a
   * round foot with a point drawn out of the top of it and bent over, where the
   * goutte falls straight to the point it ends in.
   *
   * English tells no such pair apart. Parker files "Larmes, or Larmettes" as
   * nothing but a pointer back to his Gouttes, so the figure that has a name
   * here has none there, and the word is taken from French whole exactly as
   * goutte was taken the other way.
   */
  larme = 'Charge.larme',
}

/**
 * What is true of a charge whatever blazon names it: today, which modifiers it
 * may be borne under.
 *
 * It is not the drawing and it is not the word. A charge is a term of the model,
 * and what may be said of that term is the model's to know — "an annulet voided"
 * is refused in either tongue, and for the same reason, so neither vocabulary
 * should have to hold the list.
 */
export class ChargeDefinition {
  /**
   * The modifiers a blazon may bear it under, which is none for most of them.
   *
   * Empty says the charge is what it is and admits of nothing: the annulet is a
   * roundel voided already, and voiding one again names no figure.
   */
  public readonly allowedModifiers: readonly Modifier[];

  constructor(
    public readonly type: ChargeType,
    opts?: Partial<{
      allowedModifiers: readonly Modifier[];
    }>
  ) {
    this.allowedModifiers = opts?.allowedModifiers ?? [];
  }
}

/**
 * Every charge, and what may be said of it.
 *
 * Keyed on ChargeType, so a charge added to the vocabulary breaks this until it
 * has been said what it will take — which is the question worth asking of a new
 * charge, and the one easiest to forget.
 */
export const ChargeDefinitions: Record<ChargeType, ChargeDefinition> = {
  [ChargeType.annulet]: new ChargeDefinition(ChargeType.annulet),
  // Voided and pierced both, which are two things done to it and not one said
  // twice: the outline of a billet is one figure and a billet with a hole in it
  // is another. The armorials name the second oftener than the first — "on se
  // sert du terme percées, pour les billettes" — and name it as a way of voiding,
  // which is the one thing it is not.
  [ChargeType.billet]: new ChargeDefinition(ChargeType.billet, {
    allowedModifiers: [Modifier.voided, Modifier.pierced],
  }),
  [ChargeType.crescent]: new ChargeDefinition(ChargeType.crescent),
  [ChargeType.crossCouped]: new ChargeDefinition(ChargeType.crossCouped),
  [ChargeType.fleurDeLis]: new ChargeDefinition(ChargeType.fleurDeLis),
  [ChargeType.goutte]: new ChargeDefinition(ChargeType.goutte),
  [ChargeType.larme]: new ChargeDefinition(ChargeType.larme),
  // Both, and heraldry gave each of the two a name of its own: a lozenge voided
  // is the mascle and a lozenge pierced is the rustre, which is the plainest
  // proof the two are not one thing said twice.
  [ChargeType.lozenge]: new ChargeDefinition(ChargeType.lozenge, {
    allowedModifiers: [Modifier.voided, Modifier.pierced],
  }),
  // The star is voided as readily as the lozenge, and the dictionaries say so in
  // a word of their own: blason-armoiries blazons "d'azur, à l'étoile évidée
  // d'argent", and gives évidé as the term used "pour les triangles et étoiles".
  // Pierced it is the rowel of a spur, which French names outright: the molette.
  [ChargeType.mullet]: new ChargeDefinition(ChargeType.mullet, {
    allowedModifiers: [Modifier.voided, Modifier.pierced],
  }),
  [ChargeType.roundel]: new ChargeDefinition(ChargeType.roundel, {
    allowedModifiers: [Modifier.voided],
  }),
};

/** The modifiers a charge may be borne under, in the order they are declared. */
export function modifiersOf(type: ChargeType): readonly Modifier[] {
  return ChargeDefinitions[type].allowedModifiers;
}

/**
 * Whether a charge may be borne under a modifier.
 *
 * Asked of the term rather than of the word, because the answer is the same in
 * every tongue: an annelet is no more voidable than an annulet.
 */
export function allowsModifier(type: ChargeType, modifier: Modifier): boolean {
  return modifiersOf(type).includes(modifier);
}

/**
 * One charge, in its own tincture, borne once or several times over.
 *
 * Every charge may be borne in number — that is what a charge is for, where an
 * ordinary may be the one top or the one edge of the shield — so there is no
 * list here saying which may and which may not.
 *
 * The count is left off rather than set to one when a single charge is borne, so
 * that a lozenge reads back as the lozenge it was written as.
 *
 * Where on the field they stand is the disposition, which a blazon may name — "en
 * chef", "en orle", "mal ordonnées" — and which is not read yet: a count with no
 * disposition is laid out the way an armorial lays it out when it says nothing.
 */
export type Charge = {
  type: ChargeType;
  tincture: Tincture;
  /** How many are borne, where more than one is. */
  count?: number;
  /**
   * What the blazon says has been done to the figure, where it says anything:
   * a lozenge voided is a lozenge still, and is drawn with its middle out.
   *
   * Left off rather than named where nothing was said, as the count is, so that
   * a plain lozenge reads back as the lozenge it was written as.
   */
  modifier?: Modifier;
};

/** How many of a charge a blazon bears: one, unless it says otherwise. */
export function numberBorne(charge: Charge): number {
  return charge.count ?? 1;
}

/**
 * Which vocabulary a term belongs to is what tells a charge from an ordinary:
 * both are borne by the same phrase and carry the same tincture and count, and
 * nothing about the shape of the object says which it is.
 */
const CHARGES: ReadonlySet<string> = new Set(Object.values(ChargeType));

export function isChargeType(type: string): type is ChargeType {
  return CHARGES.has(type);
}
