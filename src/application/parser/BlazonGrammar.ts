import {
  ParseResult,
  Parser,
  ParserOutput,
  Token,
  alt,
  apply,
  betterError,
  combine,
  kleft,
  kright,
  nil,
  resultOrError,
  rule,
  seq,
  succ,
  tok,
} from 'typescript-parsec';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { ChargedPlainField } from '../../domain/errors/parsing/ChargedPlainField';
import { InvalidTincture } from '../../domain/errors/parsing/InvalidTincture';
import { MissingPieces } from '../../domain/errors/parsing/MissingPieces';
import { RepeatedAttribute } from '../../domain/errors/parsing/RepeatedAttribute';
import { UndividedField } from '../../domain/errors/parsing/UndividedField';
import { UntincturedModifier } from '../../domain/errors/parsing/UntincturedModifier';
import { WrongAttribute } from '../../domain/errors/parsing/WrongAttribute';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { Attribute, Attributed, namesPart } from '../../domain/models/Attributes';
import { Blazon, ChargeOrOrdinary } from '../../domain/models/Blazon';
import { COUNTERCHANGED, Tinctured, isCounterchanged } from '../../domain/models/Counterchanged';
import {
  Division,
  DivisionType,
  Field,
  FieldType,
  FurType,
  Furred,
  PIECES,
  Variation,
  cutInPieces,
  fillingOut,
  isCounterchangeable,
  partsOf,
  usualPieces,
} from '../../domain/models/Field';
import { Modifier, takesTincture } from '../../domain/models/Modifier';
import { FIRST, ranksOf } from '../../domain/translations/Ranks';
import { Tincture } from '../../domain/models/Tinctures';
import { TermWord } from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { BorneTerm, BorneType, bearsPart, bornUnder, carried, inCompons } from './Borne';
import { begunBy, guard, optional, optionalUnlessBegun, present, unless } from './Combinators';
import { asRank, asTincture, complaining, owedAtEnd, positionOf, within } from './Failures';
import { Treatment, isBare } from './Treatment';
import { VariedField } from './Variations';

/**
 * What one language contributes to reading a blazon. The shape of a blazon is
 * the same in every language — a field, plain or divided between two halves — so
 * only the words and whatever introduces them differ.
 */
export interface BlazonGrammar {
  /** A tincture, with whatever article the language puts in front of it. */
  readonly tincture: Parser<TokenKind, Tincture>;
  /**
   * The tincture something borne is named in, where a tongue names it otherwise
   * for some figures than for the rest: a drop may be poured — "gouttes de
   * sang" — where a band is only ever gules. A tongue that names every figure's
   * tincture alike leaves this off, and the tincture is read for all of them.
   */
  readonly tinctureOf?: (type: BorneType) => Parser<TokenKind, Tincture>;
  /** The name of a partition. */
  readonly division: Parser<TokenKind, DivisionType>;
  /**
   * The name of a furred field. Nothing follows it but the two tinctures its
   * pelt is cut from: a fur is cut to no number of pieces, so neither tongue
   * counts anything here.
   */
  readonly fur: Parser<TokenKind, FurType>;
  /**
   * The name of a varied field, with however many pieces the language counts
   * before naming the tinctures: "barry of six", where French says only "fascé".
   */
  readonly variation: Parser<TokenKind, VariedField>;
  /**
   * However many pieces the language counts after the tinctures — "de six
   * pièces" — where it counts them there at all. English does not, and leaves
   * this off.
   */
  readonly pieces?: Parser<TokenKind, number>;
  /**
   * What the language says of a field of one tincture beyond naming it: that it
   * is bare, or what it is sown with. A language that says neither leaves this
   * off, as English leaves off a plain field's own word for being plain.
   */
  readonly treatment?: Parser<TokenKind, Treatment>;
  /**
   * The name of a band or a charge, with whatever says the field bears it, and
   * how many. Both are named by the same phrase, so both are read by one rule.
   *
   * What the blazon may then say of it — that it is voided, that its stone is
   * argent — comes back on the term rather than being asked for separately,
   * because both kinds of word agree with what the phrase called the charge and
   * the phrase is the only thing that knows what it called it. A tongue whose
   * blazons say nothing of the sort hands back nothing, and nothing is read.
   */
  readonly borne: Parser<TokenKind, BorneTerm>;
  /**
   * What the language writes after a bearing to say it is laid over everything
   * else the field carries: "à trois bandes de gueules brochant".
   *
   * Left off by a language that writes it somewhere else. English writes "over
   * all" before what it is said of, which is inside the phrase that names the
   * bearing and comes back on the term itself; French writes its participle
   * after the tincture, where only this can reach it.
   *
   * A blazon may set its own mark before the words — "au chef d'azur, brochant
   * sur le tout" — so whatever the language lets stand there is read by this
   * rule, the mark between one bearing and the next belonging to the next.
   */
  readonly overAll?: Parser<TokenKind, unknown>;
  /**
   * What the tongue says in place of a tincture where what is borne takes the
   * field's own two, reversed: "de l'un à l'autre", "counterchanged".
   *
   * It is read where a tincture is read because it is said where a tincture is
   * said and answers the same question — what the figure is painted with — and a
   * tongue that has no phrase for it leaves this off, and nothing is read.
   *
   * What comes back is the phrase as the tongue writes it rather than the thing
   * it means, which every tongue means alike: a name that will not be painted
   * this way has to be refused by a complaint quoting what was written, and a
   * tongue spelling the phrase several ways is owed the one it writes back.
   */
  readonly counterchanged?: Parser<TokenKind, string>;
  /** The conjunction joining the halves of a divided field. */
  readonly and: Parser<TokenKind, unknown>;
  /**
   * The ranks one phrase of a divided field is introduced by, where the tongue
   * ranks its parts: "au premier", "au 1", "au I", and "aux 1 et 4" where one
   * phrase speaks for several. What comes back is which parts it names, counting
   * from one.
   *
   * It is what lets either part carry arms of its own, the unranked form being
   * able to charge the first alone — and it is the form the handbooks prescribe
   * where a part carries anything: «on énonce d'abord la partition, puis les
   * armoiries élémentaires se blasonnent les unes après les autres, dans l'ordre
   * de la partition, en les faisant précéder de leur rang».
   *
   * A tongue that does not rank them leaves this off. English is one: it sets
   * two whole coats side by side another way, naming the dexter first and saying
   * "impaled with" between them — "It is necessary always to mention the dexter
   * shield first and to say impaled with" — which is a phrase of its own and no
   * rank at all. Where English does rank, it ranks quarters, and quartering is
   * not read yet.
   */
  readonly rank?: Parser<TokenKind, readonly number[]>;
}

