import { EnglishBlazonWording } from '../../src/application/english/EnglishBlazonWording';
import { FrenchBlazonWording } from '../../src/application/french/FrenchBlazonWording';
import { BlazonWording } from '../../src/application/writer/BlazonWording';
import { Blazon, ChargeOrOrdinary, isOrdinary } from '../../src/domain/models/Blazon';
import { Languages } from '../../src/domain/models/Languages';
import { numberBorne } from '../../src/domain/models/Charge';
import {
  Division,
  Field,
  FieldType,
  Furred,
  HALVES,
  Plain,
  Semy,
  Variation,
  isDivision,
  isFurred,
  isPlain,
  isVariation,
  saidInTwo,
} from '../../src/domain/models/Field';
import { borne } from '../../src/domain/models/Ordinary';
import { Tincture } from '../../src/domain/models/Tinctures';
import { SOWN as EnglishSown } from '../../src/domain/translations/en/Strewings';
import { SOWN as FrenchSown } from '../../src/domain/translations/fr/Strewings';
import { strewnIn } from '../../src/domain/translations/Strewings';
import { wordIn, wordOf, wordSaidOf } from '../../src/domain/translations/Translation';
import { Word } from '../../src/domain/translations/Word';
import { FIRST } from '../../src/domain/translations/Ranks';
import { Rank } from './Vocabulary';

/**
 * One term of a blazon, and the terms it was said of.
 *
 * What a blazon holds is a field and the figures laid on it, each named by a
 * word and each carrying its own tincture; nesting says what was said of what.
 * So a branch is a word, and its children are the words that qualify it.
 *
 * All but one kind of branch is a word. A divided field holds two whole coats
 * rather than two tinctures, and the part they are laid in is no term of
 * heraldry: it says which half, and a tongue that ranks its parts says it in
 * words of its own — "au premier" — while a tongue that does not has nothing to
 * say there at all. Such a branch is a place in the shield rather than a word
 * about it, so it carries no rank and leads nowhere.
 */
export interface Branch {
  /** The spelling the tongue writes it with, where a word names this at all. */
  readonly word?: string;
  /** The vocabulary it belongs to, where it is a word of the vocabulary. */
  readonly rank?: Rank;
  /** How many are borne, where more than one is. */
  readonly count?: number;
  /**
   * The blazon reduced to the one thing this word names, in the tinctures this
   * blazon gave it.
   *
   * Not the arms the vocabulary shows the word by. Those are a demonstration in
   * gules and argent, and beside a shield painted azure they would be telling a
   * reader the field was red. What stands here is cut from the very model the
   * shield was drawn from, so the two cannot disagree.
   *
   * Nothing only where the blazon gives the word nothing to be drawn on.
   */
  readonly arms?: Blazon;
  readonly children: readonly Branch[];
}

/**
 * The field a figure is shown laid on: the one it is actually laid on, with
 * whatever was sown over it left off.
 *
 * The sowing is a word of its own with arms of its own, and a bordure shown over
 * a field of billets is a mark too crowded to read at the size these are drawn.
 */
function bare(field: Field): Field {
  return isPlain(field) ? { type: FieldType.plain, tincture: field.tincture } : field;
}

/**
 * A blazon taken apart into the words it is made of, in the tongue it was
 * written in.
 *
 * Every word is the one the writer would write, and chosen by asking the writer:
 * a gold roundel is a besant and not a roundel, and a star voided is évidée
 * where a lozenge is vidée. A structure that named the terms its own way would
 * be showing a reader words the library never writes, and the two would drift
 * apart the first time a tongue gained a synonym.
 *
 * The blazon itself is not a branch here. The page it stands on is headed with
 * the word already, and a tree whose root repeats the heading tells a reader
 * nothing they are not looking at.
 */
export function structureIn(language: Languages, blazon: Blazon): readonly Branch[] {
  return language === Languages.fr
    ? structureOf(FrenchBlazonWording, FrenchSown, blazon)
    : structureOf(EnglishBlazonWording, EnglishSown[0], blazon);
}

function structureOf<W extends Word>(
  wording: BlazonWording<W>,
  /** The word this tongue sows a figure it has no single word for by. */
  sown: Word,
  blazon: Blazon
): readonly Branch[] {
  return [
    fieldBranch(wording, sown, blazon.field),
    ...(blazon.chargesOrOrdinaries ?? []).map((one) => borneBranch(wording, blazon.field, one)),
  ];
}

