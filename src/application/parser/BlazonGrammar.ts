import {
  ParseResult,
  Parser,
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
import { MissingPieces } from '../../domain/errors/parsing/MissingPieces';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { Blazon, ChargeOrOrdinary } from '../../domain/models/Blazon';
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
  partsOf,
  usualPieces,
} from '../../domain/models/Field';
import { Modifier } from '../../domain/models/Modifier';
import { FIRST, ranksOf } from '../../domain/translations/Ranks';
import { Tincture } from '../../domain/models/Tinctures';
import { TokenKind } from '../lexer/Lexer';
import { BorneTerm, bornUnder, carried } from './Borne';
import { guard, optional, optionalUnlessBegun, unless } from './Combinators';
import { asRank, asTincture, owedAtEnd, within } from './Failures';
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
   * What the blazon may then say of it — that it is voided — comes back on the
   * term rather than being asked for separately, because a modifier agrees with
   * what the phrase called the charge and the phrase is the only thing that
   * knows what it called it. A tongue whose blazons say nothing of the sort
   * hands back nothing, and nothing is read.
   */
  readonly borne: Parser<TokenKind, BorneTerm>;
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
  // Whichever place it stands in, it is read by the phrase that named the charge
  // rather than by this rule: the words that may stand there have to agree with
  // what the blazon called the charge, and only the phrase knows what it called
  // it. What comes back is checked against the charge itself, that being a thing
  // no tongue disagrees about.
  //
  // The count is left off rather than set to one when a single one is borne, so
  // that a fess reads back as the fess it was before a field could bear two.
  const bearing = within(
    combine(grammar.borne, (borne) =>
      combine(modifying(borne), (early) =>
        combine(carried(grammar.tincture, borne.word), (tincture) =>
          apply(early === undefined ? modifying(borne) : nil(), (late): ChargeOrOrdinary => {
            const one =
              borne.count === undefined
                ? { type: borne.type, tincture }
                : { type: borne.type, tincture, count: borne.count };
            // The name may have said it already: a mascle is a lozenge voided
            // and says so by being the word it is, so where the blazon wrote no
            // modifier the word supplies its own.
            const modifier = early ?? late ?? borne.word.defaultModifier;
            return modifier === undefined ? one : { ...one, modifier };
          })
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
      apply(
        bare
          ? guard(
              laid,
              (borne) => borne.length === 0,
              (borne, position) => new ChargedPlainField(borne.length, position)
            )
          : laid,
        (borne): Blazon => borneOn(field, borne)
      )
    );

  // The second of the two tinctures a varied or furred field is cut between, the
  // conjunction and all: both read it, and both owe it once the first has been
  // read. A blazon that stops there has named one tincture where the field it
  // named takes two, and saying so is more use than pointing at the conjunction
  // — which is the grammar's own plumbing, and names nothing a reader was trying
  // to write.
  const secondOfThePair = owedAtEnd(kright(grammar.and, grammar.tincture), asTincture);

  // The other half of a divided field, which is a field and not a tincture: it
  // carries whatever the tongue says of a field of one tincture, which is what
  // the armorials write there — "et d'hermine plain", "et de sinople semé de
  // larmes d'or". Being owed is the tincture's affair all the same, a half that
  // never arrives having failed to name one.
  //
  // A blazon may set its own mark before the conjunction — "à six macles
  // d'argent, et d'hermine" — which says no more than the conjunction does, so it
  // is read and discarded rather than required.
  //
  // It bears nothing: what follows it belongs to the shield.
  const otherHalf = owedAtEnd(
    kright(
      seq(optional(SEPARATOR), grammar.and),
      apply(plainField, ({ field }): Blazon => ({ field }))
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
      seq(grammar.division, laidOn(plainField), otherHalf),
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
          laidOn(plainField, laid)
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
  const restOfDivision = seq(laidOn(plainField), otherHalf);

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
 * The word that was written has a say as well as the charge behind it. A name
 * that already means a modifier will take that one and no other: "a mascle
 * voided" says the voiding twice and is understood, as "a besant or" says the
 * gold twice; "a mascle pierced" says two different things of the one figure and
 * is refused by name.
 */
function modifying(borne: BorneTerm): Parser<TokenKind, Modifier | undefined> {
  if (borne.modifier === undefined) {
    return nil();
  }
  return apply(
    guard(
      borne.modifier,
      (named) =>
        named === undefined || (bornUnder(borne.type, named.term) && borne.word.takes(named.term)),
      (named, position) => new WrongModifier(borne.word.value, named?.word.value ?? '', position)
    ),
    (named) => named?.term
  );
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