/** One phrase of a ranked division: the parts it names, and what they all carry. */
type RankedPart = {
  readonly ranks: readonly number[];
  readonly arms: Blazon;
};

/**
 * Why this phrase's ranks cannot be the next ones, and nothing where they can.
 *
 * Four things can be wrong and each is reported as itself, because each is a
 * different mistake by whoever wrote the blazon: a rank the field has no part
 * for, a part ranked twice, a phrase whose own ranks run backwards, and a phrase
 * that begins somewhere other than where the order had got to.
 *
 * The order is the order the partition takes the parts — "dans l'ordre de la
 * partition" — read of a phrase rather than of a single rank, so that a phrase
 * speaking for several parts is in order when the first of them is the one owed.
 * That is what lets "aux 1 et 4 ..., aux 2 et 3" stand while "aux 2 et 3 ...,
 * aux 1 et 4" is refused: both name every part once, and only one of them starts
 * where the blazon had got to.
 */
function misranked(
  type: DivisionType,
  taken: readonly number[],
  ranks: readonly number[]
): string | undefined {
  const parts = partsOf(type);
  const owed = ranksOf(parts).find((rank) => !taken.includes(rank));
  const named = [...taken];
  for (const [at, rank] of ranks.entries()) {
    if (rank < FIRST || rank > parts) {
      return `A field divided into ${parts} has no part ${rank}`;
    }
    if (named.includes(rank)) {
      return `A divided field ranks each part once: part ${rank} is ranked twice`;
    }
    if (at === 0 && rank !== owed) {
      return `A divided field names its parts in the order the partition takes them: part ${rank} stands where part ${owed} was owed`;
    }
    if (at > 0 && rank < ranks[at - 1]) {
      return `A divided field names its parts in the order the partition takes them: part ${rank} stands after part ${ranks[at - 1]}`;
    }
    named.push(rank);
  }
  return undefined;
}

/**
 * The parts in the order the partition takes them, each carrying what the phrase
 * that ranked it gave it.
 *
 * The arms of a phrase naming several parts are laid in every one of them, which
 * is what such a phrase says: "aux 1 et 4 d'azur au chevron d'or" puts the same
 * coat in both quarters. They are the same object in each, nothing here ever
 * changing one, and the drawing reads them apart by the part it is drawing.
 */
function inRankOrder(ranked: readonly RankedPart[]): readonly Blazon[] {
  const parts: Blazon[] = [];
  for (const { ranks, arms } of ranked) {
    for (const rank of ranks) {
      parts[rank - FIRST] = arms;
    }
  }
  return parts;
}

/** The mark a blazon may set between the charges it lays on the field. */
const SEPARATOR = tok(TokenKind.Separator);

/**
 * A field as it was read, and whether the blazon called it bare.
 *
 * Being called bare is no part of the field — "plain" is written and never
 * written back — but it governs what may follow, so it travels alongside as far
 * as the rule that reads what follows and is dropped there.
 */
type ReadField = { readonly field: Field; readonly bare: boolean };

/**
 * What stands where a tincture stands, and how the blazon wrote it.
 *
 * The writing travels beside the reading only as far as the rule that judges it.
 * A tincture read in full is quoted back by the rule that read it, so it carries
 * nothing here; the phrase that says a figure takes the field cannot be, the
 * tongue spelling it several ways and the complaint wanting the one the blazon
 * would come back in. So the tongue hands over what it read, and it is dropped
 * the moment the name has accepted it.
 */
type Painting = { readonly painted: Tinctured; readonly written: string };