/**
 * The field, named by whatever cut it: the partition, the varied field's own
 * word, or the fur, each over the two tinctures it takes.
 *
 * A plain field was cut by nothing and has no such word, so it is its tincture —
 * which is all a blazon says of it, and all there is to show.
 */
function fieldBranch<W extends Word>(wording: BlazonWording<W>, sown: Word, field: Field): Branch {
  // The arms are the field as the blazon cut it — the very field on the shield
  // beside it, nothing chosen here at all.
  const cut = (word: string, rank: Rank, children: readonly Branch[]): Branch => ({
    word,
    rank,
    arms: { field },
    children,
  });

  // A varied field and a fur alternate two tinctures and bear nothing, so the
  // pair stands under the word in the order the blazon named them.
  const pair = (between: Variation | Furred): readonly Branch[] => [
    tinctureBranch(wording, between.firstTincture),
    tinctureBranch(wording, between.secondTincture),
  ];

  if (isVariation(field)) {
    return cut(wordOf(wording.variations, field.type).value, 'variation', pair(field));
  }
  if (isDivision(field)) {
    return cut(
      wordOf(wording.divisions, field.type).value,
      'division',
      parts(wording, sown, field)
    );
  }
  if (isFurred(field)) {
    return cut(wordOf(wording.furs, field.type).value, 'furred field', pair(field));
  }
  return plainBranch(wording, sown, field);
}

/**
 * The parts of a divided field, each a whole coat and each taken apart as one.
 *
 * Where no part bears anything the parts are their tinctures and nothing more,
 * so they stand straight under the partition: a parti of azure and or reads as
 * the two words the blazon wrote and wants no scaffolding between them.
 *
 * Where any part bears something they are gathered, each under the part it is
 * laid in. Ungathered, a bend blazoned in the second half would stand beside the
 * first half's tincture with nothing to say which half it belonged to — which is
 * the one thing a divided field's structure exists to answer.
 *
 * That is the same question the writer asks before it writes: a blazon ranks its
 * parts exactly when the short form could not say what they carry.
 *
 * A quartered field is gathered whenever its quarters are not the plain pair the
 * short form fills out from, which is the same rule seen from the other side: a
 * quarterly of two tinctures reads as those two words, and anything else has to
 * say which quarter it means.
 */
function parts<W extends Word>(
  wording: BlazonWording<W>,
  sown: Word,
  division: Division
): readonly Branch[] {
  const parts = division.parts;
  if (!gathered(division)) {
    return parts.slice(0, HALVES).flatMap((part) => structureOf(wording, sown, part));
  }
  return parts.map((part, at) => ({
    // What the tongue ranks the part by, where it ranks them at all. It is no
    // term of the vocabulary and leads nowhere: it names a place in the shield
    // rather than anything borne there.
    word: wording.rank?.([FIRST + at]),
    arms: part,
    children: structureOf(wording, sown, part),
  }));
}

/**
 * Whether the parts have to be shown one by one rather than as the pair the
 * blazon wrote.
 *
 * Two reasons, and either is enough. A blazon the short form cannot say is
 * written with its parts ranked, and the tree beside it says what it says — that
 * is the model's question, and it is asked rather than answered again here. And
 * a part that bears anything is gathered whatever form the blazon took, because
 * ungathered, a bend blazoned in the second half would stand beside the first
 * half's tincture with nothing to say which half it belonged to.
 */
function gathered(division: Division): boolean {
  return !saidInTwo(division) || division.parts.some(bears);
}

/** Whether a part carries anything beyond the tincture of its field. */
function bears(part: Blazon): boolean {
  return (part.chargesOrOrdinaries ?? []).length !== 0;
}

/** A field of one tincture, with whatever it was sown with standing under it. */
function plainBranch<W extends Word>(wording: BlazonWording<W>, sown: Word, field: Plain): Branch {
  return {
    ...tinctureBranch(wording, field.tincture),
    children:
      field.semy === undefined ? [] : [semyBranch(wording, sown, field.tincture, field.semy)],
  };
}

