import { Attribute, Attributed, paintedIn } from '../../domain/models/Attributes';
import { Blazon, ChargeOrOrdinary, isCharge, isOrdinary } from '../../domain/models/Blazon';
import { ChargeType, numberBorne } from '../../domain/models/Charge';
import { Modifier } from '../../domain/models/Modifier';
import {
  Division,
  DivisionType,
  Field,
  FurType,
  Furred,
  Plain,
  Semy,
  Variation,
  VariationType,
  isDivision,
  isFurred,
  isVariation,
  saidInTwo,
  sameArms,
  usualPieces,
} from '../../domain/models/Field';
import { OrdinaryType, SEVERAL, borne } from '../../domain/models/Ordinary';
import { Tincture } from '../../domain/models/Tinctures';
import { NumberWords, counted } from '../../domain/translations/Numbers';
import { FIRST } from '../../domain/translations/Ranks';
import { Strewings, strewnIn } from '../../domain/translations/Strewings';
import {
  Translation,
  nameOf,
  wordIn,
  wordOf,
  wordSaidOf,
} from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';

/**
 * What one language contributes to writing a blazon — the counterpart of
 * BlazonGrammar. The sentence has the same shape in every language, so only the
 * words and whatever introduces them differ.
 */
export interface BlazonWording<W extends Word = Word> {
  readonly tinctures: Translation<Tincture, W>;
  readonly divisions: Translation<DivisionType, W>;
  readonly variations: Translation<VariationType, W>;
  readonly furs: Translation<FurType, W>;
  readonly ordinaries: Translation<OrdinaryType, W>;
  readonly charges: Translation<ChargeType, W>;
  readonly modifiers: Translation<Modifier, W>;
  readonly attributes: Translation<Attribute, W>;
  /** What the language calls a field sown with each charge, where it has a word. */
  readonly strewings: Strewings<W>;
  /** How the language counts what a field bears several of. */
  readonly numbers: NumberWords<W>;
  /** How a tincture is introduced: "d'or" in French, plain "or" in English. */
  readonly introduce: (word: W) => string;
  /**
   * How something borne is introduced: "à la fasce" in French, "a fess" in English,
   * and, where several are borne, how many — "à trois chevrons", "three
   * chevrons". The count arrives spelled, the language having said how it spells
   * its numbers; what stands around it is what differs.
   */
  readonly bear: (word: W, count?: string) => string;
  /**
   * How a varied field is written: its name, the two tinctures it alternates —
   * already joined by the conjunction — and how many pieces it is cut into,
   * spelled, and whether that is the number the term is understood to have.
   *
   * Where the count goes, and whether it is written at all, is what the two
   * tongues disagree about: English counts between the name and the tinctures
   * and counts always, French counts after them and keeps quiet when the number
   * is the usual one. So the whole phrase is the language's to assemble.
   */
  readonly vary: (word: W, tinctures: string, pieces: string, usual: boolean) => string;
  /**
   * How the language writes what was done to a band or a charge, once it and its
   * tincture have been written: "voided", "évidée", "dentelée".
   *
   * What comes back is the modifier alone and not the phrase around it, both
   * tongues writing it last and writing nothing between. What differs is
   * agreement: French agrees the word with the one the figure comes back in, in
   * gender and in number, and English writes it as it stands. So the word the
   * figure was named with is handed over beside it, and how many are borne.
   */
  readonly modify: (word: W, modifier: W, several: boolean) => string;
  /**
   * How the language writes the part of a charge that was painted apart:
   * "stoned", "chatonné".
   *
   * What comes back is the word alone and not the tincture after it, that being
   * written as any other tincture is — bare in English and under an article in
   * French. Agreement is what differs, exactly as it does for a modifier, so the
   * word the charge was written with is handed over beside it, and how many are
   * borne.
   */
  readonly paint: (word: W, attribute: W, several: boolean) => string;
  /**
   * How a field says it is sown with a figure the language has no word of its
   * own for: "semé de billettes" in French, "semy of billets" in English. The
   * figure arrives as the word for one of it, and both tongues sow it in the
   * plural.
   */
  readonly strew: (word: W) => string;
  /**
   * How the language says that what is borne is laid over everything else:
   * "à la fasce de gueules brochant sur le tout", "over all a bend gules".
   *
   * The whole phrase is handed over rather than the words alone, because where
   * they stand is exactly what the two tongues disagree about: French writes its
   * participle after what it is said of, English writes its own words in front.
   */
  readonly overAll: (bearing: string) => string;
  /** The conjunction joining the halves of a divided field. */
  readonly conjunction: string;
  /**
   * How the language names the rank of one part of a divided field: "au
   * premier", "au second". The rank arrives as the number it is, counting from
   * one, the language having said how it spells its ranks.
   *
   * A language that does not rank the parts leaves this off — English sets two
   * whole coats side by side another way, naming the dexter first and saying
   * "impaled with" between them — and writes the unranked form, which can say
   * only what the first part bears.
   */
  readonly rank?: (ranks: readonly number[]) => string;
}

