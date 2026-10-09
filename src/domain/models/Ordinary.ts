import { Tinctured } from './Counterchanged';

/**
 * The ordinaries: the plain geometric bands a field is charged with, named after
 * the lines they follow. Ten of them so far, listed as heraldry lists them —
 * the straight bands first, then the diagonals, then the ones that bend or
 * cross, and last the one that follows no line across the field but runs round
 * its edge. A field may bear several of them, and several of each.
 *
 * One of the ten is not a single band: a bar gemel is a pair of narrow ones,
 * borne and blazoned as one charge. Which is why the count on an Ordinary counts
 * charges rather than bands — "à trois jumelles" is three gemels, and six bars.
 *
 * Several share a name with a partition, because both are named after the same
 * line: a field may be divided per fess or charged with a fess. What tells them
 * apart is the word in front, which is the language's business rather than the
 * model's.
 */
export enum OrdinaryType {
  chief = 'Ordinary.chief',
  pale = 'Ordinary.pale',
  fess = 'Ordinary.fess',
  barGemel = 'Ordinary.barGemel',
  bend = 'Ordinary.bend',
  bendSinister = 'Ordinary.bendSinister',
  chevron = 'Ordinary.chevron',
  cross = 'Ordinary.cross',
  saltire = 'Ordinary.saltire',
  bordure = 'Ordinary.bordure',
}

/**
 * What is true of an ordinary whatever blazon names it: whether a field may bear
 * more than one of it, and whether it may be cut into compons.
 *
 * It is not the drawing and it is not the word. An ordinary is a term of the
 * model, and what may be said of that term is the model's to know — "three
 * chiefs" is refused in either tongue, and for the same reason, so neither
 * vocabulary should have to hold the list. What may yet be said of a band — the
 * modified lines heraldry draws them with — is declared here when it arrives,
 * beside this.
 */
export class OrdinaryDefinition {
  /**
   * Whether the field may bear more than one of it — whether it may be borne, as
   * heraldry says, in number.
   *
   * Most of the bands may: a field bears two chevrons or three bends as readily
   * as one, the bands growing narrower to make room for each other, and an
   * armorial is as likely to say "à trois jumelles" as "à la jumelle". Four
   * cannot, and each entry below says why it is one of the four.
   *
   * English gives the repeated band a name of its own — the diminutive: pallets
   * for pales, bars for fesses, bendlets, chevronels. Those are spellings rather
   * than terms, so they belong to a language's vocabulary and not here; the model
   * knows only how many are borne.
   */
  public readonly canBeBorneInNumbers: boolean;

  /**
   * How many compons the band is cut into where it is borne compony, and nothing
   * where it never is.
   *
   * One answer to two questions, because a band that may be compony and has no
   * number to be cut into is a band nobody could draw. The number is the one the
   * band is understood to have, no blazon this vocabulary reads counting them.
   */
  public readonly compons: number | undefined;

  constructor(
    public readonly type: OrdinaryType,
    opts?: Partial<{
      canBeBorneInNumbers: boolean;
      compons: number;
    }>
  ) {
    this.canBeBorneInNumbers = opts?.canBeBorneInNumbers ?? false;
    this.compons = opts?.compons;
  }
}

/**
 * Every ordinary, and what may be said of it.
 *
 * Keyed on OrdinaryType, so an ordinary added to the vocabulary breaks this
 * until it has been said what it will take — which is the question worth asking
 * of a new band, and the one easiest to forget.
 *
 * Borne but once is what an ordinary is given until something says otherwise,
 * because the bands that cannot be repeated are the ones with a reason, and a
 * reason is worth writing down where the exception is.
 */