export function blazonRule(grammar: BlazonGrammar): Parser<TokenKind, Blazon> {
  // A plain field is its tincture, and whatever the language lets a blazon say
  // about it: that it is bare, or what it has been sown with.
  //
  // Optional until it has begun. A field that says nothing more than its
  // tincture is the commonest blazon there is, so nothing may be owed here — but
  // "semé" having been read, what follows it is owed, and the complaint belongs
  // to the blazon rather than to the grammar quietly trying something else.
  const treatment: Parser<TokenKind, Treatment | undefined> =
    grammar.treatment === undefined ? nil() : optionalUnlessBegun(grammar.treatment);

  const plainField = apply(seq(grammar.tincture, treatment), ([tincture, treatment]): ReadField =>
    treatment === undefined
      ? { field: { type: FieldType.plain, tincture }, bare: false }
      : isBare(treatment)
        ? { field: { type: FieldType.plain, tincture }, bare: true }
        : { field: { type: FieldType.plain, tincture, semy: treatment.semy }, bare: false }
  );

  // What the field bears is laid on it and carries a tincture of its own, however
  // many of it are borne: two chevrons are two bands of one tincture, not two
  // charges each with its own, and three billets are three of one tincture too.
  // A plain thing, at that: a charge upon a charge, a band drawn with a modified
  // line, and where on the field a charge stands are all still outside the
  // vocabulary.
  //
  // Which tinctures may follow is the name's own affair — a besant is a gold
  // coin and there is no blue one — so the tincture is read after the name has
  // been read rather than beside it, and the word that was written decides what
  // it will take and what it means when nothing follows at all.
  //
  // What may then be said of it — that it is voided — stands between the name and
  // the tincture, which is where the armorials of both tongues put it: "two bars
  // voided gules", "à la croix vidée de gueules". It is read after the tincture
  // as well, and never twice, an armorial being free to say it late and nothing
  // being gained by refusing to understand one that does.
  //
  // Which of the two places it was written in is not kept. Where a thing is said
  // is no part of what was said, and the writer puts it back where the armorials
  // put it.
  //
  // A modifier said late may carry a tincture of its own after it — "à la bande
  // de gueules engrêlée de sable", where the bande is red and its engrailing
  // black. Late and never early, which is what makes the phrase decidable: a
  // tincture after a modifier is the band's own wherever the band has not had one
  // yet, and the same armorial writes both — "au sautoir engrêlé de gueules" is a
  // red saltire and not a saltire engrailed in red. So the second tincture is
  // read only where a first one has already been, and a blazon with one tincture
  // reads as it always did.
  //
  // Whichever place it stands in, it is read by the phrase that named the charge
  // rather than by this rule: the words that may stand there have to agree with
  // what the blazon called the charge, and only the phrase knows what it called
  // it. What comes back is checked against the charge itself, that being a thing
  // no tongue disagrees about.
  //
  // What the blazon says was painted apart from the rest comes last of all, after
  // the tincture the charge itself carries — "three gem-rings argent stoned azure"
  // — and is read nowhere else: a part is owed a tincture of its own, so written
  // before the charge's it would leave two tinctures running together with nothing
  // to say which was which. It stands after a painted line too, each tincture
  // following the word it belongs to.
  //
  // The count is left off rather than set to one when a single one is borne, so
  // that a fess reads back as the fess it was before a field could bear two.
  //
  // The tincture may be no tincture at all: a tongue may say instead that what is
  // borne takes the field's own two, reversed, and that is said exactly where a
  // tincture would be said.
  //
  // Whether the name will take it is the word's own affair, as the tinctures it
  // will take are: a name chosen for a tincture has already said what the figure
  // is painted with, and a figure painted out of a divided field is painted two
  // things at once and neither of them the word's. So "au besant de l'un à
  // l'autre" is refused by the very rule that refuses "au besant d'azur", and
  // French, having no name for a disc of no particular tincture, cannot
  // counterchange one at all.
  //
  // Or the band may be cut into compons of two tinctures, the word saying so
  // standing where the tincture would and the two tinctures following it as a
  // varied field's follow its name: "à la bordure componée de gueules et
  // d'argent". Whether the band may be is the model's to say, and a band that
  // may not is refused by name once the word has been read — "à la jumelle
  // componée" is a word this vocabulary holds, said of a band it is never said
  // of. A band drawn along a modified line is cut into compons all the same:
  // "à la bordure engrêlée componée d'or et de gueules".
  //
  // The count is left off rather than set to one when a single one is borne, so
  // that a fess reads back as the fess it was before a field could bear two.
  const tinctureOf = grammar.tinctureOf ?? (() => grammar.tincture);
  const paintedWith = (borne: BorneTerm): Parser<TokenKind, Tinctured> => {
    const tincture = carried(tinctureOf(borne.type), borne.word);
    const phrase = grammar.counterchanged;
    const compony = borne.compony;
    if (phrase === undefined && compony === undefined) {
      return tincture;
    }
    // The tincture is offered first, so that a phrase which is neither is
    // reported as a tincture gone wrong: that is what almost every such phrase
    // is, and the two readings fail at the same word often enough for the order
    // to be what settles it.
    const tinctured = apply(tincture, (tincture): Painting => ({ painted: tincture, written: '' }));
    const named =
      phrase === undefined
        ? tinctured
        : alt(
            tinctured,
            apply(phrase, (written): Painting => ({ painted: COUNTERCHANGED, written }))
          );
    // The word for compony is no tincture and opens no phrase but its own, so
    // once it is written nothing else is tried: a refusal of it — a band never
    // cut so, a word that does not agree — is what the blazon is owed, and would
    // otherwise lose to the tincture failing at the same word.
    const read =
      compony === undefined
        ? named
        : begunBy(
            compony,
            guard(
              apply(
                seq(compony, tinctureOf(borne.type), grammar.and, tinctureOf(borne.type)),
                ([written, first, , second]): Painting => ({
                  painted: { compony: [first, second] },
                  written,
                })
              ),
              () => inCompons(borne.type),
              ({ written }, position) => new WrongModifier(borne.word.value, written, position)
            ),
            named
          );
    return apply(
      guard(
        read,
        ({ painted }) => borne.word.accepts(painted),
        ({ written }, position) => new InvalidTincture(borne.word.value, written, position)
      ),
      ({ painted }) => painted
    );
  };

  // What a tongue writes after a bearing to lay it over everything else, where
  // it writes it there at all. English writes it before instead, and the words
  // come back on the term; a tongue that writes it in neither place reads none.
  const laidOverAll: Parser<TokenKind, unknown> =
    grammar.overAll === undefined ? nil() : optional(grammar.overAll);

  const bearing = within(
    combine(grammar.borne, (borne) =>
      combine(modifying(borne), (early) =>
        combine(paintedWith(borne), (tincture) =>
          combine(early === undefined ? modifying(borne) : nil(), (late) =>
            combine(painting(late, grammar.tincture), (line) =>
              combine(attributing(borne, grammar.tincture, grammar.and), (painted) =>
                apply(laidOverAll, (over): ChargeOrOrdinary => {
                  const one =
                    borne.count === undefined
                      ? { type: borne.type, tincture }
                      : { type: borne.type, tincture, count: borne.count };
                  // The name may have said it already: a mascle is a lozenge
                  // voided and says so by being the word it is, so where the
                  // blazon wrote no modifier the word supplies its own.
                  const modifier = early?.term ?? late?.term ?? borne.word.defaultModifier;
                  const modified =
                    modifier === undefined
                      ? one
                      : line === undefined
                        ? { ...one, modifier }
                        : { ...one, modifier, modifierTincture: line };
                  const said =
                    painted.length === 0 ? modified : { ...modified, attributes: painted };
                  // Said before the name or said after the tincture, as the
                  // tongue writes it; the model keeps that it was said and not
                  // where.
                  return borne.overAll === true || over !== undefined
                    ? { ...said, overAll: true }
                    : said;
                })
              )
            )
          )
        )
      )
    )
  );

  // Everything a field bears, read in the order it was written, because that
  // order is what says which covers which: "D'or à trois bandes de sable ; à la
  // bordure de gueules" puts the bordure over the bends.
  //
  // A blazon may set a mark between the phrases — French writes the semicolon as
  // readily as the comma — or set none at all and let the article do the work,
  // so the mark is read and discarded rather than required.
  //
  // What may stand in the list is handed in rather than fixed, because a part of
  // a divided field ends where the next part's rank begins and the shield ends
  // only where the blazon does.
  const listOf = (
    one: Parser<TokenKind, ChargeOrOrdinary>
  ): Parser<TokenKind, readonly ChargeOrOrdinary[]> => {
    const list = rule<TokenKind, readonly ChargeOrOrdinary[]>();
    list.setPattern(
      apply(optionalUnlessBegun(seq(one, list), SEPARATOR), (laid): readonly ChargeOrOrdinary[] =>
        laid === undefined ? [] : [laid[0], ...laid[1]]
      )
    );
    return list;
  };

  const borne = listOf(bearing);

  /**
   * A field and what was laid on it, which is arms: the whole shield's, or one
   * half of a divided field's.
   *
   * The list is left off rather than set to an empty one where nothing was laid,
   * so that a field bearing nothing reads back as the blazon it was before
   * anything could be laid on one — and so that a half has one way to be written
   * and not two.
   */
  const borneOn = (field: Field, laid: readonly ChargeOrOrdinary[]): Blazon =>
    laid.length === 0 ? { field } : { field, chargesOrOrdinaries: laid };

  /**
   * A field, and what the blazon laid on it, which is arms: the whole shield's,
   * or the first half of a divided field's. One rule reads both, a half being
   * arms and there being nothing else it could be read by.
   *
   * A field the blazon called plain is held to it here, where what followed is
   * known: "plain" promises a field that bears nothing, and the promise is kept
   * or the blazon is refused. The bearings are read first and judged after, so
   * the complaint lands on what was laid rather than on the word that forbade it.
   */
  const laidOn = (
    reading: Parser<TokenKind, ReadField>,
    laid: Parser<TokenKind, readonly ChargeOrOrdinary[]> = borne
  ): Parser<TokenKind, Blazon> =>
    combine(reading, ({ field, bare }) =>
      apply(held(laid, field, bare), (borne): Blazon => borneOn(field, borne))
    );

  // The second of the two tinctures a varied or furred field is cut between, the
  // conjunction and all: both read it, and both owe it once the first has been
  // read. A blazon that stops there has named one tincture where the field it
  // named takes two, and saying so is more use than pointing at the conjunction
  // — which is the grammar's own plumbing, and names nothing a reader was trying
  // to write.
  const secondOfThePair = owedAtEnd(kright(grammar.and, grammar.tincture), asTincture);

  // A varied field is the same two tinctures cut along the same lines, over and
  // over — so it is read as a division is, with a number of pieces around it.
  //
  // Where that number stands is the language's business: English counts before
  // the tinctures, French after them, and either may leave it unsaid. What
  // arrives is taken wherever it came from, and what never arrives is the number
  // the term is understood to have — save for the pily, which is understood to
  // have none and must therefore be counted.
  const trailingPieces: Parser<TokenKind, number | undefined> =
    grammar.pieces === undefined ? nil() : optional(grammar.pieces);

  const variedField = within(
    apply(
      guard(
        apply(
          seq(grammar.variation, grammar.tincture, secondOfThePair, trailingPieces),
          ([named, firstTincture, secondTincture, counted]) => ({
            named,
            firstTincture,
            secondTincture,
            pieces: counted ?? named.pieces ?? usualPieces(named.type),
          })
        ),
        ({ named, pieces }) => pieces !== undefined && cutInPieces(named.type, pieces),
        ({ named, pieces }, position) =>
          pieces === undefined
            ? new MissingPieces(named.named, position)
            : new BlazonParseError(
                pieces < PIECES
                  ? `A field is cut into pieces: ${pieces} is not more than one`
                  : `A ${named.named} alternates its tinctures, so its pieces are even: ${pieces} is odd`,
                position
              )
      ),
      // Whatever reaches here was counted: the guard has refused every field
      // whose pieces neither the blazon nor the term itself could say.
      ({ named, firstTincture, secondTincture, pieces }): Variation => ({
        type: named.type,
        firstTincture,
        secondTincture,
        pieces: pieces as number,
      })
    )
  );

  /**
   * What a part of a divided field may be, before anything is laid on it.
   *
   * A field of one tincture, or a field cut into pieces: heraldry quarters a
   * bandé as readily as a plain coat, and the arms of Bourgogne are two of each
   * — "écartelé : aux 1 et 4 bandé d'or et d'azur à la bordure de gueules ; aux
   * 2 et 3 d'azur semé de fleurs de lys d'or". A part is arms, so what a part's
   * field may be is what a shield's field may be, and the two are read by the
   * same rules.
   *
   * Not every one of them yet. A part covered with a pelt and a part cut again
   * are read by neither of these, and are left out because neither can be drawn
   * rather than because a blazon does not say them.
   *
   * The plain reading is listed first, which settles what a reader is told when
   * a word is neither: both fail at that very word, a tie goes to whichever was
   * listed first, and "Unknown tincture" is the useful half of the truth — a
   * part of one tincture being what nearly every part is.
   */
  const partField = alt(
    plainField,
    apply(variedField, (field): ReadField => ({ field, bare: false }))
  );

  // The other half of a divided field, which is a field and not a tincture: it
  // carries whatever the tongue says of a field — that it is plain, what it is
  // sown with, or that it is cut into pieces of its own — which is what the
  // armorials write there: "et d'hermine plain", "et de sinople semé de larmes
  // d'or". Being owed is the tincture's affair all the same, a half that never
  // arrives having failed to name one.
  //
  // A blazon may set its own mark before the conjunction — "à six macles
  // d'argent, et d'hermine" — which says no more than the conjunction does, so it
  // is read and discarded rather than required.
  //
  // It bears nothing: what follows it belongs to the shield.
  const otherHalf = owedAtEnd(
    kright(
      seq(optional(SEPARATOR), grammar.and),
      apply(partField, ({ field }): Blazon => ({ field }))
    ),
    asTincture
  );

  // Wrapped as a phrase so that a tincture which never arrives is reported as
  // missing from the division that owed it, rather than from the blazon at large.
  //
  // Each half is a field, and the first of them may bear what a shield bears:
  // "Parti d'azur à six macles d'argent, et d'hermine plain" charges the half at
  // dexter and calls the other plain, which is how the armorial of the Round
  // Table writes it. What a half bears stands between its tincture and the
  // conjunction, and is read by the very rule that reads what the whole shield
  // bears — a half being arms, there is nothing else it could be read by.
  //
  // This is the form the armorials write and not the one the handbooks
  // prescribe. Where a half carries anything, the handbooks rank the halves
  // instead — "parti, au premier ..., au second ..." — and Greaves has the
  // tinctures follow the partition's name with nothing between: "If the field is
  // parted, this is mentioned at the beginning, starting with the word Per
  // followed by the name of the ordinary that goes the same way as the parting
  // line, followed by the tinctures of the parts". So the English reading of this
  // form is the French one lent to it, on no authority but the symmetry, and the
  // ranked form — which is what will charge the second half — is not read yet.
  //
  // The second half bears nothing, and what follows it belongs to the shield:
  // "Parti d'azur et d'or à la bordure de gueules" surrounds the whole shield
  // with the bordure, which is what an armorial means by writing it there, and
  // what both tongues mark outright where they mean it — "brochant sur le tout",
  // "over all". Let the second half bear it instead and the blazon would have two
  // readings and no way to choose between them.
  //
  // Two tinctures say a quartered field entire, however many parts its line
  // leaves: the parts are filled from the pair rather than read one by one,
  // which is what "écartelé d'argent et d'azur" means and is the only thing this
  // form can say about four parts. A quarter that carries anything of its own
  // has to be ranked.
  const unrankedDivision = within(
    apply(
      seq(grammar.division, laidOn(partField), otherHalf),
      ([type, first, second]): Division => ({
        type,
        parts: fillingOut(type, first, second),
      })
    )
  );

  /**
   * The same field with its parts ranked: "Parti, au premier d'azur à trois
   * fleurs de lys d'or, au second d'hermine", "Écartelé : aux 1 et 4 d'azur au
   * chevron d'or ; aux 2 et 3, d'azur à trois colombes d'argent".
   *
   * This is the form the handbooks prescribe where a part carries anything, and
   * it is what the unranked form cannot do: any part may bear, the rank saying
   * which part the arms after it are laid in, so nothing has to be guessed from
   * where a phrase stands.
   *
   * One phrase may rank several parts, which is how a quartered field says that
   * two of its quarters carry the same coat — and it is the commonest thing a
   * quartered blazon says. The arms are read once and laid in every part the
   * phrase named.
   *
   * How many phrases there are is not fixed: a quartered field is written in
   * four of them or in two, and which it is cannot be known before they are
   * read. So they are read until they stop and counted after — which is also
   * what lets the complaint name the part that was owed rather than the shape of
   * a phrase.
   *
   * The parts are named in the order the partition takes them — "dans l'ordre de
   * la partition" — and a blazon that names them in any other order is refused
   * rather than quietly sorted: the rank is the blazon's own claim about which
   * part it is describing, and claims that contradict the order are not a blazon
   * this can read. With several ranks to a phrase the order is the order the
   * ranks are first named in, so "aux 1 et 4 ..., aux 2 et 3" is in order and
   * "aux 2 et 3 ..., aux 1 et 4" is not.
   *
   * Whatever the tongue sets between the parts is read and dropped: the mark,
   * the conjunction, or both, the armorials writing "au premier ..., au second"
   * and "au premier ..., et au second" alike.
   */
  const rankedDivision = (
    rank: Parser<TokenKind, readonly number[]>
  ): Parser<TokenKind, Division> => {
    // A rank ends whatever the part before it bears. French opens a bearing and
    // a rank with the same word, so the list has to be told that a rank may
    // stand where it is looking for a charge, or it would read "au second" as
    // far as the article and then owe an explanation for what it found there.
    const laid = listOf(unless(bearing, rank));

    /**
     * One phrase, read knowing which parts have already been ranked.
     *
     * Knowing that is what lets the complaint land on the rank that was wrong
     * rather than on the partition's name, which is where a check made after
     * every phrase had been read would have had to put it — and the position is
     * what decides which complaint a reader is shown, the unranked reading
     * having failed at a token of its own.
     */
    const phrase = (type: DivisionType, taken: readonly number[]) =>
      apply(
        seq(
          guard(
            rank,
            (ranks) => misranked(type, taken, ranks) === undefined,
            (ranks, position) =>
              new BlazonParseError(misranked(type, taken, ranks) as string, position)
          ),
          laidOn(partField, laid)
        ),
        ([ranks, arms]): RankedPart => ({ ranks, arms })
      );

    /**
     * The phrases from here on, which is however many it takes to rank every
     * part the line left.
     *
     * A part still unranked is owed, so a blazon that stops early is told which
     * part it stopped before rather than being quietly read as the arms of half
     * a shield. What is owed differs at the start: a blazon that named the line
     * and stopped has not yet chosen between the two forms, so what it owes is
     * the tincture the unranked form would have taken.
     */
    const phrasesFrom = (
      type: DivisionType,
      taken: readonly number[]
    ): Parser<TokenKind, readonly RankedPart[]> => {
      if (taken.length === partsOf(type)) {
        return succ<TokenKind, readonly RankedPart[]>([]);
      }
      const opening =
        taken.length === 0
          ? phrase(type, taken)
          : kright(seq(optional(SEPARATOR), optional(grammar.and)), phrase(type, taken));
      return combine(
        owedAtEnd(opening, taken.length === 0 ? asTincture : asRank),
        (read): Parser<TokenKind, readonly RankedPart[]> =>
          apply(phrasesFrom(type, [...taken, ...read.ranks]), (more) => [read, ...more])
      );
    };

    return within(
      apply(
        combine(kleft(grammar.division, optional(SEPARATOR)), (type) =>
          apply(phrasesFrom(type, []), (ranked): Division => ({
            type,
            parts: inRankOrder(ranked),
          }))
        ),
        (division) => division
      )
    );
  };

  // The ranked reading is offered only by a tongue that has the form, and the
  // two never both parse: one owes a rank where the other owes a tincture.
  //
  // The unranked reading is listed first, which settles what a reader is told
  // when a word is neither. Both readings then fail at that very word — English
  // setting its ranks bare, there is no article to fail at sooner — and a tie is
  // settled in favour of whichever was listed first. "Unknown tincture: fuchsia"
  // is the useful half of the truth: the unranked form is what nearly every
  // divided blazon is, so a word standing where it opens was meant to be a
  // tincture. Where the word did name a rank the ranked reading gets further and
  // its complaint wins on its own merits.
  const dividedField =
    grammar.rank === undefined
      ? unrankedDivision
      : alt(unrankedDivision, rankedDivision(grammar.rank));

  // A furred field names the fur and the two tinctures it is cut from, and is
  // read exactly as a division is: what differs is the vocabulary the first word
  // belongs to, and that the pelt takes the whole field rather than half of it.
  const furredField = within(
    apply(
      seq(grammar.fur, grammar.tincture, secondOfThePair),
      ([type, firstTincture, secondTincture]): Furred => ({
        type,
        firstTincture,
        secondTincture,
      })
    )
  );

  // What follows a partition's name: the two tinctures it divides the field
  // between, and whatever the first half bears. Reading it alone is how an
  // unknown first word is told apart from a word that was never meant to be a
  // partition at all — so it has to recognise as much of a division as the
  // division rule does, or a charged half would hide the partition from it.
  const restOfDivision = seq(laidOn(partField), otherHalf);

  // The varied reading is tried first of the three, because all three open on a
  // word of their own vocabulary and all three complain about the same word when
  // they fail: a tie between them is settled in favour of whichever was listed
  // first, and only the varied one has anything to say beyond the name — that the
  // pieces were never counted, or counted in a number no such field is cut into.
  //
  // None of the three is ever bare: only a field of one tincture is called
  // plain, a divided one being no such thing whatever it bears.
  const field = eitherReading(
    plainField,
    apply(alt(variedField, furredField, dividedField), (field): ReadField => ({
      field,
      bare: false,
    })),
    restOfDivision
  );

  const arms = laidOn(field);

  // A blazon is written as a sentence and closed with a full stop, but the stop
  // carries no meaning, so it is accepted and discarded rather than required. A
  // blazon copied out of an armorial can end on the mark that set it apart from
  // the next one, which means no more than the stop does.
  return kleft(arms, optional(alt(tok(TokenKind.Period), SEPARATOR)));
}

