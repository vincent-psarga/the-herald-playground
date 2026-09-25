import { EnglishBlazonWording } from '../../src/application/english/EnglishBlazonWording';
import { FrenchBlazonWording } from '../../src/application/french/FrenchBlazonWording';
import { BlazonWording, bandNamed } from '../../src/application/writer/BlazonWording';
import { Blazon, ChargeOrOrdinary, isOrdinary } from '../../src/domain/models/Blazon';
import { Languages } from '../../src/domain/models/Languages';
import { numberBorne } from '../../src/domain/models/Charge';
import { Tinctured, isCounterchanged } from '../../src/domain/models/Counterchanged';
import {
  Division,
  Field,
  FieldType,
  Plain,
  Semy,
  isDivision,
  isFurred,
  isPlain,
  isVariation,
} from '../../src/domain/models/Field';
import { borne } from '../../src/domain/models/Ordinary';
import { Tincture } from '../../src/domain/models/Tinctures';
import { SOWN as EnglishSown } from '../../src/domain/translations/en/Strewings';
import { SOWN as FrenchSown } from '../../src/domain/translations/fr/Strewings';
import { strewnIn } from '../../src/domain/translations/Strewings';
import { wordIn, wordOf, wordSaidOf } from '../../src/domain/translations/Translation';
import { Word } from '../../src/domain/translations/Word';
import { Rank } from './Vocabulary';

/**
 * One term of a blazon, and the terms it was said of.
 *
 * What a blazon holds is a field and the figures laid on it, each named by a
 * word and each carrying its own tincture; nesting says what was said of what.
 * So a branch is a word, and its children are the words that qualify it.
 */
export interface Branch {
  /** The spelling the tongue writes it with, which is the one shown. */
  readonly word: string;
  /** The vocabulary it belongs to, which is how the way to it is found. */
  readonly rank: Rank;
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
  // beside it, nothing chosen here at all — and the two tinctures stand under it
  // in the order the blazon named them.
  const cut = (word: string, rank: Rank): Branch => ({
    word,
    rank,
    arms: { field },
    children: [
      tinctureBranch(wording, (field as Division).firstTincture),
      tinctureBranch(wording, (field as Division).secondTincture),
    ],
  });

  if (isVariation(field)) {
    return cut(wordOf(wording.variations, field.type).value, 'variation');
  }
  if (isDivision(field)) {
    return cut(wordOf(wording.divisions, field.type).value, 'division');
  }
  if (isFurred(field)) {
    return cut(wordOf(wording.furs, field.type).value, 'furred field');
  }
  return plainBranch(wording, sown, field);
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
    ? bandNamed(wording.ordinaries, one.type, one.tincture)
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
      ...paintedSaid(wording, field, word, one.tincture),
    ],
  };
}

/**
 * What the thing is painted with, standing under it: the tincture it names, or
 * the phrase that says it takes the field's own two, reversed.
 *
 * The phrase names neither of the two and cannot, so what stands under it is the
 * field it takes them from, bare — which is the same rule the tincture follows,
 * a branch being shown as the arms the word alone amounts to.
 */
function paintedSaid<W extends Word>(
  wording: BlazonWording<W>,
  field: Field,
  word: W,
  tincture: Tinctured
): readonly Branch[] {
  if (!isCounterchanged(tincture)) {
    return tinctureSaid(wording, word, tincture);
  }
  return [
    {
      word: wording.counterchanged.value,
      rank: 'counterchange',
      arms: { field: bare(field) },
      children: [],
    },
  ];
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
