import { Blazon, ChargeOrOrdinary, isCharge, isOrdinary } from '../../domain/models/Blazon';
import { ChargeType, numberBorne } from '../../domain/models/Charge';
import { Tinctured, isCounterchanged } from '../../domain/models/Counterchanged';
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
  usualPieces,
} from '../../domain/models/Field';
import { OrdinaryType, SEVERAL, borne } from '../../domain/models/Ordinary';
import { Tincture } from '../../domain/models/Tinctures';
import { NumberWords, counted } from '../../domain/translations/Numbers';
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
  /**
   * What the language says in place of a tincture where a band takes the field's
   * own two, reversed: "de l'un à l'autre", "counterchanged".
   *
   * One word rather than a translation, the model holding one term and each
   * tongue one way of saying it — and a word rather than a bare string, so that
   * what the phrase means travels with it onto the page that lists it.
   */
  readonly counterchanged: W;
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
   * How the language writes what was done to a charge, once the charge and its
   * tincture have been written: "voided", "évidée".
   *
   * What comes back is the modifier alone and not the phrase around it, both
   * tongues writing it last and writing nothing between. What differs is
   * agreement: French agrees the word with the one the charge comes back in, in
   * gender and in number, and English writes it as it stands. So the word the
   * charge was written with is handed over beside it, and how many are borne.
   */
  readonly modify: (word: W, modifier: W, several: boolean) => string;
  /**
   * How a field says it is sown with a figure the language has no word of its
   * own for: "semé de billettes" in French, "semy of billets" in English. The
   * figure arrives as the word for one of it, and both tongues sow it in the
   * plural.
   */
  readonly strew: (word: W) => string;
  /** The conjunction joining the halves of a divided field. */
  readonly conjunction: string;
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
  const field = capitalise(writeField(wording, blazon.field));
  const borne = (blazon.chargesOrOrdinaries ?? [])
    .map((one) => writeBorne(wording, one))
    .join(`${SEPARATOR} `);
  return `${borne === '' ? field : `${field} ${borne}`}.`;
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
 * What was done to the charge stands between the name and the tincture, which is
 * where the armorials of both tongues put it: blazon takes its word order from
 * French, where what qualifies a thing follows the thing and the tincture comes
 * last of all.
 */
function writeBorne<W extends Word>(wording: BlazonWording<W>, one: ChargeOrOrdinary): string {
  const { word, count } = named(wording, one);
  const several = count >= SEVERAL;
  const bearing = wording.bear(word, several ? counted(wording.numbers, count) : undefined);
  const modifier = modifying(wording, one, word)?.(several);
  return [bearing, modifier, painting(wording, one.tincture, word)]
    .filter((part) => part !== undefined)
    .join(' ');
}

/**
 * What the thing is painted with, written after the name.
 *
 * Three answers, and the last of them is silence. A band painted out of the
 * field it is laid on is written with the phrase that says so, there being no
 * tincture to write. A name chosen for the tincture it means has said it by
 * being written — a besant is a gold coin entire — so nothing follows it, and an
 * armorial that wrote the tincture after such a name would be saying the one
 * thing twice. Everything else is written with its tincture.
 */
function painting<W extends Word>(
  wording: BlazonWording<W>,
  tincture: Tinctured,
  named: W
): string | undefined {
  if (isCounterchanged(tincture)) {
    return wording.counterchanged.value;
  }
  return named.defaultTincture === tincture ? undefined : writeTincture(wording, tincture);
}

/**
 * What was done to the charge, written as the language writes it — and nothing
 * at all where the blazon said nothing, or where what is borne is a band, which
 * takes none.
 *
 * It is written between the name and the tincture, which is where both tongues
 * put it: "a lozenge voided or", "à la croix vidée de gueules".
 *
 * Which word says it is asked for the charge as well as for the term, a tongue
 * being free to keep a word apiece for the charges it is said of: French voids
 * the star with évidé and everything else with vidé. It is the same question the
 * name itself is chosen by — a gold roundel is a besant — and it is asked here
 * rather than settled by the term, because two words for the one term is a fact
 * about the tongue and not about what was done to the figure.
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
  if (!isCharge(one) || one.modifier === undefined || named.means(one.modifier)) {
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
 * gave no name to is the roundel it always was.
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
    ? { word: bandNamed(wording.ordinaries, one.type, one.tincture), count: borne(one) }
    : {
        word: wordIn(wording.charges, one.type, one.tincture, one.modifier),
        count: numberBorne(one),
      };
}

/**
 * The word a band is written with: chosen by its tincture where it has one of
 * its own, and by the term alone where it takes the field's.
 *
 * No band of either tongue has a name per tincture today, so the two answers are
 * the same answer. The question is still asked the same way a charge's is, so
 * that the day a tongue names one — heraldry has done it before, a besant being
 * exactly that for a charge — the band is named by the same rule.
 */
export function bandNamed<W extends Word>(
  ordinaries: Translation<OrdinaryType, W>,
  type: OrdinaryType,
  tincture: Tinctured
): W {
  return isCounterchanged(tincture) ? wordOf(ordinaries, type) : wordIn(ordinaries, type, tincture);
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

function writeDivision<W extends Word>(wording: BlazonWording<W>, division: Division): string {
  return writeBetween(wording, nameOf(wording.divisions, division.type), division);
}

/**
 * A furred field is written as a division is — the name, then the two tinctures
 * — because that is all there is to say: no count stands anywhere in the phrase,
 * and neither tongue puts anything between the name and the pair.
 */
function writeFurred<W extends Word>(wording: BlazonWording<W>, furred: Furred): string {
  return writeBetween(wording, nameOf(wording.furs, furred.type), furred);
}

/** A named term and the two tinctures it takes, joined by the conjunction. */
function writeBetween<W extends Word>(
  wording: BlazonWording<W>,
  name: string,
  between: Division | Furred
): string {
  return [
    name,
    writeTincture(wording, between.firstTincture),
    wording.conjunction,
    writeTincture(wording, between.secondTincture),
  ].join(' ');
}

function writeTincture<W extends Word>(wording: BlazonWording<W>, tincture: Tincture): string {
  return wording.introduce(wordOf(wording.tinctures, tincture));
}

function capitalise(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
