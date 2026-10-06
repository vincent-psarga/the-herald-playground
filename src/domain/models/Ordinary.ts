import { Tinctured } from './Counterchanged';
import { LINES, Modifier } from './Modifier';
import { Tincture } from './Tinctures';

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
 * more than one of it, and which modified lines it may be drawn with.
 *
 * It is not the drawing and it is not the word. An ordinary is a term of the
 * model, and what may be said of that term is the model's to know — "three
 * chiefs" is refused in either tongue, and for the same reason, so neither
 * vocabulary should have to hold the list.
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
   * The modifiers a blazon may draw it under, which is none for most of them.
   *
   * What is done to a band is done to the line it is named after — indented,
   * engrailed — where what is done to a charge is done to its middle, so the two
   * lists never meet: no band is voided and no charge is indented. Which of them
   * a band takes is declared here rather than in either vocabulary, the answer
   * being the same in every tongue: a fasce is no likelier to be dentelée than a
   * fess is to be indented.
   *
   * Empty says the band is drawn with the line it was always drawn with. It is
   * the answer for a band the armorials do modify but whose teeth this drawing
   * cannot yet cut — a promise the drawer could not keep is worse than a word
   * left unread — and each entry below says which of the two it is.
   */
  public readonly allowedModifiers: readonly Modifier[];

  constructor(
    public readonly type: OrdinaryType,
    opts?: Partial<{
      canBeBorneInNumbers: boolean;
      allowedModifiers: readonly Modifier[];
    }>
  ) {
    this.canBeBorneInNumbers = opts?.canBeBorneInNumbers ?? false;
    this.allowedModifiers = opts?.allowedModifiers ?? [];
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
  // shield has one top. Its one free edge is a line like any other, and cutting
  // teeth in it is what a chief indented is — or a chef vivré, which Parker
  // writes of the arms of JAUCHE in Brabant. Which edge that is, the dictionary
  // says out loud of the engrêlé: "le chef ne peut être Engrêlé que dans sa
  // ligne basse".
  [OrdinaryType.chief]: new OrdinaryDefinition(OrdinaryType.chief, {
    allowedModifiers: LINES,
  }),
  // The four Parker names as the bands the indenting is applied to — "most
  // frequently to the fesse, though the bend, the pale, and the chevron are
  // sometimes thus treated" — and the barre, which is the bande turned and is
  // drawn along the same line the other way. They are the four the other three
  // lines are written of as well: Duhoux says the denché "du chef, de la fasce,
  // de la bande, de la croix, du sautoir, du chevron, de la bordure", the vivré
  // "du pal, de la fasce, du chevron, de la bande et de quelques autres
  // pièces", and the engrêlé "du chef, du pal, du sautoir, du chevron, de la
  // fasce, de la croix, de la bande, de la bordure, et autres pièces longues" —
  // which is this list and the three bands below it.
  [OrdinaryType.pale]: new OrdinaryDefinition(OrdinaryType.pale, {
    canBeBorneInNumbers: true,
    allowedModifiers: LINES,
  }),
  [OrdinaryType.fess]: new OrdinaryDefinition(OrdinaryType.fess, {
    canBeBorneInNumbers: true,
    allowedModifiers: LINES,
  }),
  // The gemel is a pair of bars in the room of one band, so each bar is a
  // fraction of a fess wide and teeth deep enough to be seen would eat it. The
  // armorials ask for it seldom and the drawing cannot yet answer, so it is left
  // out rather than drawn as a bar that only looks nibbled.
  [OrdinaryType.barGemel]: new OrdinaryDefinition(OrdinaryType.barGemel, {
    canBeBorneInNumbers: true,
  }),
  [OrdinaryType.bend]: new OrdinaryDefinition(OrdinaryType.bend, {
    canBeBorneInNumbers: true,
    allowedModifiers: LINES,
  }),
  [OrdinaryType.bendSinister]: new OrdinaryDefinition(OrdinaryType.bendSinister, {
    canBeBorneInNumbers: true,
    allowedModifiers: LINES,
  }),
  [OrdinaryType.chevron]: new OrdinaryDefinition(OrdinaryType.chevron, {
    canBeBorneInNumbers: true,
    allowedModifiers: LINES,
  }),
  // A single charge for all that it is drawn as two limbs crossing, and
  // repeating it makes crosslets, which are small charges strewn over the field
  // rather than ordinaries. The saltire is the same figure turned, and answers
  // the same way.
  //
  // Neither takes a modified line either, and for the same reason they are one
  // charge: a cross indented is one outline with teeth all round it, not two
  // toothed bands laid across each other, and the limbs drawn apart would cut
  // into one another where they meet. The armorials ask for both — "D'argent, au
  // sautoir denché de sable", and the engrêlé is said "du pal, de la croix, de
  // la bande, du sautoir" in the same breath — so this is a drawing that cannot
  // yet answer and not a blazon nobody writes.
  [OrdinaryType.cross]: new OrdinaryDefinition(OrdinaryType.cross),
  [OrdinaryType.saltire]: new OrdinaryDefinition(OrdinaryType.saltire),
  // The edge of the shield, and a shield has one of those too. Cut along any of
  // the lines it is the one band whose teeth are all on the one side: its outer
  // edge is the outline of the shield and no blazon may cut that, so what the
  // line modifies is where the band ends rather than where it begins. It is the
  // band Parker says the engrailing is "very frequently applied to".
  [OrdinaryType.bordure]: new OrdinaryDefinition(OrdinaryType.bordure, {
    allowedModifiers: LINES,
  }),
};