/**
 * What is set between one charge and the next. The mark is punctuation rather
 * than vocabulary — a blazon in either language is read with it or without — so
 * it is written here rather than asked of the language.
 *
 * Nothing but a space stands between the field and the first charge, which is
 * how both languages write it: "D'or à trois bandes de sable, à la bordure de
 * gueules", "Or three bends sable, a bordure gules".
 */
const SEPARATOR = ',';

/**
 * Writes a blazon as a sentence: opening capital, closing full stop.
 *
 * A term with several accepted spellings is written with its canonical one, so a
 * blazon read from a synonym comes back out spelled differently. The blazon it
 * describes is the same, which is what the round trip preserves.
 *
 * What the field bears is written in the order the model holds it, which is the
 * order it was laid on the field: what is named last is drawn over the rest, so
 * writing it in any other order would say something else — and a band named
 * after a charge covers that charge exactly as a bordure named after three bends
 * covers the bends.
 */
export function writeBlazon<W extends Word>(wording: BlazonWording<W>, blazon: Blazon): string {
  return `${capitalise(writeArms(wording, blazon))}.`;
}

/**
 * A field and whatever it bears, which is the same phrase wherever it stands:
 * the whole shield says it, and so does either half of a divided field.
 *
 * The sentence is what a blazon is written as, and a half is no sentence — it is
 * written inside one — so the capital and the full stop are put on by the caller
 * that has a sentence to make.
 */
function writeArms<W extends Word>(wording: BlazonWording<W>, blazon: Blazon): string {
  const field = writeField(wording, blazon.field);
  const borne = (blazon.chargesOrOrdinaries ?? [])
    .map((one) => writeBorne(wording, one))
    .join(`${SEPARATOR} `);
  return borne === '' ? field : `${field} ${borne}`;
}

/**
 * A band or a charge, written the one way both are: what introduces it, its
 * name, and the tincture it carries. The count is written only where there is
 * more than one, a single one being named on its own in either tongue.
 *
 * The tincture is written only where the name has not already said it. A word
 * chosen for the tincture it means says it by being written — "a besant" is a
 * gold roundel entire — and an armorial that wrote the tincture after it would
 * be saying the same thing twice. So "d'azur au besant d'or" comes back as
 * "D'azur au besant", which is what the blazon was trying to be.
 *
 * What was done to it stands between the name and the tincture, which is where
 * the armorials of both tongues put it: blazon takes its word order from French,
 * where what qualifies a thing follows the thing and the tincture comes last of
 * all. A band answers here exactly as a charge does — "a fess indented or", "à
 * la fasce dentelée d'or" — the two differing in what may be said and never in
 * where it is written.
 *
 * Unless the line carries a tincture of its own, which is the one thing that
 * moves it: there are then two tinctures to write, and the modifier goes between
 * them so that each stands beside what it belongs to.
 *
 * That it was laid over everything else is written last of all, and written
 * whether or not the order has already said it. The model holds that the blazon
 * said it, and saying it is never wrong — Parker calls the words understood over
 * a particoloured field and "almost indispensable" everywhere else, and a writer
 * that dropped them wherever it judged them understood would be deciding which
 * of those two cases it was in. Where the words go is the language's, not this.
 */