/**
 * What the field bears, held to what the field will carry.
 *
 * Two promises are kept here, and both are about the field rather than about any
 * one thing laid on it. A field the blazon called plain bears nothing at all —
 * that is the whole of what the word is for — and a figure painted out of the
 * field needs a field with two tinctures to be painted out of, which a field of
 * one tincture is not. Either way both halves of the blazon are known and
 * neither is wrong on its own.
 */
function held(
  borne: Parser<TokenKind, readonly ChargeOrOrdinary[]>,
  field: Field,
  bare: boolean
): Parser<TokenKind, readonly ChargeOrOrdinary[]> {
  const laid = bare
    ? guard(
        borne,
        (laid) => laid.length === 0,
        (laid, position) => new ChargedPlainField(laid.length, position)
      )
    : borne;
  return isCounterchangeable(field)
    ? laid
    : guard(
        laid,
        (laid) => !laid.some(({ tincture }) => isCounterchanged(tincture)),
        (_, position) => new UndividedField(position)
      );
}

/**
 * What the blazon says has been done to what it bears, where the tongue lets it
 * say anything and the charge will take what it said.
 *
 * Whether the charge will take it is settled here rather than by the phrase that
 * read the word, because it is settled the same way in every tongue: an annulet
 * is a ring already and there is nothing in it to void, whichever vocabulary
 * named it. A tongue that says nothing of modifiers at all leaves this off, and
 * nothing whatever is read.
 *
 * It answers with one reading and never two: where a modifier stands, it is
 * taken, and where none stands, none is. That is what keeps a blazon that may
 * say the word in either of two places from being read in both — a besant
 * voided, whose tincture is written nowhere, would otherwise be a blazon with
 * two readings and no way to choose. It also means a word that was both a
 * modifier and a tincture would be taken for the modifier; the vocabularies hold
 * no such word, and the one that arrives will have to be given a place to stand.
 *
 * What comes back is the word as well as the term, because the phrase is not
 * done with it: a modifier may be given a tincture of its own, and whether it
 * may is the term's to answer while the complaint about it has to name the word
 * the blazon actually wrote.
 *
 * The word that was written has a say as well as the charge behind it. A name
 * that already means a modifier will take that one and no other: "a mascle
 * voided" says the voiding twice and is understood, as "a besant or" says the
 * gold twice; "a mascle pierced" says two different things of the one figure and
 * is refused by name.
 */
