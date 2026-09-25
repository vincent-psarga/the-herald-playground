import {
  ParseResult,
  Parser,
  Token,
  alt,
  apply,
  betterError,
  combine,
  kleft,
  nil,
  resultOrError,
  rule,
  seq,
  tok,
} from 'typescript-parsec';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { ChargedPlainField } from '../../domain/errors/parsing/ChargedPlainField';
import { CounterchangedCharge } from '../../domain/errors/parsing/CounterchangedCharge';
import { MissingPieces } from '../../domain/errors/parsing/MissingPieces';
import { UndividedField } from '../../domain/errors/parsing/UndividedField';
import { WrongModifier } from '../../domain/errors/parsing/WrongModifier';
import { Blazon, ChargeOrOrdinary } from '../../domain/models/Blazon';
import { Counterchanged, Tinctured, isCounterchanged } from '../../domain/models/Counterchanged';
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
  isCounterchangeable,
  usualPieces,
} from '../../domain/models/Field';
import { Modifier } from '../../domain/models/Modifier';
import { isOrdinaryType } from '../../domain/models/Ordinary';
import { Tincture } from '../../domain/models/Tinctures';
import { TokenKind } from '../lexer/Lexer';
import { BorneTerm, bornUnder, carried } from './Borne';
import { guard, optional, optionalUnlessBegun } from './Combinators';
import { within } from './Failures';
import { Treatment, isBare } from './Treatment';
import { VariedField } from './Variations';

/**
 * What one language contributes to reading a blazon. The shape of a blazon is
 * the same in every language — a field, plain or divided between two tinctures —
 * so only the words and whatever introduces them differ.
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
  /**
   * What the tongue says in place of a tincture where what is borne takes the
   * field's own two, reversed: "de l'un à l'autre", "counterchanged".
   *
   * It is read where a tincture is read because it is said where a tincture is
   * said and answers the same question — what the band is painted with — and a
   * tongue that has no phrase for it leaves this off, and nothing is read.
   */
  readonly counterchanged?: Parser<TokenKind, Counterchanged>;
  /** The conjunction joining the halves of a divided field. */
  readonly and: Parser<TokenKind, unknown>;
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

  // Wrapped as a phrase so that a tincture which never arrives is reported as
  // missing from the division that owed it, rather than from the blazon at large.
  const dividedField = within(
    apply(
      seq(grammar.division, grammar.tincture, grammar.and, grammar.tincture),
      ([type, firstTincture, , secondTincture]): Division => ({
        type,
        firstTincture,
        secondTincture,
      })
    )
  );

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
          seq(grammar.variation, grammar.tincture, grammar.and, grammar.tincture, trailingPieces),
          ([named, firstTincture, , secondTincture, counted]) => ({
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
      seq(grammar.fur, grammar.tincture, grammar.and, grammar.tincture),
      ([type, firstTincture, , secondTincture]): Furred => ({
        type,
        firstTincture,
        secondTincture,
      })
    )
  );

  // What follows a partition's name: the two tinctures it divides the field
  // between. Reading it alone is how an unknown first word is told apart from a
  // word that was never meant to be a partition at all.
  const restOfDivision = seq(grammar.tincture, grammar.and, grammar.tincture);

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
  // The tincture may be no tincture at all: a tongue may say instead that the
  // band takes the field's own two, reversed, and that is said exactly where a
  // tincture would be said. Only a band takes it so far, and a charge that asks
  // for it is refused by name rather than left to fail as a misspelled tincture.
  //
  // The count is left off rather than set to one when a single one is borne, so
  // that a fess reads back as the fess it was before a field could bear two.
  const painted = (borne: BorneTerm): Parser<TokenKind, Tinctured> => {
    const tincture = carried(grammar.tincture, borne.word);
    if (grammar.counterchanged === undefined) {
      return tincture;
    }
    // The tincture is offered first, so that a phrase which is neither is
    // reported as a tincture gone wrong: that is what almost every such phrase
    // is, and the two readings fail at the same word often enough for the order
    // to be what settles it.
    return guard(
      alt<TokenKind, Tincture, Counterchanged>(tincture, grammar.counterchanged),
      (painted) => !isCounterchanged(painted) || isOrdinaryType(borne.type),
      (_, position) => new CounterchangedCharge(borne.word.value.toLowerCase(), position)
    );
  };

  const bearing = within(
    combine(grammar.borne, (borne) =>
      combine(modifying(borne), (early) =>
        combine(painted(borne), (tincture) =>
          apply(early === undefined ? modifying(borne) : nil(), (late): ChargeOrOrdinary =>
            laidOn(borne, tincture, early ?? late)
          )
        )
      )
    )
  );

  // Everything the field bears, read in the order it was written, because that
  // order is what says which covers which: "D'or à trois bandes de sable ; à la
  // bordure de gueules" puts the bordure over the bends.
  //
  // A blazon may set a mark between the phrases — French writes the semicolon as
  // readily as the comma — or set none at all and let the article do the work,
  // so the mark is read and discarded rather than required.
  const borne = rule<TokenKind, readonly ChargeOrOrdinary[]>();
  borne.setPattern(
    apply(
      optionalUnlessBegun(seq(bearing, borne), SEPARATOR),
      (laid): readonly ChargeOrOrdinary[] => (laid === undefined ? [] : [laid[0], ...laid[1]])
    )
  );

  // The key is left off rather than set to an empty list when nothing is borne,
  // so a plain field reads back as the blazon it was before anything could be
  // laid on one.
  //
  // What the field will carry is judged here, where both halves are known: the
  // bearings are read first and judged after, so a complaint lands on what was
  // laid rather than on the field that would not have it.
  const arms = combine(field, ({ field, bare }) =>
    apply(held(borne, field, bare), (laid): Blazon =>
      laid.length === 0 ? { field } : { field, chargesOrOrdinaries: laid }
    )
  );

  // A blazon is written as a sentence and closed with a full stop, but the stop
  // carries no meaning, so it is accepted and discarded rather than required. A
  // blazon copied out of an armorial can end on the mark that set it apart from
  // the next one, which means no more than the stop does.
  return kleft(arms, optional(alt(tok(TokenKind.Period), SEPARATOR)));
}

/**
 * A band or a charge as the phrase read it.
 *
 * The two are built apart rather than as one object with its term left wide,
 * because they no longer hold the same thing: a band may be painted out of the
 * field it is laid on and a charge may not yet, so what a charge carries is the
 * narrower of the two. Which vocabulary named it is the only thing that tells
 * them apart, and it is asked once, here.
 *
 * The name may have said the modifier already: a mascle is a lozenge voided and
 * says so by being the word it is, so where the blazon wrote none the word
 * supplies its own. A band is asked nothing of the sort, taking none.
 */
function laidOn(
  borne: BorneTerm,
  tincture: Tinctured,
  written: Modifier | undefined
): ChargeOrOrdinary {
  const count = borne.count === undefined ? {} : { count: borne.count };
  if (isOrdinaryType(borne.type)) {
    return { type: borne.type, tincture, ...count };
  }
  const modifier = written ?? borne.word.defaultModifier;
  return {
    type: borne.type,
    // A charge is never painted out of the field: the phrase that read this
    // refused the words to anything but a band, so nothing but a tincture
    // reaches here. Said to the compiler because the phrase that knows it is
    // behind us.
    tincture: tincture as Tincture,
    ...count,
    ...(modifier === undefined ? {} : { modifier }),
  };
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
 * unknown word would be an unknown tincture — "Écartelé d'azur et d'or"
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