export const OrdinaryDefinitions: Record<OrdinaryType, OrdinaryDefinition> = {
  // The top of the shield itself rather than a band laid anywhere on it, and a
  // shield has one top.
  //
  // Compony, though the sources disagree. O'Kelly de Galway's dictionary has it
  // "se dit du chef, du pal, du chevron, de la fasce, de la croix, du sautoir, de
  // la bande, de la cotice, de la bordure", and Wikipedia holds that "certain
  // charges cannot be compony, for practical reasons, for example common charges
  // and the chief as they are generally not long and thin in shape". A
  // dictionary naming the chief outweighs a practical reason against it, and a
  // chief cut into compons is drawn as plainly as a fess. Six, chosen here: no
  // source gives the chief a number, and six is the bend's.
  [OrdinaryType.chief]: new OrdinaryDefinition(OrdinaryType.chief, { compons: 6 }),
  // Compony, as O'Kelly has it and Verfey de Saint-Nizier bears it — "De
  // gueules, au pal componné d'or et d'azur". Six, chosen here: no source gives
  // the pale a number, and six is the bend's.
  [OrdinaryType.pale]: new OrdinaryDefinition(OrdinaryType.pale, {
    canBeBorneInNumbers: true,
    compons: 6,
  }),
  // Compony, as O'Kelly has it and Parker blazons it — "Argent, a fesse
  // gobonated argent and gules between three owls". Six, chosen here, as the
  // pale's.
  [OrdinaryType.fess]: new OrdinaryDefinition(OrdinaryType.fess, {
    canBeBorneInNumbers: true,
    compons: 6,
  }),
  // Never compony. No source cuts it so — O'Kelly's list of the "pièces de
  // longueur" stops at the cotice — and each of its two bars is a diminutive,
  // too narrow to be cut into anything a reader would take for squares.
  [OrdinaryType.barGemel]: new OrdinaryDefinition(OrdinaryType.barGemel, {
    canBeBorneInNumbers: true,
  }),
  // Compony in six: no source gives a bend a usual number, but six is the one
  // the armorials write when they write one — Vallin's "bande componnée d'argent
  // et d'azur de six pièces", the "bâton componé … de six pièces" of Évreux.
  [OrdinaryType.bend]: new OrdinaryDefinition(OrdinaryType.bend, {
    canBeBorneInNumbers: true,
    compons: 6,
  }),
  // Compony, and in six, as the bend it is the reverse of. No source names the
  // bend sinister compony in so many words; O'Kelly names the bend, and nothing
  // about turning it over takes that away.
  [OrdinaryType.bendSinister]: new OrdinaryDefinition(OrdinaryType.bendSinister, {
    canBeBorneInNumbers: true,
    compons: 6,
  }),
  // Compony, as O'Kelly has it. Seven, chosen here: a compon at the point and
  // three down each limb, the point being where the limbs meet as the middle of
  // a cross is.
  [OrdinaryType.chevron]: new OrdinaryDefinition(OrdinaryType.chevron, {
    canBeBorneInNumbers: true,
    compons: 7,
  }),
  // A single charge for all that it is drawn as two limbs crossing, and
  // repeating it makes crosslets, which are small charges strewn over the field
  // rather than ordinaries. The saltire is the same figure turned, and answers
  // the same way.
  //
  // Both compony, as O'Kelly has it. The cross in nine, which is Rivière de La
  // Mure's: "De gueules, à la croix componnée de quatre pièces d'azur et de cinq
  // pièces d'or" — the middle, and two along each arm. The saltire in nine
  // too, chosen here by the cross's, no source giving it a number.
  [OrdinaryType.cross]: new OrdinaryDefinition(OrdinaryType.cross, { compons: 9 }),
  [OrdinaryType.saltire]: new OrdinaryDefinition(OrdinaryType.saltire, { compons: 9 }),
  // The edge of the shield, and a shield has one of those too.
  //
  // Compony in sixteen, which is Parker's number: "A bordure compony should
  // consist of sixteen pieces or gobbits gyronwise."
  [OrdinaryType.bordure]: new OrdinaryDefinition(OrdinaryType.bordure, { compons: 16 }),
};

/** The fewest of an ordinary that is more than one of it. */
export const SEVERAL = 2;

/**
 * One ordinary, in its own tincture, borne once or several times over. A charge
 * may itself be charged, and may be drawn with a modified line, but neither is
 * in the vocabulary yet: an ordinary here is a plain band of a plain tincture.
 *
 * The tincture may be no tincture at all but the field's own two, reversed —
 * which is a thing said where a tincture is said and answers the same question,
 * so it is held where a tincture is held. What that comes out as is the field's
 * to settle rather than the band's, which is exactly why the band cannot name
 * it: a bordure counterchanged is gold against the sable half and sable against
 * the gold, and neither of those is what the blazon said.
 *
 * The count is left off rather than set to one when a single band is borne, so
 * that a fess reads back as the fess it was before a field could bear two.
 */
export type Ordinary = {
  type: OrdinaryType;
  tincture: Tinctured;
  /** How many are borne, where more than one is. */
  count?: number;
};

/** How many of an ordinary a blazon bears: one, unless it says otherwise. */
export function borne(ordinary: Ordinary): number {
  return OrdinaryDefinitions[ordinary.type].canBeBorneInNumbers ? (ordinary.count ?? 1) : 1;
}

/**
 * Which vocabulary a term belongs to is what tells an ordinary from a charge:
 * both are borne by the same phrase and carry the same tincture and count, and
 * nothing about the shape of the object says which it is.
 */
const ORDINARIES: ReadonlySet<string> = new Set(Object.values(OrdinaryType));

export function isOrdinaryType(type: string): type is OrdinaryType {
  return ORDINARIES.has(type);
}