function writeBorne<W extends Word>(wording: BlazonWording<W>, one: ChargeOrOrdinary): string {
  const { word, count } = named(wording, one);
  const several = count >= SEVERAL;
  const bearing = wording.bear(word, several ? counted(wording.numbers, count) : undefined);
  const tincture =
    word.defaultTincture === one.tincture ? undefined : writeTincture(wording, one.tincture);
  const modifier = modifying(wording, one, word)?.(several);
  const line = painting(wording, one);
  // The parts follow the tincture with nothing between, which is how both
  // sources write them — "Gules, three gem-rings argent stoned azure", "au lion
  // de sinople armé et lampassé de gueules". Two runs of them are parted by the
  // mark, there being two tinctures in a row otherwise and no telling which
  // belongs to which.
  const parts = attributing(wording, one, word, several).join(`${SEPARATOR} `);
  // Where the line carries a tincture of its own, the band's own goes first and
  // the modifier stands between the two. Written the usual way round, the two
  // tinctures would come one after the other with nothing between them to say
  // which belonged to which — and a blazon that cannot be read back is not a
  // blazon. It is the order the armorials use, which is why they can say it at
  // all: "à la bande de gueules engrêlée de sable". Only a band paints a line
  // and only a charge has parts, so the two orders never meet.
  const said =
    line === undefined ? [bearing, modifier, tincture] : [bearing, tincture, modifier, line];
  const written = [...said, parts === '' ? undefined : parts]
    .filter((part) => part !== undefined)
    .join(' ');
  return one.overAll === true ? wording.overAll(written) : written;
}

/**
 * The parts of the charge painted apart from the rest, each with its own
 * tincture, written last of all — which is where the armorials of both tongues
 * put them: "Gules, three gem-rings argent stoned azure", "au lion d'or armé de
 * gueules".
 *
 * Which word says a part is asked for the charge as well as for the term, as a
 * modifier's word is: a tongue is free to keep a word apiece for the charges a
 * part is named on.
 *
 * A part the name has already said and that carries no tincture of its own is
 * written nowhere: a gem-ring has a stone by being a gem-ring, and nothing
 * follows. It is the tincture that parts this from a modifier — a name says
 * there is a stone and never what colour it is, so a blazon writing the tincture
 * after such a name is adding to the name rather than repeating it.
 *
 * A part with no tincture that no name says is written out with the charge's
 * own, which says the same thing in as many words. No vocabulary here leaves one
 * so: a part the tongue named no word for would be written every time it is
 * borne, and this is what that would look like.
 */
function attributing<W extends Word>(
  wording: BlazonWording<W>,
  one: ChargeOrOrdinary,
  named: W,
  several: boolean
): readonly string[] {
  if (!isCharge(one) || one.attributes === undefined) {
    return [];
  }
  const painted = one.attributes.flatMap((attributed) => {
    const { attribute, tincture } = attributed;
    if (tincture === undefined && named.defaultAttribute === attribute) {
      return [];
    }
    return [
      {
        said: wording.paint(named, wordSaidOf(wording.attributes, attribute, one.type), several),
        tincture: paintedIn(attributed, one.tincture),
      },
    ];
  });
  return sharing(painted).map(
    (run) => `${listed(run.said, wording.conjunction)} ${writeTincture(wording, run.tincture)}`
  );
}

/**
 * The words of one run, said as a list is said: the mark between all but the
 * last two, and the conjunction before the last.
 *
 * Which is how both dictionaries write it — "armé, lampassé et couronné d'or",
 * "armed, langued, and crowned … gules" — and the conjunction alone where there
 * are only two of them, "armé et lampassé de gueules".
 */
function listed(said: readonly string[], conjunction: string): string {
  return said.length === 1
    ? said[0]
    : `${said.slice(0, -1).join(`${SEPARATOR} `)} ${conjunction} ${said[said.length - 1]}`;
}

/**
 * The parts gathered into runs that share a tincture, in the order the blazon
 * named them.
 *
 * Heraldry says the colour once where two parts have it: "armé et lampassé de
 * gueules", and never "armé de gueules et lampassé de gueules". Only the parts
 * standing next to each other are gathered, the order being the blazon's own and
 * worth keeping.
 */
function sharing(
  painted: readonly { readonly said: string; readonly tincture: Tincture }[]
): readonly { readonly said: readonly string[]; readonly tincture: Tincture }[] {
  const runs: { said: string[]; tincture: Tincture }[] = [];
  for (const { said, tincture } of painted) {
    const last = runs[runs.length - 1];
    if (last !== undefined && last.tincture === tincture) {
      last.said.push(said);
    } else {
      runs.push({ said: [said], tincture });
    }
  }
  return runs;
}

/** The parts a charge had painted, which is none for anything but a charge. */
function partsOf(one: ChargeOrOrdinary): readonly Attribute[] {
  return isCharge(one) ? (one.attributes ?? []).map(({ attribute }: Attributed) => attribute) : [];
}

/**
 * The tincture the line is drawn in, where the blazon gave it one of its own,
 * and nothing at all where it did not.
 *
 * Only a band has a line to paint, so only a band is asked. What it comes back
 * as is a tincture written the way every other tincture is — "de sable",
 * "sable" — there being nothing about this one that either tongue says
 * differently.
 */