/**
 * What the field was sown with, under the word the tongue sows it by where it
 * has one — billeté rather than semé de billettes, which is the word heraldry
 * would rather write.
 *
 * Where it has none, the sowing is said in as many words and the tree says it in
 * as many branches: semé over the figure, as the blazon writes it. The figure
 * alone would be the same shape a charge borne on the field makes, and a reader
 * would have no way to tell a field sown with lilies from a field bearing one.
 */
function semyBranch<W extends Word>(
  wording: BlazonWording<W>,
  sown: Word,
  /** The tincture of the field it was sown over, which the sowing is shown on. */
  over: Tincture,
  semy: Semy
): Branch {
  // The field sown, which is what the word says: the field's own tincture under
  // the figure's own, both taken from the blazon.
  const strewing: Blazon = { field: { type: FieldType.plain, tincture: over, semy } };
  const strewn = strewnIn(wording.strewings, semy.type, semy.tincture);
  if (strewn !== undefined) {
    return {
      word: strewn.value,
      rank: 'strewing',
      arms: strewing,
      children: tinctureSaid(wording, strewn, semy.tincture),
    };
  }
  const figure = wordIn(wording.charges, semy.type, semy.tincture);
  return {
    word: sown.value,
    // The word for the sowing itself, which the vocabulary files apart from the
    // charges: it is a thing said of the field and not a figure.
    rank: 'field',
    arms: strewing,
    children: [
      {
        word: figure.value,
        rank: 'charge',
        // The figure alone, borne once on the field it was sown over: what the
        // word names is the thing, and the sowing of it is the word above.
        arms: {
          field: { type: FieldType.plain, tincture: over },
          chargesOrOrdinaries: [{ type: semy.type, tincture: semy.tincture }],
        },
        children: tinctureSaid(wording, figure, semy.tincture),
      },
    ],
  };
}

/**
 * A band or a figure laid on the field: its word, then what was done to it and
 * what it is painted.
 *
 * How many are borne is asked of the model rather than read off the blazon, as
 * the writer asks it: an ordinary borne but once is one band whatever count it
 * was handed.
 */
function borneBranch<W extends Word>(
  wording: BlazonWording<W>,
  /** The field it is laid on, which is what it is shown laid on. */
  field: Field,
  one: ChargeOrOrdinary
): Branch {
  const band = isOrdinary(one);
  const word = band
    ? wordIn(wording.ordinaries, one.type, one.tincture)
    : wordIn(wording.charges, one.type, one.tincture, one.modifier);
  const count = band ? borne(one) : numberBorne(one);
  return {
    word: word.value,
    rank: band ? 'ordinary' : 'charge',
    ...(count > 1 ? { count } : {}),
    // The figure on the field it is actually laid on, borne as many times as the
    // blazon bears it and under whatever was done to it.
    arms: { field: bare(field), chargesOrOrdinaries: [one] },
    children: [
      ...(band || one.modifier === undefined || word.means(one.modifier)
        ? []
        : [
            {
              word: wordSaidOf(wording.modifiers, one.modifier, one.type).value,
              rank: 'modifier' as const,
              /*
               * The figure under it, borne once. A modifier is not a thing to be
               * drawn on its own — there is no picture of "voided" — so what it
               * does to the very charge it was said of is the whole of what can
               * be shown, and the count is left to the charge above.
               */
              arms: {
                field: bare(field),
                chargesOrOrdinaries: [
                  { type: one.type, tincture: one.tincture, modifier: one.modifier },
                ],
              },
              children: [],
            },
          ]),
      ...tinctureSaid(wording, word, one.tincture),
    ],
  };
}

/**
 * The tincture, unless the word has already said it.
 *
 * A word chosen for the tincture it means says it by being written — a besant is
 * gold entire — and the writer leaves the tincture off after such a word. So the
 * structure leaves it off too: a branch the blazon does not carry is a branch
 * the reader would look for in the sentence and not find.
 */
function tinctureSaid<W extends Word>(
  wording: BlazonWording<W>,
  word: W,
  tincture: Tincture
): readonly Branch[] {
  return word.defaultTincture === tincture ? [] : [tinctureBranch(wording, tincture)];
}

function tinctureBranch<W extends Word>(wording: BlazonWording<W>, tincture: Tincture): Branch {
  return {
    word: wordOf(wording.tinctures, tincture).value,
    rank: 'tincture',
    // A field of it and nothing on it, which is the whole of what the word says.
    arms: { field: { type: FieldType.plain, tincture } },
    children: [],
  };
}