function modifying(borne: BorneTerm): Parser<TokenKind, TermWord<Modifier> | undefined> {
  if (borne.modifier === undefined) {
    return nil();
  }
  return guard(
    borne.modifier,
    (named) =>
      named === undefined || (bornUnder(borne.type, named.term) && borne.word.takes(named.term)),
    (named, position) => new WrongModifier(borne.word.value, named?.word.value ?? '', position)
  );
}

/**
 * The tincture a modifier is drawn in, where the blazon gives it one of its own.
 *
 * Nothing whatever is owed: a line said nothing of is drawn in the band's own
 * tincture, which is what every armorial that says nothing means. So a blazon
 * that names none reads exactly as it did before a line could be painted.
 *
 * It is offered only after a modifier that was written late, the early place
 * being where the band's own tincture follows. And it is refused by name where
 * the modifier is one that cannot be drawn: a line is an edge and an edge takes
 * paint, where a charge voided shows the field through it and a tincture there
 * would be filling the hole rather than colouring it. Refusing fails the phrase
 * rather than passing the word by, both words being known and the blazon asking
 * for a figure this vocabulary does not hold.
 */
function painting(
  modifier: TermWord<Modifier> | undefined,
  tincture: Parser<TokenKind, Tincture>
): Parser<TokenKind, Tincture | undefined> {
  if (modifier === undefined) {
    return nil();
  }
  if (takesTincture(modifier.term)) {
    return optional(tincture);
  }
  // A tincture standing after a modifier that is not drawn is refused by name
  // rather than passed over. Passing it over would leave the blazon failing
  // somewhere further on, with a complaint about a word that is perfectly well
  // spelled and in the only place it could have been meant to stand; and nothing
  // else can be meant by it, no phrase of either tongue beginning with a bare
  // tincture.
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, Tincture | undefined> {
      const output = tincture.parse(token);
      if (!output.successful) {
        return {
          successful: true,
          candidates: [{ firstToken: token, nextToken: token, result: undefined }],
          error: undefined,
        };
      }
      return {
        successful: false,
        error: complaining(
          token?.pos,
          new UntincturedModifier(modifier.word.value, positionOf(token?.pos))
        ),
      };
    },
  };
}