function painting<W extends Word>(
  wording: BlazonWording<W>,
  one: ChargeOrOrdinary
): string | undefined {
  return isOrdinary(one) && one.modifierTincture !== undefined
    ? writeTincture(wording, one.modifierTincture)
    : undefined;
}

/**
 * What was done to what is borne, written as the language writes it — and
 * nothing at all where the blazon said nothing.
 *
 * It is written between the name and the tincture, which is where both tongues
 * put it: "a lozenge voided or", "à la croix vidée de gueules", "à la fasce
 * dentelée d'or".
 *
 * A band is asked as a charge is. The two take different modifiers — a charge is
 * voided and a band indented — but that is settled where the term is declared,
 * and by the time a blazon is being written back the question is only which word
 * says it.
 *
 * Which word that is, is asked for the figure as well as for the term, a tongue
 * being free to keep a word apiece for what it is said of: French voids the star
 * with évidé and everything else with vidé. It is the same question the name
 * itself is chosen by — a gold roundel is a besant — and it is asked here rather
 * than settled by the term, because two words for the one term is a fact about
 * the tongue and not about what was done to the figure.
 *
 * Nothing is written at all where the name has already said it. Heraldry gives
 * some of the modified figures a name outright — a lozenge voided is a mascle —
 * and an armorial that wrote the modifier after such a name would be saying the
 * same thing twice, exactly as one writing the tincture after a besant would.
 */
function modifying<W extends Word>(
  wording: BlazonWording<W>,
  one: ChargeOrOrdinary,
  named: W
): ((several: boolean) => string) | undefined {
  if (one.modifier === undefined || named.means(one.modifier)) {
    return undefined;
  }
  const said = wordSaidOf(wording.modifiers, one.modifier, one.type);
  return (several) => wording.modify(named, said, several);
}

/**
 * The word naming what is borne, and how many are borne, both asked of the
 * vocabulary it belongs to — which is the only thing a band and a charge differ
 * in here.
 *
 * Which word is asked for the tincture as well as for the term, a vocabulary
 * being free to keep a name apiece for the tinctures a charge is drawn in: the
 * gold roundel is a besant, the red one a torteau, and the one the armorials
 * gave no name to is the roundel it always was. It is asked for what was done as
 * well, heraldry naming some of the modified figures outright — a lozenge voided
 * is a mascle. Neither tongue has yet named an indented band in one word, so
 * both write the two words; the question is put all the same, so the day one is
 * named the name is written without anything here changing.
 *
 * How many is asked of the model rather than read off the blazon, so that an
 * ordinary borne but once — whatever count it was handed — is written as the one
 * band it is, and comes back as itself when read again.
 */
function named<W extends Word>(
  wording: BlazonWording<W>,
  one: ChargeOrOrdinary
): { readonly word: W; readonly count: number } {
  return isOrdinary(one)
    ? {
        word: wordIn(wording.ordinaries, one.type, one.tincture, one.modifier),
        count: borne(one),
      }
    : {
        word: wordIn(wording.charges, one.type, one.tincture, one.modifier, partsOf(one)),
        count: numberBorne(one),
      };
}

function writeField<W extends Word>(wording: BlazonWording<W>, field: Field): string {
  if (isVariation(field)) {
    return writeVariation(wording, field);
  }
  if (isDivision(field)) {
    return writeDivision(wording, field);
  }
  return isFurred(field) ? writeFurred(wording, field) : writePlain(wording, field);
}

/** A field of one tincture, and what it has been sown with where it has been. */
function writePlain<W extends Word>(wording: BlazonWording<W>, field: Plain): string {
  const tincture = writeTincture(wording, field.tincture);
  return field.semy === undefined ? tincture : [tincture, writeSemy(wording, field.semy)].join(' ');
}

/**
 * What a field was sown with, under the field's own word for the strewing where
 * the language has one and sown in as many words where it has not.
 *
 * Heraldry would rather name a strewing than describe one — Parker calls the
 * special term preferable — so "billeté" is written where "semé de billettes"
 * would have said the same, and French and English each write whichever of the
 * two they have.
 *
 * The tincture is written only where the word has not already said it, by the
 * same rule that governs anything borne: a besanté is gold entire, and the gold
 * written after it would be saying the one thing twice.
 */
