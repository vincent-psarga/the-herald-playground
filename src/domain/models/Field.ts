import type { Blazon } from './Blazon';
import { ChargeType } from './Charge';
import { Tincture } from './Tinctures';

/**
 * The field terms: every way a field may be painted, in one vocabulary.
 *
 * Four kinds of thing are named here — a field of one tincture, a field divided
 * along a line into parts each of which is arms, that line taken over and over
 * into a row of equal pieces, and a pelt cut from two tinctures — and they are
 * named together because a blazon names them in the same place, first of all,
 * before anything the field bears. Which kind a term belongs to is declared with
 * the term below, once, and every reading, writing and drawing of it is settled
 * by that declaration.
 *
 * The plain field is a term here like the rest, though it names no cut of the
 * field: it is what a field is when nothing has been done to it, and naming it
 * is what lets every field answer for what it is rather than one of the four
 * being whatever the others are not.
 *
 * Nothing here is an ordinary, though several share a name with one: a field may
 * be divided per fess or charged with a fess, and what tells those apart is the
 * word in front, which is the language's business rather than the model's.
 */
export enum FieldType {
  plain = 'FieldType.plain',

  // The partitions, each named after the line that divides the field. The first
  // tincture named takes the half in chief: the upper one, or the one at dexter
  // where the two stand side by side.
  //
  // The last two are named after lines that cross themselves, and cut the field
  // into four rather than two: quarters taken two apiece, so that the first
  // tincture still has the half in chief. They are named per cross and per
  // saltire rather than quarterly, because every partition here is named after
  // its line rather than after what the line leaves — and because heraldry calls
  // both of them quartered and would have left the pair sharing one name.
  //
  // Each repeats two of the four lines above it: per cross is the pale and the
  // fess together, per saltire the bend and the bend sinister. So the quarters
  // of the one stand square and the quarters of the other stand on their points,
  // which is the whole of the difference between them.
  pale = 'FieldType.pale',
  fess = 'FieldType.fess',
  bend = 'FieldType.bend',
  bendSinister = 'FieldType.bendSinister',
  cross = 'FieldType.cross',
  saltire = 'FieldType.saltire',

  // The varied fields: a field cut along one line over and over, into an even
  // number of equal pieces of two tinctures laid alternately.
  //
  // Four of them repeat a line a partition already divides along — barry the
  // fess, paly the pale, bendy the bend, chevronny the chevron — and are named
  // after the charge rather than the partition, because what they repeat is the
  // band. The fifth repeats no straight line at all: pily is a row of long
  // triangles driven into each other point first, which French calls émanché.
  barry = 'FieldType.barry',
  paly = 'FieldType.paly',
  bendy = 'FieldType.bendy',
  pily = 'FieldType.pily',
  chevronny = 'FieldType.chevronny',

  // The furred fields: a field covered not with a line repeated but with a pelt,
  // cut from two tinctures the blazon names rather than from the pair the fur is
  // understood to have. Vair is a tincture and is always argent and azure;
  // vairy is the same bells in whatever two tinctures are given, which is why
  // the pair has to be said and why this is a field rather than a tincture.
  vairy = 'FieldType.vairy',
}

/**
 * What kind of field a term names, which is the one thing that tells the terms
 * apart.
 *
 * Nothing about a term's spelling says which kind it is, and nothing about the
 * shape of the field it makes says so either: a varied field and a furred one
 * carry a type and the same two tinctures, the words for every kind stand in the
 * same place in a blazon, and the shapes that differ differ in what the kind
 * needed rather than in anything that could be read back off them. So the kind
 * is declared with the term and read off the declaration, and a term added to
 * the vocabulary belongs to no kind until it is given one.
 */
export enum FieldKind {
  plain = 'FieldKind.plain',
  division = 'FieldKind.division',
  variation = 'FieldKind.variation',
  furred = 'FieldKind.furred',
}

/**
 * What is true of a field term whatever blazon names it: which kind of field it
 * makes, and what may be said of that kind.
 *
 * It is not the drawing and it is not the word. A field term belongs to the
 * model, and what may be said of it is the model's to know — a bandé is cut into
 * six pieces where its blazon counts none, and it is cut into six in either
 * tongue, so neither vocabulary should have to hold the answer.
 *
 * A subclass per kind rather than one class with a flag apiece, because the
 * kinds differ in what can be asked of them and not merely in what they answer:
 * a varied field is cut into a number of pieces and a pelt is cut to no number
 * at all, so asking a fur how many pieces it has is a question with no meaning
 * rather than one with a dull answer.
 */