/**
 * One part of a charge as the blazon painted it: which part, which word said so,
 * and the tincture it is drawn in.
 *
 * The word is carried past the reading because a refusal names it — a blazon
 * that stoned a billet is told which word it wrote — and because the charge's
 * own name is not the one that says the part.
 */
type Painted = { readonly term: Attribute; readonly word: Word; readonly tincture: Tincture };

/**
 * What the blazon says was painted apart from the rest of the charge, and in
 * what tincture.
 *
 * It stands last of all, after the tincture the charge itself carries, which is
 * where the armorials of both tongues put it: "Gules, three gem-rings argent
 * stoned azure", "au lion d'or armé de gueules". Unlike a modifier it may not
 * stand anywhere else — a part is owed a tincture, so a blazon writing one
 * before the charge's own would leave two tinctures running together with
 * nothing to say which was which.
 *
 * As many as the blazon names, the parts of a figure being several: a lion is
 * armed and lampassé in the one phrase. Each is named once — two tinctures for
 * the one part is two answers to one question — and each must be a part the
 * charge has. A band has none.
 *
 * The name may have said one already: a gem-ring is a ring with a stone in it
 * and says so by being the word it is, so the word's own part is added where the
 * blazon named no such part itself. What the name never says is the tincture, so
 * a blazon that writes the part out after it is adding to the name rather than
 * repeating it, and the written tincture is what comes back.
 */