/** The fewest of an ordinary that is more than one of it. */
export const SEVERAL = 2;

/**
 * One ordinary, in its own tincture, borne once or several times over, and drawn
 * with whatever line the blazon asked for. A band may itself be charged, but
 * that is not in the vocabulary yet: an ordinary here carries a plain tincture
 * and nothing upon it.
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
  /**
   * What the blazon says the band is drawn with, where it says anything: a fess
   * indented is a fess still, and is drawn along a line with teeth in it.
   *
   * Left off rather than named where nothing was said, as the count is, so that
   * a plain fess reads back as the fess it was written as.
   */
  modifier?: Modifier;
  /**
   * The tincture the line is drawn in, where the blazon gives it one of its own
   * rather than letting it take the band's: "D'or à la bande de gueules engrêlée
   * de sable", where the bande is red and the engrailing black.
   *
   * It is the line that is painted and not a second band laid under the first.
   * The band keeps its width and its place and its own tincture between the
   * notches; what this paints is the cut beyond them, which is the part of the
   * band the line added. So it is carried beside the modifier rather than being
   * a bearing of its own, exactly as the modifier is carried beside the term.
   *
   * It says nothing without a modifier to say it of, and only a modified line
   * will take one — which is the model's to know and is declared with the
   * modifier. Left off where the blazon named none, the line then being drawn in
   * the band's own tincture, which is what every armorial that says nothing
   * means.
   */
  modifierTincture?: Tincture;
};

/**
 * The modifiers an ordinary may be drawn under, in the order they are declared.
 *
 * Named apart from the charges' own pair of questions rather than beside them,
 * the two vocabularies being answered from one place: a band and a charge are
 * asked the same thing and neither list is the other's.
 */
export function modifiersOn(type: OrdinaryType): readonly Modifier[] {
  return OrdinaryDefinitions[type].allowedModifiers;
}

/**
 * Whether an ordinary may be drawn under a modifier.
 *
 * Asked of the term rather than of the word, because the answer is the same in
 * every tongue: a fasce is no likelier to be dentelée than a fess is to be
 * indented.
 */
export function admitsModifier(type: OrdinaryType, modifier: Modifier): boolean {
  return modifiersOn(type).includes(modifier);
}

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