export abstract class FieldDefinition<K extends FieldKind = FieldKind> {
  protected constructor(
    public readonly type: FieldType,
    public readonly kind: K
  ) {}
}

/** A field of one tincture, which has nothing further to declare. */
export class PlainDefinition extends FieldDefinition<FieldKind.plain> {
  constructor(type: FieldType) {
    super(type, FieldKind.plain);
  }
}

/**
 * A field divided along a line, and into how many parts that line cuts it.
 *
 * The line is drawn where its name says and the parts are all of a size, so the
 * count is the only thing such a term has to declare — and it has to, because a
 * line that crosses itself leaves four parts where a line drawn once leaves two.
 *
 * It is declared here and not in a vocabulary because the answer is the same in
 * every tongue: écartelé leaves four quarters and so does quarterly, and neither
 * tongue is free to disagree. Everything that reads, writes or draws a divided
 * field asks this rather than counting for itself, so a partition added with the
 * wrong count is wrong in one place instead of five.
 */
export class DivisionDefinition extends FieldDefinition<FieldKind.division> {
  /** How many parts the line cuts the field into: two, or four where it crosses itself. */
  public readonly parts: number;

  constructor(type: FieldType, opts?: Partial<{ parts: number }>) {
    super(type, FieldKind.division);
    this.parts = opts?.parts ?? HALVES;
  }
}

/** The parts a line drawn once leaves, which is what most partitions leave. */
export const HALVES = 2;

/** The parts a line that crosses itself leaves: the quarters. */
export const QUARTERS = 4;

/** A field cut along one line over and over, and how it is counted. */
export class VariationDefinition extends FieldDefinition<FieldKind.variation> {
  /**
   * How many pieces the field is cut into where its blazon names no number.
   *
   * Nothing where neither tongue settles one, which is a field that must be
   * counted or refused rather than guessed at.
   */
  public readonly usualPieces: number | undefined;
  /**
   * Whether it counts its pieces in even numbers only, the tinctures having to
   * alternate along the row.
   */
  public readonly evenPieces: boolean;

  constructor(
    type: FieldType,
    opts?: Partial<{
      usualPieces: number;
      evenPieces: boolean;
    }>
  ) {
    super(type, FieldKind.variation);
    this.usualPieces = opts?.usualPieces;
    this.evenPieces = opts?.evenPieces ?? true;
  }
}

/**
 * A field covered with a pelt, which has nothing further to declare. Nothing
 * here is counted: a varied field's pieces belong to its blazon because cutting
 * a line four times and cutting it eight say two different things, where a pelt
 * is cut to no such number and neither tongue asks for one.
 */
export class FurDefinition extends FieldDefinition<FieldKind.furred> {
  constructor(type: FieldType) {
    super(type, FieldKind.furred);
  }
}

/**
 * Every field term, and what may be said of it.
 *
 * Keyed on FieldType, so a term added to the vocabulary breaks this until it has
 * been said what kind of field it makes and what that kind needs told — which is
 * the question worth asking of a new term, and the one easiest to forget.
 *
 * Kept as written rather than widened to the base class, so that the kind each
 * term belongs to survives in the type and the terms of one kind can be read
 * back off this table instead of being listed a second time.
 */
export const FieldDefinitions = {
  [FieldType.plain]: new PlainDefinition(FieldType.plain),

  [FieldType.pale]: new DivisionDefinition(FieldType.pale),
  [FieldType.fess]: new DivisionDefinition(FieldType.fess),
  [FieldType.bend]: new DivisionDefinition(FieldType.bend),
  [FieldType.bendSinister]: new DivisionDefinition(FieldType.bendSinister),
  // The two whose line crosses itself, and the only terms here that leave more
  // than two parts. Both are quartered — the one into squares and the other into
  // triangles — and a quarter carries a coat exactly as a half does.
  [FieldType.cross]: new DivisionDefinition(FieldType.cross, { parts: QUARTERS }),
  [FieldType.saltire]: new DivisionDefinition(FieldType.saltire, { parts: QUARTERS }),

  // Six pieces for the four that repeat a line: both tongues understand six and
  // neither writes it — "Le bandé est normalement divisé en six pièces (qu'on ne
  // blasonne pas)" — and where a tongue allows six or eight, as both do of the
  // chevronny, six is what the armorials here write.
  [FieldType.barry]: new VariationDefinition(FieldType.barry, { usualPieces: 6 }),
  [FieldType.paly]: new VariationDefinition(FieldType.paly, { usualPieces: 6 }),
  [FieldType.bendy]: new VariationDefinition(FieldType.bendy, { usualPieces: 6 }),
  // The pily is understood to have no number of pieces and is counted odd as
  // readily as even, being the one varied field whose pieces interlock rather
  // than follow one another: piles driven up from the base between the piles
  // driven down from the chief leave a whole pile at either flank when the count
  // is odd, which is the shape the field falls into of itself. Parker counts a
  // pily "of seven traits" as readily as of six, the piles and the intervals
  // being counted alike, and neither tongue settles a number for it — Parker
  // says the pieces "should be mentioned" and the French armorials write
  // "émanché de deux pièces" as readily as any other count. So a pily whose
  // blazon names no number is refused rather than guessed at.
  [FieldType.pily]: new VariationDefinition(FieldType.pily, { evenPieces: false }),
  [FieldType.chevronny]: new VariationDefinition(FieldType.chevronny, { usualPieces: 6 }),

  [FieldType.vairy]: new FurDefinition(FieldType.vairy),
} as const satisfies Record<FieldType, FieldDefinition>;