function attributing(
  borne: BorneTerm,
  tincture: Parser<TokenKind, Tincture>,
  and: Parser<TokenKind, unknown>
): Parser<TokenKind, readonly Attributed[]> {
  const own = borne.word.defaultAttribute;
  if (borne.attribute === undefined) {
    return apply(nil(), () => carrying(own, []));
  }
  const attribute = borne.attribute;

  // The first word of a run, with the mark a blazon may set before it: "au lion
  // d'or, armé de gueules". Absence answers with nothing and disagreement
  // refuses, which is the whole difference between a blazon that said nothing of
  // the charge and one that said it in the wrong shape.
  //
  // The mark is stepped over only where a word does follow it. It is the same
  // mark that parts one bearing from the next, so eating it where nothing was
  // said of the charge would leave the phrase after it with nothing to be
  // introduced by — and a blazon ending on a bare mark would be read as though
  // it had not.
  const first: Parser<TokenKind, TermWord<Attribute> | undefined> = {
    parse(token) {
      const after = token?.kind === TokenKind.Separator ? token.next : token;
      const output = attribute.parse(after);
      if (!output.successful) {
        return output;
      }
      const said = output.candidates.filter(({ result }) => result !== undefined);
      return said.length === 0
        ? {
            successful: true,
            candidates: [{ firstToken: token, nextToken: token, result: undefined }],
            error: undefined,
          }
        : {
            successful: true,
            candidates: said.map((candidate) => ({ ...candidate, firstToken: token })),
            error: output.error,
          };
    },
  };

  // Another word sharing the run, which the conjunction or the mark introduces:
  // "armé et lampassé", "armé, lampassé". Both promise a word, so an absence
  // here is a refusal where at the opening it was silence.
  const another = present<TokenKind, TermWord<Attribute>>(
    kright(alt(and, SEPARATOR), attribute),
    (position) => new BlazonParseError('Expected something else said of the charge', position)
  );

  // A run of words sharing one tincture: "armé et lampassé de gueules", which is
  // how the armorials of both tongues write two parts of one colour. The
  // tincture closes the run and is given to every word gathered into it.
  const sharing = (
    gathered: readonly TermWord<Attribute>[]
  ): Parser<TokenKind, readonly Painted[]> =>
    // The tincture is tried first of the two, and only to settle which complaint
    // is reported when neither is there: a run that ends without one is owed a
    // tincture, which is worth saying, where "no conjunction here" is not. A
    // blazon that goes on is settled by what it goes on with, the conjunction
    // being no tincture and no tincture being a conjunction.
    alt(
      apply(tincture, (painted) => gathered.map((word) => ({ ...word, tincture: painted }))),
      combine(another, (next) => sharing([...gathered, next]))
    );

  // Run after run, each closing on a tincture of its own: "armé d'or, lampassé
  // de gueules" paints the claws and the tongue two colours.
  const painted = rule<TokenKind, readonly Painted[]>();
  painted.setPattern(
    combine(first, (word) =>
      word === undefined
        ? apply(nil(), (): readonly Painted[] => [])
        : apply(seq(sharing([word]), painted), ([run, rest]): readonly Painted[] => [
            ...run,
            ...rest,
          ])
    )
  );

  return apply(
    guard(
      guard(
        painted,
        (all) => all.every(({ term }) => bearsPart(borne.type, term)),
        (all, position) =>
          new WrongAttribute(
            borne.word.value,
            all.find(({ term }) => !bearsPart(borne.type, term))?.word.value ?? '',
            position
          )
      ),
      (all) => all.every(({ term }, at) => all.findIndex((one) => one.term === term) === at),
      (all, position) =>
        new RepeatedAttribute(
          all.find(({ term }, at) => all.findIndex((one) => one.term === term) !== at)?.word
            .value ?? '',
          position
        )
    ),
    (all) =>
      carrying(
        own,
        all.map(({ term, tincture }): Attributed => ({ attribute: term, tincture }))
      )
  );
}

