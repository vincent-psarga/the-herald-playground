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
  [OrdinaryType.chief]: new OrdinaryDefinition(OrdinaryType.chief),
  [OrdinaryType.pale]: new OrdinaryDefinition(OrdinaryType.pale, { canBeBorneInNumbers: true }),
  [OrdinaryType.fess]: new OrdinaryDefinition(OrdinaryType.fess, { canBeBorneInNumbers: true }),
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
  [OrdinaryType.bendSinister]: new OrdinaryDefinition(OrdinaryType.bendSinister, {
    canBeBorneInNumbers: true,
  }),
  [OrdinaryType.chevron]: new OrdinaryDefinition(OrdinaryType.chevron, {
    canBeBorneInNumbers: true,
  }),
  // A single charge for all that it is drawn as two limbs crossing, and
  // repeating it makes crosslets, which are small charges strewn over the field
  // rather than ordinaries. The saltire is the same figure turned, and answers
  // the same way.
  [OrdinaryType.cross]: new OrdinaryDefinition(OrdinaryType.cross),
  [OrdinaryType.saltire]: new OrdinaryDefinition(OrdinaryType.saltire),
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