/**
 * The terms of one kind, read off the definitions rather than listed again.
 *
 * Which terms make a division is said once, where each term is declared, and
 * asked of the declarations here. Listed a second time it could fall out of step
 * with them; read off them, a term declared under another kind moves here of
 * itself, and the shape of the field it makes moves with it.
 */
type FieldTypesOf<K extends FieldKind> = {
  [T in FieldType]: (typeof FieldDefinitions)[T]['kind'] extends K ? T : never;
}[FieldType];

/** The partitions: the terms that divide a field along a line. */
export type DivisionType = FieldTypesOf<FieldKind.division>;

/** The varied fields: the terms that repeat a line into a row of pieces. */
export type VariationType = FieldTypesOf<FieldKind.variation>;

/** The furred fields: the terms whose pelt covers the field entire. */
export type FurType = FieldTypesOf<FieldKind.furred>;

/**
 * The terms of one kind as a list, in the order the vocabulary declares them.
 *
 * What it kept is promised rather than proved — a filter cannot show the
 * compiler that a term whose kind it has just read is a term of that kind — but
 * the promise is read off the very declarations the type is derived from, so the
 * list and the type cannot come to disagree.
 */
function termsOf<K extends FieldKind>(kind: K): readonly FieldTypesOf<K>[] {
  return Object.values(FieldType).filter(
    (type): type is FieldTypesOf<K> => FieldDefinitions[type].kind === kind
  );
}

export const DIVISIONS: readonly DivisionType[] = termsOf(FieldKind.division);
export const VARIATIONS: readonly VariationType[] = termsOf(FieldKind.variation);
export const FURS: readonly FurType[] = termsOf(FieldKind.furred);

/** What kind of field a term names. */
export function kindOf(type: FieldType): FieldKind {
  return FieldDefinitions[type].kind;
}

/** How many pieces this varied field has where a blazon names none. */
export function usualPieces(type: VariationType): number | undefined {
  return FieldDefinitions[type].usualPieces;
}

/**
 * The fewest pieces a field can be cut into and still be varied rather than
 * merely divided.
 */
export const PIECES = 2;

/**
 * Whether this is a number of pieces such a field may be cut into.
 *
 * Four of the five count evenly: the tinctures alternate along a row of stripes,
 * so the last piece must not repeat the first, and an odd count is how heraldry
 * says something else entirely — a field of five stripes is three bars borne on
 * a field of two, which is a charge and no variation at all.
 */
export function cutInPieces(type: VariationType, pieces: number): boolean {
  return pieces >= PIECES && (!FieldDefinitions[type].evenPieces || pieces % 2 === 0);
}

/**
 * What a blazon lays its charges on: one tincture, or two — divided along a
 * line, cut along that line over and over into a row of equal pieces, or covered
 * with a fur cut from the pair.
 */
export type Field = Plain | Division | Variation | Furred;

/**
 * A field of one tincture, which a blazon may have sown a charge over.
 *
 * Being sown is the field's own state and not something it bears: a semy is
 * drawn small, runs off every edge, and is past counting, where a charge is
 * counted and will one day be placed. So it is held here rather than among the
 * charges, and a field with nothing sown on it is the plain field it always was.
 */
export type Plain = {
  type: FieldType.plain;
  tincture: Tincture;
  /** What the field is sown with, where it is sown at all. */
  semy?: Semy;
};

/**
 * A charge sown over the field: "the field is sown or strewed over with several
 * of the charges named, drawn small and without any reference to the number".
 *
 * There is no count here and there never will be one — that is what the word
 * means. Nor is there a place: a semy covers the field entire.
 *
 * One charge, for now. A field sown with two of them alternately — "semé alterné
 * de tours et de fleurs de lys" — is a second list and is not read.
 *
 * Only a plain field carries one, which is no bar to sowing a divided field: a
 * half is arms with a plain field of its own, and the sowing belongs to that
 * field. Both tongues say which half — "Parti de gueules semé de larmes
 * d'argent, et de sinople semé de larmes d'or" sows each with its own — and both
 * are read. What no tongue says here is a sowing laid over a divided field
 * entire, and nothing holds one.
 */