/**
 * The parts the name itself said, laid before the parts the blazon wrote out.
 *
 * A name that says a part says it first, being the first word of the phrase —
 * and says nothing at all where the blazon wrote that same part itself, the
 * written one carrying the tincture this one has not got.
 */
function carrying(
  own: Attribute | undefined,
  painted: readonly Attributed[]
): readonly Attributed[] {
  return own === undefined || namesPart(painted, own) ? painted : [{ attribute: own }, ...painted];
}

/**
 * A field read both ways at once, and the complaint that survives when neither
 * reading works.
 *
 * The two shapes are disjoint, so this changes nothing about what parses. What
 * it settles is which complaint is reported. A plain field and a divided one
 * begin at the same word, so a word in neither vocabulary fails both readings at
 * the same place, and typescript-parsec breaks that tie in favour of whichever
 * rule was listed first. Listing either first is wrong for the other: every
 * unknown word would be an unknown tincture — "Gironné d'azur et d'or"
 * included, though it plainly names a partition the vocabulary does not hold —
 * or else "de or" would be an unknown partition rather than a bad elision.
 *
 * What follows decides it. If the rest of the blazon reads as the rest of a
 * division — two tinctures and the conjunction between them — then what came
 * before was meant to name the line, and the complaint is that the line is
 * unknown. Otherwise nothing was divided and the complaint belongs to the plain
 * reading.
 */
function eitherReading(
  plain: Parser<TokenKind, ReadField>,
  divided: Parser<TokenKind, ReadField>,
  restOfDivision: Parser<TokenKind, unknown>
): Parser<TokenKind, ReadField> {
  return {
    parse(token) {
      const asPlain = plain.parse(token);
      const asDivided = divided.parse(token);

      const candidates: ParseResult<TokenKind, ReadField>[] = [
        ...(asPlain.successful ? asPlain.candidates : []),
        ...(asDivided.successful ? asDivided.candidates : []),
      ];
      if (candidates.length !== 0) {
        return resultOrError(candidates, betterError(asPlain.error, asDivided.error), true);
      }

      // betterError keeps the complaint from the furthest token, and its first
      // argument when the two are level — which is the tie this decides.
      return resultOrError(
        [],
        opensDivision(token, restOfDivision)
          ? betterError(asDivided.error, asPlain.error)
          : betterError(asPlain.error, asDivided.error),
        false
      );
    },
  };
}

/**
 * Whether what stands here opens a division: whether the rest of one follows.
 *
 * A partition may be named in several words — "per bend sinister" — and one the
 * vocabulary does not hold may run to as many, so the whole run of words is
 * tried rather than the first alone. Nothing but words is stepped over: an
 * article opens the field itself, and leaves no partition left to be naming.
 */
function opensDivision(
  token: Token<TokenKind> | undefined,
  restOfDivision: Parser<TokenKind, unknown>
): boolean {
  let after = token?.next;
  while (after !== undefined) {
    if (restOfDivision.parse(after).successful) {
      return true;
    }
    if (after.kind !== TokenKind.Word) {
      return false;
    }
    after = after.next;
  }
  return false;
}