function writeSemy<W extends Word>(wording: BlazonWording<W>, semy: Semy): string {
  const named = strewnIn(wording.strewings, semy.type, semy.tincture);
  const word = named ?? wordIn(wording.charges, semy.type, semy.tincture);
  const sowing = named === undefined ? wording.strew(word) : word.value;
  return word.defaultTincture === semy.tincture
    ? sowing
    : [sowing, writeTincture(wording, semy.tincture)].join(' ');
}

/**
 * The number is written out of the model rather than left to be understood, and
 * the language is told whether it is the usual one: a tongue that keeps quiet
 * about six needs to know that six is what it was given.
 */
function writeVariation<W extends Word>(wording: BlazonWording<W>, variation: Variation): string {
  return wording.vary(
    wordOf(wording.variations, variation.type),
    [
      writeTincture(wording, variation.firstTincture),
      wording.conjunction,
      writeTincture(wording, variation.secondTincture),
    ].join(' '),
    counted(wording.numbers, variation.pieces),
    variation.pieces === usualPieces(variation.type)
  );
}

/**
 * The name of the line, then the parts: as two arms joined by the conjunction
 * where the blazon can be written that way, and ranked where it cannot.
 *
 * The unranked form is preferred wherever it says the whole truth, because it is
 * what the armorials write: "parti d'azur et d'or" comes back out as itself, and
 * a first half carrying more says more in the same place — "Parti d'azur à trois
 * fleurs de lys d'or et d'hermine".
 *
 * It cannot say everything. What the first half bears reads back as the first
 * half's, both tongues writing it between that half's tincture and the
 * conjunction; what the second half bears does not, a blazon written that way
 * laying it on the shield when it is read again. And a field of four parts has
 * no unranked form at all beyond its two tinctures. So the ranked form is
 * written wherever the unranked one would come back as different arms, and the
 * choice is made by asking what the unranked form would say rather than by
 * listing the cases.
 *
 * A tongue with no ranks writes the unranked form regardless. It is the only
 * form it has, and what it cannot say it cannot say: English ranks quarters but
 * not the halves of a partition, and marshals two coats with "impaled with"
 * instead.
 */
function writeDivision<W extends Word>(wording: BlazonWording<W>, division: Division): string {
  const ranked = wording.rank;
  const name = nameOf(wording.divisions, division.type);
  if (ranked === undefined || saidInTwo(division)) {
    const [first, second] = division.parts;
    return [name, writeArms(wording, first), wording.conjunction, writeArms(wording, second)].join(
      ' '
    );
  }
  const phrases = repeating(division.parts).map(
    ({ ranks, arms }) => `${ranked(ranks)} ${writeArms(wording, arms)}`
  );
  return [`${name}${SEPARATOR}`, phrases.join(`${SEPARATOR} `)].join(' ');
}

/**
 * The parts gathered into the phrases a ranked blazon writes: the parts carrying
 * the same arms under one rank, in the order their first rank comes.
 *
 * This is how the armorials write a quartered field — "aux 1 et 4 d'azur au
 * chevron d'or ; aux 2 et 3, d'azur à trois colombes d'argent" — and saying it
 * part by part instead would be writing the coat twice where heraldry writes it
 * once. Parts are gathered only where they carry the very same arms, which is
 * the only thing one phrase can claim about several.
 */
function repeating(
  parts: readonly Blazon[]
): readonly { readonly ranks: readonly number[]; readonly arms: Blazon }[] {
  const phrases: { ranks: number[]; arms: Blazon }[] = [];
  parts.forEach((arms, part) => {
    const already = phrases.find((phrase) => sameArms(phrase.arms, arms));
    if (already === undefined) {
      phrases.push({ ranks: [FIRST + part], arms });
    } else {
      already.ranks.push(FIRST + part);
    }
  });
  return phrases;
}

/**
 * A furred field is written as a division of two bare halves is — the name, then
 * the two tinctures — because that is all there is to say: no count stands
 * anywhere in the phrase, neither tongue puts anything between the name and the
 * pair, and a pelt has no halves for anything to be laid on.
 */
function writeFurred<W extends Word>(wording: BlazonWording<W>, furred: Furred): string {
  return [
    nameOf(wording.furs, furred.type),
    writeTincture(wording, furred.firstTincture),
    wording.conjunction,
    writeTincture(wording, furred.secondTincture),
  ].join(' ');
}

function writeTincture<W extends Word>(wording: BlazonWording<W>, tincture: Tincture): string {
  return wording.introduce(wordOf(wording.tinctures, tincture));
}

function capitalise(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