export type Semy = {
  type: ChargeType;
  tincture: Tincture;
};

/**
 * A field divided along a line, and what each part of it carries.
 *
 * A part is arms and not a tincture, because heraldry charges one: "Parti
 * d'azur à trois fleurs de lys d'or et d'hermine" divides the field per pale,
 * sets three lilies on the half at dexter, and leaves the other half the fur it
 * named. The half at dexter is a shield's worth of blazon and is held as one.
 *
 * The part that carries nothing but a tincture — which is what most parts carry
 * — is arms that bear nothing, its list left off exactly as a plain field's is.
 * So there is one way to say a part and not two, and a part read from "parti
 * d'azur et d'or" comes back out as the tincture it was written as.
 *
 * A list rather than a part apiece, because how many there are is the term's to
 * say: a line drawn once leaves two and a line that crosses itself leaves four,
 * and every one of them is a part in the same sense. The list is as long as the
 * term declares — nothing here is free to hold three — and what holds it to that
 * is `dividedInto`, which is asked wherever a division is built.
 *
 * They stand in the order a blazon ranks them, which both tongues number from
 * the part in chief: the upper, or the one at dexter where two stand side by
 * side. Of four they run along the chief and then along the base, so the parts
 * ranked 1 and 4 stand corner to corner.
 */
export type Division = {
  type: DivisionType;
  parts: readonly Blazon[];
};

/** A part that carries one tincture and bears nothing, as most parts do. */
export function half(tincture: Tincture): Blazon {
  return { field: { type: FieldType.plain, tincture } };
}

/** How many parts this partition's line cuts the field into. */
export function partsOf(type: DivisionType): number {
  return FieldDefinitions[type].parts;
}

/** Whether this is as many parts as the partition leaves, no more and no fewer. */
export function dividedInto(type: DivisionType, parts: number): boolean {
  return parts === partsOf(type);
}

/**
 * The parts of a field a blazon said two things about, which is what the short
 * form of every partition says however many parts the line leaves.
 *
 * Two parts take one apiece. Four take them cornerwise — the first in the parts
 * ranked 1 and 4, the second in the two between them — which is what both
 * tongues mean by "écartelé d'argent et d'azur", and what puts the first in the
 * part in chief either way.
 *
 * The rule lives here rather than with whatever is filling the parts out,
 * because it is the same rule for a blazon being read, one being written and one
 * being shown: which parts a pair falls into is a fact about the line.
 */
export function fillingOut(type: DivisionType, first: Blazon, second: Blazon): readonly Blazon[] {
  return partsOf(type) === QUARTERS ? [first, second, second, first] : [first, second];
}

/** The same, for the commonest thing a blazon says of two parts: their tinctures. */
export function painted(type: DivisionType, first: Tincture, second: Tincture): readonly Blazon[] {
  return fillingOut(type, half(first), half(second));
}

/**
 * A varied field, and how many pieces it is cut into, counting both tinctures.
 *
 * The count is always known rather than left to be assumed, because what a
 * blazon leaves unsaid is its language's to supply and a drawing knows no
 * language.
 *
 * The first tincture named takes the first piece, as it takes the half in chief
 * of a partition: the topmost, or the one at dexter where they stand side by
 * side.
 */
export type Variation = {
  type: VariationType;
  firstTincture: Tincture;
  secondTincture: Tincture;
  pieces: number;
};

export type Furred = {
  type: FurType;
  firstTincture: Tincture;
  secondTincture: Tincture;
};

/**
 * Which kind a field's term was declared under is what tells the four apart: a
 * varied field and a furred one carry a type and the same two tinctures, and
 * nothing about the shape of the object says which it is.
 *
 * Each is asked after by name rather than left to be whatever the others are
 * not, so that a kind added to the vocabulary is refused by all four until it is
 * given a question of its own.
 */
export function isPlain(field: Field): field is Plain {
  return kindOf(field.type) === FieldKind.plain;
}

export function isDivision(field: Field): field is Division {
  return kindOf(field.type) === FieldKind.division;
}

export function isVariation(field: Field): field is Variation {
  return kindOf(field.type) === FieldKind.variation;
}

export function isFurred(field: Field): field is Furred {
  return kindOf(field.type) === FieldKind.furred;
}
