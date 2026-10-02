import { EnglishBlazonWording } from '../../src/application/english/EnglishBlazonWording';
import { FrenchBlazonWording } from '../../src/application/french/FrenchBlazonWording';
import { sownIn } from '../../src/application/french/FrenchGrammar';
import { BlazonWording, writeBlazon } from '../../src/application/writer/BlazonWording';
import { Blazon, BorneType, ChargeOrOrdinary } from '../../src/domain/models/Blazon';
import { ChargeType, allowsModifier, modifiersOf } from '../../src/domain/models/Charge';
import { Modifier } from '../../src/domain/models/Modifier';
import {
  DivisionType,
  FieldType,
  FurType,
  Plain,
  VariationType,
  usualPieces,
} from '../../src/domain/models/Field';
import {
  OrdinaryDefinitions,
  OrdinaryType,
  admitsModifier,
  isOrdinaryType,
  modifiersOn,
} from '../../src/domain/models/Ordinary';
import { COLOURS, Colours, Metals, Tincture, isFur } from '../../src/domain/models/Tinctures';
import { counted } from '../../src/domain/translations/Numbers';
import { EnglishNumbers } from '../../src/domain/translations/en/Numbers';
import { OF, SOWN as EnglishSown } from '../../src/domain/translations/en/Strewings';
import { FrenchWord } from '../../src/domain/translations/fr/FrenchWord';
import { FrenchPlain } from '../../src/domain/translations/fr/Plain';
import { SOWN as FrenchSown } from '../../src/domain/translations/fr/Strewings';
import { Strewings } from '../../src/domain/translations/Strewings';
import {
  Translation,
  wordOf,
  wordSaidOf,
  wordsOf,
} from '../../src/domain/translations/Translation';
import { Source } from '../../src/domain/models/Source';
import { Word } from '../../src/domain/translations/Word';
import { anchorOf, folded, isAnchored, letterOf } from './Anchors';
import { Languages } from '../../src/domain/models/Languages';
import { readBlazon } from './Reading';

/**
 * A term, under the rank it is a term of.
 *
 * The rank is the only thing that can tell two identical spellings apart — a
 * word is a charge or a band or a tincture, and nothing about the spelling says
 * which — and it is the only thing that can say what the term is, the model
 * keeping a vocabulary of its own for each rank. So the two are paired here
 * rather than a rank being carried beside a term that could have come from any
 * of them: say the rank and the term is known, which is what lets a page ask
 * the model about a word without first swearing to what it is.
 *
 * Two ranks share a vocabulary and neither is the other: a charge is strewn over
 * a field, so a strewing is named after a ChargeType, but the word that sows it
 * is not the word that bears it and the two are shown differently.
 *
 * The field's own two name no term of the model. The model holds a term for the
 * plain field, but no word of either tongue is that term's name — a plain field
 * is written as its tincture and nothing else — and "plain" and "semé" say what
 * a field carries rather than how it is cut. So the two are named here and
 * nowhere else.
 */
export type Ranked =
  | { readonly rank: 'tincture'; readonly term: Tincture }
  | { readonly rank: 'division'; readonly term: DivisionType }
  | { readonly rank: 'variation'; readonly term: VariationType }
  | { readonly rank: 'furred field'; readonly term: FurType }
  | { readonly rank: 'ordinary'; readonly term: OrdinaryType }
  | { readonly rank: 'charge'; readonly term: ChargeType }
  | { readonly rank: 'modifier'; readonly term: Modifier }
  | { readonly rank: 'strewing'; readonly term: ChargeType }
  | { readonly rank: 'field'; readonly term: typeof PLAIN_TERM | typeof SOWN_TERM };

/**
 * The rank a word belongs to, read off the pairing rather than written down
 * twice: a rank with no term to go with it would be a rank the page can show
 * and the model cannot be asked about.
 */
export type Rank = Ranked['rank'];

/** What a term is, under a given rank. */
type TermOf<R extends Rank> = Extract<Ranked, { rank: R }>['term'];

/** A word elsewhere in the vocabulary, and the way to it. */
export interface Sighting {
  readonly word: string;
  readonly anchor: string;
  /** Which tongue's page holds it, a word being reachable across the two. */
  readonly language: Languages;
}

/** The same word in arms of its own, where one drawing does not tell the whole. */
export interface Otherwise {
  readonly label: string;
  readonly blazon: Blazon;
  readonly typed: string;
  /**
   * The word the label names, where the label names one.
   *
   * A charge shown modified is labelled with the modifier and a modifier shown
   * at work is labelled with the charge, and either is a word of its own with a
   * page of its own: the label is the way there. What it replaces is a list of
   * the same words set apart from the arms that show them, which said the thing
   * twice and showed it once.
   */
  readonly sighting?: Sighting;
}

/** Further arms under one heading, each heading answering one question. */
export interface Variants {
  readonly heading: string;
  readonly entries: readonly Otherwise[];
}

/** One word of one tongue: everything the page shows of it. */
export interface VocabularyEntry {
  /** The address it answers to, which is the spelling and, where two spellings
   * collide, the rank as well. */
  readonly anchor: string;
  /** The spelling the word is written in, which is the one shown. */
  readonly word: string;
  /** Every spelling the word answers to, the one it is written in first. */
  readonly spellings: readonly string[];
  readonly rank: Rank;
  /** Whether the rank must be shown beside the word, another word sharing it. */
  readonly qualified: boolean;
  /** The letter of the index it is filed under, accents folded away. */
  readonly letter: string;
  /** What the word means, which the page prints as it stands. */
  readonly description: string;
  /** Who says so, for a reader who wants the authority rather than the summary. */
  readonly sources: readonly Source[];
  /** The arms that show the word. */
  readonly blazon: Blazon;
  /** A blazon a reader could type, carrying this very spelling. */
  readonly typed: string;
  /** What the library answers with, where it does not answer with what was typed. */
  readonly written?: string;
  /** Why the typed blazon was refused, which is a bug and is shown as one. */
  readonly refused?: string;
  /** The other spellings of the same term in this tongue. */
  readonly alsoHere: readonly Sighting[];
  /** What the other tongue says it with, where it says it at all. */
  readonly otherTongue: readonly Sighting[];
  /** A rule about the term itself, where the term is governed by one. */
  readonly note?: string;
  /**
   * Everything one drawing cannot say, each question under a heading of its own.
   *
   * A charge borne twice, a charge sown and a charge voided are three different
   * answers about the one word, and a reader looking for one of them should not
   * have to pick it out of the other two. Empty where the single drawing says
   * all there is.
   */
  readonly otherwise: readonly Variants[];
}

// A word with nothing of its own to say is shown gules on argent, which is what
// every page of this documentation has always shown. A word that is a tincture
// as well as a shape is shown in the tincture it means, and the field turns to
// whichever of the two keeps the rule of tincture — metal on colour, colour on
// metal. A fur is never chosen, only ever shown.
const METAL = Metals.argent;
const COLOUR = Colours.gules;

// The number of pieces a varied field is drawn in where its term is understood
// to have none.
const PIECES = 8;

// The figure sown to show a sowing said in as many words: neither tongue names a
// strewing of it, so neither can write the sentence any shorter.
const SOWN_FIGURE = ChargeType.annulet;

const PLAIN_TERM = 'Field.plain';
const SOWN_TERM = 'Field.sown';

const CHARGE_TYPES = Object.values(ChargeType);
const ORDINARY_TYPES = Object.values(OrdinaryType);

/**
 * What a modifier may be said of, in the order the model declares them: the
 * charges first, then the bands.
 *
 * A modifier is not a thing to be drawn on its own — there is no picture of
 * "voided" — so it is shown doing what it does to something, and the first thing
 * that will take it is what it is shown on. Both vocabularies are asked, neither
 * holding the other's modifiers: a charge is voided and a band is indented, and
 * a page that asked only about the charges would show the indenting on nothing
 * at all.
 *
 * Which they are is asked of the model rather than written down here, so
 * anything that stops taking a modifier stops being shown under it.
 */
function bearingModifier(modifier: Modifier): readonly BorneType[] {
  return [
    ...CHARGE_TYPES.filter((type) => allowsModifier(type, modifier)),
    ...ORDINARY_TYPES.filter((type) => admitsModifier(type, modifier)),
  ];
}

/**
 * What one word of a modifier is shown on: the figures that take the modifier
 * and that this very word is what the writer says it with.
 *
 * A tongue may hold two words for the one modifier and keep each for its own
 * figures — French voids the star with évidé and the rest with vidé — so a page
 * showing every voidable charge under both words would be showing a reader a
 * blazon neither word ever comes back in. Which word wins which is asked of the
 * writer rather than written down here, so the page cannot come to disagree with
 * what the library answers.
 *
 * Where a word wins nothing, the figures that take the modifier are shown all
 * the same: the word is still read of every one of them, and a page with no arms
 * on it teaches nothing.
 */
function saidBy<W extends Word>(
  wording: BlazonWording<W>,
  modifier: Modifier,
  word: W
): readonly BorneType[] {
  const borne = bearingModifier(modifier);
  const won = borne.filter((type) => wordSaidOf(wording.modifiers, modifier, type) === word);
  return won.length === 0 ? borne : won;
}

/**
 * The word a tongue names something borne with, asked of the vocabulary the term
 * belongs to — which is the only thing a band and a charge differ in here.
 */
function borneWord<W extends Word>(wording: BlazonWording<W>, type: BorneType): W {
  return isOrdinaryType(type) ? wordOf(wording.ordinaries, type) : wordOf(wording.charges, type);
}

/** The rank a term belongs to, which is what a way to its page is asked under. */
function rankOf(type: BorneType): Rank {
  return isOrdinaryType(type) ? 'ordinary' : 'charge';
}

/**
 * One thing borne, under a modifier. Written out either way rather than in one
 * line, the two shapes being two types for all that they are spelled alike.
 */
function under(type: BorneType, tincture: Tincture, modifier: Modifier): ChargeOrOrdinary {
  return isOrdinaryType(type) ? { type, tincture, modifier } : { type, tincture, modifier };
}

/**
 * One term as one tongue spells it, which may be several words.
 *
 * The rank and the term travel together, so asking the rank says what the term
 * is: a sense of rank 'ordinary' carries an OrdinaryType, and the page can hand
 * it to the model's own record of the ordinaries without asserting anything.
 */
type Sense<W extends Word = Word> = Ranked & {
  readonly words: readonly W[];
};

/**
 * What one tongue contributes to the page.
 *
 * Its vocabulary is the wording the writer already uses, so the page lists the
 * words the library actually reads and writes rather than a second list kept
 * beside them. Two words stand outside it: the one French calls a bare field by,
 * which is never written back, and the one either tongue sows a figure with,
 * which the wording holds inside a sentence rather than as a word.
 */
interface Tongue<W extends Word = Word> {
  readonly code: Languages;
  readonly wording: BlazonWording<W>;
  /** The word for a field that carries nothing, where the tongue has one. */
  readonly plain?: W;
  /** The words for a field sown with a figure the tongue has no single word for. */
  readonly sown: readonly W[];
  /** How this tongue sows a figure under a given spelling of that word. */
  readonly sowing: (spelling: string) => (word: W) => string;
}

const FRENCH: Tongue<FrenchWord> = {
  code: Languages.fr,
  wording: FrenchBlazonWording,
  plain: FrenchPlain,
  sown: [FrenchSown],
  sowing: (spelling) => (word) => `${spelling} ${sownIn(word)}`,
};

const ENGLISH: Tongue = {
  code: Languages.en,
  wording: EnglishBlazonWording,
  sown: EnglishSown,
  sowing: (spelling) => (word) => `${spelling} ${OF} ${word.plural}`,
};

/** Every word one tongue knows, in the order its vocabulary declares them. */
function sensesOf<W extends Word>(tongue: Tongue<W>): readonly Sense<W>[] {
  const { wording } = tongue;
  return [
    ...spelled('tincture', wording.tinctures),
    ...spelled('division', wording.divisions),
    ...spelled('variation', wording.variations),
    ...spelled('furred field', wording.furs),
    ...spelled('ordinary', wording.ordinaries),
    ...spelled('charge', wording.charges),
    ...spelled('modifier', wording.modifiers),
    ...strewn(wording.strewings),
    ...(tongue.plain === undefined
      ? []
      : [{ rank: 'field', term: PLAIN_TERM, words: [tongue.plain] } satisfies Sense<W>]),
    { rank: 'field', term: SOWN_TERM, words: tongue.sown } satisfies Sense<W>,
  ];
}

/**
 * The senses of one rank, read off the vocabulary that rank is kept in.
 *
 * The rank names which vocabulary is owed — 'ordinary' takes the ordinaries and
 * nothing else — so a rank paired with the wrong vocabulary is a compiler error
 * rather than a page quietly showing a charge where a band belongs.
 *
 * Both casts are the compiler's blind spot rather than a claim: Object.keys
 * forgets what it was given, and a rank still generic here cannot be matched to
 * its arm of the union until it is known. Each caller below has it known.
 */
function spelled<R extends Rank, W extends Word>(
  rank: R,
  translation: Translation<TermOf<R>, W>
): readonly Sense<W>[] {
  return (Object.keys(translation) as TermOf<R>[]).map(
    (term) => ({ rank, term, words: wordsOf(translation, term) }) as Sense<W>
  );
}

/** The strewings a tongue names, which is never all of them. */
function strewn<W extends Word>(strewings: Strewings<W>): readonly Sense<W>[] {
  return (Object.keys(strewings) as ChargeType[])
    .map((term) => {
      const named = strewings[term];
      const words = named === undefined ? [] : Array.isArray(named) ? named : [named];
      return { rank: 'strewing' as const, term, words };
    })
    .filter((sense) => sense.words.length !== 0);
}

/**
 * The tincture a word is shown in.
 *
 * Its own, where the word means one — a hurt is azure by being a hurt — and
 * otherwise the colour every other term of the documentation is shown in. A fur
 * is chosen last and only where the word will take nothing else, a fur being a
 * thing to show rather than a thing to show something in.
 */
function borneIn(word: Word): Tincture {
  return (
    word.defaultTincture ??
    [COLOUR, METAL, ...word.allowedTinctures.filter((tincture) => !isFur(tincture))].find(
      (tincture) => word.accepts(tincture)
    ) ??
    word.allowedTinctures[0]
  );
}

/**
 * What the word says was done to the figure, where it says anything.
 *
 * Spread into the arms rather than set on them, so that a word saying nothing
 * leaves the key off entirely — which is what the model holds for a charge
 * nothing was done to, and what it must be handed back for the page's blazons to
 * read as the ones a reader would type.
 */
function modified(word: Word): { modifier?: Modifier } {
  return word.defaultModifier === undefined ? {} : { modifier: word.defaultModifier };
}

/** The field a tincture is shown against: metal on colour, colour on metal. */
function against(tincture: Tincture): Tincture {
  return (COLOURS as readonly Tincture[]).includes(tincture) ? METAL : COLOUR;
}

/** The arms that show a word, and nothing else. */
function armsOf<W extends Word>(tongue: Tongue<W>, sense: Sense<W>, word: W): Blazon {
  const borne = borneIn(word);
  switch (sense.rank) {
    case 'tincture':
      return { field: { type: FieldType.plain, tincture: sense.term } };
    // A division and a furred field are written the same way and are kept apart
    // because the model declares their terms under different kinds: it asks
    // which of the two a field is by the term it carries, and answering with
    // either would be answering with neither.
    case 'division':
      return {
        field: { type: sense.term, firstTincture: METAL, secondTincture: COLOUR },
      };
    case 'furred field':
      return {
        field: { type: sense.term, firstTincture: METAL, secondTincture: COLOUR },
      };
    case 'variation':
      return {
        field: {
          type: sense.term,
          firstTincture: METAL,
          secondTincture: COLOUR,
          pieces: usualPieces(sense.term) ?? PIECES,
        },
      };
    // The plain band, whatever lines it may also be drawn along: a band's name
    // means the band and never the line, so no word here has a modifier to show
    // in the arms that stand for it. What it may be drawn along is shown below.
    case 'ordinary':
      return {
        field: { type: FieldType.plain, tincture: against(borne) },
        chargesOrOrdinaries: [{ type: sense.term, tincture: borne }],
      };
    // What the word already says was done to the figure is part of the arms, as
    // the tincture it already means is: a mascle is a lozenge voided, and a page
    // showing the word over a plain lozenge would be showing a reader the wrong
    // drawing under the right word.
    case 'charge':
      return {
        field: { type: FieldType.plain, tincture: against(borne) },
        chargesOrOrdinaries: [{ type: sense.term, tincture: borne, ...modified(word) }],
      };
    case 'modifier': {
      // Shown on the first thing that will take it, and in whatever tincture that
      // figure's own word allows — a modifier means no tincture and names no
      // figure, so everything about the arms but the modifier comes from what it
      // is shown doing its work on. A band as readily as a charge: the indenting
      // is said of no charge at all.
      const modifier = sense.term;
      const type = saidBy(tongue.wording, modifier, word)[0] ?? CHARGE_TYPES[0];
      const shown = borneIn(borneWord(tongue.wording, type));
      return {
        field: { type: FieldType.plain, tincture: against(shown) },
        chargesOrOrdinaries: [under(type, shown, modifier)],
      };
    }
    case 'strewing':
      return {
        field: {
          type: FieldType.plain,
          tincture: against(borne),
          semy: { type: sense.term, tincture: borne },
        },
      };
    case 'field':
      return sense.term === PLAIN_TERM
        ? { field: { type: FieldType.plain, tincture: COLOUR } }
        : {
            field: {
              type: FieldType.plain,
              tincture: METAL,
              semy: { type: SOWN_FIGURE, tincture: COLOUR },
            },
          };
  }
}

/**
 * The tongue's own vocabulary, narrowed to the one spelling being shown.
 *
 * The writer chooses a term's word for itself, and choosing well is exactly what
 * it is for: a roundel gules comes back a torteau. A page showing the word
 * "roundel" would then be showing a blazon that never says it. So the writer is
 * handed a vocabulary in which this term has one word — this one — and writes
 * the example with it. Nothing is assembled by hand, and the result is read back
 * by the parser before it is shown.
 */
function insisting<W extends Word>(tongue: Tongue<W>, sense: Sense<W>, word: W): BlazonWording<W> {
  const { wording } = tongue;
  const only = { [sense.term]: [word] };
  switch (sense.rank) {
    case 'tincture':
      return { ...wording, tinctures: { ...wording.tinctures, ...only } };
    case 'division':
      return { ...wording, divisions: { ...wording.divisions, ...only } };
    case 'variation':
      return { ...wording, variations: { ...wording.variations, ...only } };
    case 'furred field':
      return { ...wording, furs: { ...wording.furs, ...only } };
    case 'ordinary':
      return { ...wording, ordinaries: { ...wording.ordinaries, ...only } };
    case 'charge':
      return { ...wording, charges: { ...wording.charges, ...only } };
    case 'modifier':
      return { ...wording, modifiers: { ...wording.modifiers, ...only } };
    case 'strewing':
      return { ...wording, strewings: { ...wording.strewings, ...only } };
    case 'field':
      return sense.term === SOWN_TERM ? { ...wording, strew: tongue.sowing(word.value) } : wording;
  }
}

/**
 * A blazon carrying this very spelling.
 *
 * Written by the writer under the narrowed vocabulary, except for the one word
 * no writer will ever produce: French calls a bare field plain and the model
 * holds nothing of it, so that one is said after the field the writer wrote —
 * which is exactly where an armorial says it.
 */
function typing<W extends Word>(tongue: Tongue<W>, sense: Sense<W>, word: W, blazon: Blazon) {
  const written = writeBlazon(insisting(tongue, sense, word), blazon);
  return sense.term === PLAIN_TERM ? `${written.replace(/\.$/, '')} ${word.value}.` : written;
}

/**
 * Why an ordinary is borne but once, for the four that are.
 *
 * The vocabulary says which they are; this says why, which is a thing to be read
 * rather than derived. Written without naming the band, so that the one sentence
 * serves whichever tongue the reader came in by: the reason is the shield's and
 * not the word's. Keyed on OrdinaryType, so an ordinary added to the vocabulary
 * breaks the page until it is said whether it has a reason.
 */
const BUT_ONCE: Record<OrdinaryType, string | undefined> = {
  [OrdinaryType.chief]:
    'Borne but once. It is not a band laid somewhere on the shield but the top of the shield itself, and a shield has one top.',
  [OrdinaryType.pale]: undefined,
  [OrdinaryType.fess]: undefined,
  [OrdinaryType.barGemel]: undefined,
  [OrdinaryType.bend]: undefined,
  [OrdinaryType.bendSinister]: undefined,
  [OrdinaryType.chevron]: undefined,
  [OrdinaryType.cross]:
    'Borne but once. The four arms are one charge, not two bands: repeated, they become small crosses strewn over the field rather than a band laid on it.',
  [OrdinaryType.saltire]:
    'Borne but once. The two limbs are one charge, and repeating them makes charges of them too, never a second band.',
  [OrdinaryType.bordure]:
    'Borne but once. It is not a band laid across the field but the edge of the shield, and a shield has one edge.',
};

/**
 * How many pieces a varied field is understood to have, and what this tongue
 * does about it.
 *
 * The two disagree here and nowhere else, so the note is the one place the page
 * has to be written twice: French leaves the understood number unwritten and
 * English writes it all the same, and a reader of one tongue has no business
 * being told the other's rule in place of their own.
 *
 * Where no number is understood the two agree, and say so alike.
 */
const COUNTING: Record<Languages, (pieces: string) => string> = {
  [Languages.fr]: (pieces) =>
    `${pieces} pieces understood, and left unwritten: the number is blazoned only where it is some other. The pieces are even, always — an odd count is how heraldry says bars borne on a field instead.`,
  [Languages.en]: (pieces) =>
    `${pieces} pieces understood, and blazoned all the same: the number is written whether or not it is the usual one. The pieces are even, always — an odd count is how heraldry says bars borne on a field instead.`,
};

function counting(type: VariationType, language: Languages): string {
  const usual = usualPieces(type);
  return usual === undefined
    ? 'No number understood, so the pieces are counted every time and a blazon that leaves the count out is refused rather than guessed at. They interlock rather than follow one another, so an odd count is as good as an even one.'
    : COUNTING[language](capitalise(counted(EnglishNumbers, usual)));
}

/**
 * What a tongue asks of a modifier beyond what the word itself says.
 *
 * French asks something and English asks nothing. A French participle agrees
 * with what it qualifies, in gender and in number, and with what the blazon
 * called the figure rather than with what the figure is — a rule a reader has to
 * be told. An English one agrees with nothing and stands where every modifier
 * stands, which is a rule about blazon rather than about English: it is said
 * once on the conventions page for both tongues, and a note repeating it here
 * would be filling the page with what the word does not say.
 */
const MODIFIER_NOTE: Partial<Record<Languages, (word: Word) => string>> = {
  [Languages.fr]: (word) =>
    `Said of a band or a charge after its tincture, and never on its own: it names no figure and no tincture, only what was done to one. It agrees with what it is said of in gender and in number — ${writings(word)} — and agrees with what the blazon called that figure, so a losange borne “au” is said masculine and borne “à la” feminine. Written back, it agrees with the gender the figure itself is written in. Anything that will not take it refuses it by name.`,
};

/**
 * The ways a word is written to agree with what it qualifies, read off the word
 * rather than written down beside it.
 *
 * A tongue holds more than one word for the one modifier — French voids a charge
 * with évidé and with vidé — and a note that quoted one of them on the other's
 * page would be showing a reader the wrong four words.
 */
function writings(word: Word): string {
  return word instanceof FrenchWord
    ? [word.value, word.plural, word.feminine, word.feminines].join(', ')
    : word.value;
}

const FURRED_NOTE =
  'Named where the fur itself is not. A fur is a tincture and carries its pair with it, so naming it is the whole of what a blazon says; a furred field is owed the two tinctures its figures are cut from.';

function noteOn<W extends Word>(sense: Sense<W>, word: W, language: Languages): string | undefined {
  switch (sense.rank) {
    case 'ordinary':
      return BUT_ONCE[sense.term];
    case 'variation':
      return counting(sense.term, language);
    case 'furred field':
      return FURRED_NOTE;
    case 'modifier':
      return MODIFIER_NOTE[language]?.(word);
    default:
      return undefined;
  }
}

// Two and three, which is enough to show what a count does to the drawing.
const COUNTS: readonly (readonly [string, number])[] = [
  ['Twice', 2],
  ['Thrice', 3],
];

/**
 * The same word in further arms, where a single drawing does not tell the whole.
 *
 * A band may be borne in number; a charge may be borne in number, sown, and
 * borne under whatever may be said of it; a varied field may be cut into some
 * other count. Each of those is a different question about the one word, so each
 * gets a heading of its own rather than being shovelled under one that has to
 * name all three at once. Everything else says all it has to say once.
 *
 * Where the arms show another word at work — the charge under a modifier, the
 * modifier doing its work to a charge — the label is that word and carries the
 * way to it. That is the only place the pairing is written: a list of the same
 * words standing apart from the arms that show them said the thing twice, and
 * the arms are the half that teaches.
 */
function otherwise<W extends Word>(
  tongue: Tongue<W>,
  sense: Sense<W>,
  word: W,
  whereabouts: (rank: Rank, word: Word) => Sighting
): readonly Variants[] {
  const say = (blazon: Blazon, label: string, sighting?: Sighting): Otherwise => ({
    label,
    blazon,
    typed: typing(tongue, sense, word, blazon),
    ...(sighting === undefined ? {} : { sighting }),
  });
  const borne = borneIn(word);
  const field: Plain = { type: FieldType.plain, tincture: against(borne) };

  // Handed the figure rather than reading it off the sense, a closure being
  // where what the rank told us about the term is forgotten again.
  const inNumber = (one: ChargeOrOrdinary): Variants => ({
    heading: 'Borne in number',
    entries: COUNTS.map(([label, count]) =>
      say({ field, chargesOrOrdinaries: [{ ...one, count }] }, label)
    ),
  });

  // What may be said of something, shown as it is drawn rather than only named: a
  // reader who has never met the word learns more from the teeth on the band
  // than from being told there are some. Which modifiers those are is the word's
  // affair as well as the term's — a mascle is a lozenge voided already, so the
  // voiding is what it answers to and the piercing is a thing it refuses.
  const underModifiers = (type: BorneType, modifiers: readonly Modifier[]): readonly Variants[] =>
    modifiers.length === 0
      ? []
      : [
          {
            heading: 'Modified',
            entries: modifiers.map((modifier) => {
              // Named as the blazon beneath it names it, agreement and all: a
              // billette is vidée and a tourteau is vidé, and a label that said
              // otherwise would be teaching the reader the wrong word. Which word
              // that is, is the figure's own affair as well as the tongue's — the
              // étoile is évidée where everything else is vidé.
              const said = wordSaidOf(tongue.wording.modifiers, modifier, type);
              return say(
                { field, chargesOrOrdinaries: [under(type, borne, modifier)] },
                capitalise(tongue.wording.modify(word, said, false)),
                whereabouts('modifier', said)
              );
            }),
          },
        ];

  if (sense.rank === 'ordinary') {
    const type = sense.term;
    // A band takes no modifier its own name already means — neither tongue has
    // named an indented band in one word — so what the word will take is what the
    // band will take.
    const modifiers = modifiersOn(type).filter((modifier) => word.takes(modifier));
    return [
      ...(OrdinaryDefinitions[type].canBeBorneInNumbers
        ? [inNumber({ type, tincture: borne })]
        : []),
      ...underModifiers(type, modifiers),
    ];
  }

  if (sense.rank === 'charge') {
    const type = sense.term;
    const modifiers = modifiersOf(type).filter((modifier) => word.takes(modifier));
    // A word that already says what was done cannot be sown: a field is sown
    // with a charge and not with a charge under a modifier, so a semy of mascles
    // is a blazon the model cannot hold, and a page that wrote it would be
    // drawing plain lozenges under the word for the voided one.
    const said = modified(word).modifier;
    return [
      inNumber({ type, tincture: borne, ...modified(word) }),
      ...(said === undefined
        ? [
            {
              heading: 'Sown',
              entries: [
                say({ field: { ...field, semy: { type, tincture: borne } } }, 'Over the field'),
              ],
            },
          ]
        : []),
      ...underModifiers(type, modifiers),
    ];
  }

  if (sense.rank === 'modifier') {
    // Everything it is written of, drawn under it: a modifier is not a thing to
    // be drawn on its own, so what it does is the whole of what a page can show.
    // The first of them is the arms above as well, the word having to be shown
    // doing its work somewhere before the reader reaches this.
    const modifier = sense.term;
    const said = saidBy(tongue.wording, modifier, word);
    if (said.length === 0) {
      return [];
    }
    return [
      {
        heading: 'Said of',
        entries: said.map((type) => {
          const named = borneWord(tongue.wording, type);
          const shown = borneIn(named);
          return say(
            {
              field: { type: FieldType.plain, tincture: against(shown) },
              chargesOrOrdinaries: [under(type, shown, modifier)],
            },
            capitalise(named.value),
            whereabouts(rankOf(type), named)
          );
        }),
      },
    ];
  }

  if (sense.rank === 'variation') {
    const type = sense.term;
    return [
      {
        heading: 'Cut otherwise',
        entries: (usualPieces(type) === undefined ? [5, 10] : [4, 10]).map((pieces) =>
          say(
            { field: { type, firstTincture: METAL, secondTincture: COLOUR, pieces } },
            `In ${pieces}`
          )
        ),
      },
    ];
  }

  return [];
}

/**
 * The fewest words of the other tongue that between them mean everything this
 * one means.
 *
 * A word carries the tinctures it will take, and the two tongues do not divide
 * them alike: English keeps a name for every colour of roundel and French keeps
 * two, one for the metals and one for the colours. So a hurt is a tourteau and
 * nothing else, a tourteau is a roundel and nothing else — English having no one
 * word for the coloured discs alone — and a roundel is the besant and the
 * tourteau together, neither reaching the other's half.
 *
 * Where the word already means a tincture, the word that tongue would write for
 * that tincture leads, so that a besant answers to a besant before it answers to
 * anything wider.
 *
 * What was done to the charge is settled before any of that, and settled
 * strictly: a word that says a modifier is answered by the words that say the
 * same one, and a word that says none by the words that say none. A mascle is a
 * macle, and neither is the losange. Where the other tongue named no such figure
 * the plain names answer instead — English has no word for the pierced star, so
 * the molette leads to the mullet, which is as near as English comes.
 */
function covering(word: Word, candidates: readonly Word[]): readonly Word[] {
  const meaning = candidates.filter((candidate) => candidate.means(word.defaultModifier));
  const saying =
    meaning.length === 0
      ? candidates.filter((candidate) => candidate.defaultModifier === undefined)
      : meaning;
  const chosen = new Set<Word>();
  const led =
    word.defaultTincture === undefined
      ? undefined
      : (saying.find((candidate) => candidate.defaultTincture === word.defaultTincture) ??
        saying.find((candidate) => candidate.accepts(word.defaultTincture as Tincture)));
  if (led !== undefined) {
    chosen.add(led);
  }

  const owed = new Set(
    word.allowedTinctures.filter(
      (tincture) =>
        saying.some((candidate) => candidate.accepts(tincture)) &&
        !(led !== undefined && led.accepts(tincture))
    )
  );
  while (owed.size !== 0) {
    let best: Word | undefined;
    let gain = 0;
    for (const candidate of saying) {
      if (chosen.has(candidate)) {
        continue;
      }
      const takes = Array.from(owed).filter((tincture) => candidate.accepts(tincture)).length;
      if (takes > gain) {
        best = candidate;
        gain = takes;
      }
    }
    if (best === undefined) {
      break;
    }
    chosen.add(best);
    for (const tincture of Array.from(owed)) {
      if (best.accepts(tincture)) {
        owed.delete(tincture);
      }
    }
  }
  // The word the tongue would write for the tincture this one means leads, the
  // rest following in the order their own vocabulary declares them.
  return [
    ...(led === undefined ? [] : [led]),
    ...saying.filter((candidate) => chosen.has(candidate) && candidate !== led),
  ];
}

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** Everything one tongue's page shows, in the order the letters of the index run. */
function vocabularyOf<W extends Word, O extends Word>(
  tongue: Tongue<W>,
  other: Tongue<O>
): readonly VocabularyEntry[] {
  const senses = sensesOf(tongue);
  const theirs = new Map(
    sensesOf(other).map((sense) => [`${sense.rank}/${sense.term}`, sense.words])
  );

  // Which spellings name more than one thing, and so must say which they name.
  const seen = new Map<string, number>();
  for (const sense of senses) {
    for (const word of sense.words) {
      const name = anchorOf(word.value);
      seen.set(name, (seen.get(name) ?? 0) + 1);
    }
  }

  // Where a word stands, so that one entry can point at another.
  const whereabouts = (rank: Rank, word: Word, language: Languages): Sighting => ({
    word: word.value,
    anchor: anchorOf(word.value, (seen.get(anchorOf(word.value)) ?? 0) > 1 ? rank : undefined),
    language,
  });

  const entries = senses.flatMap((sense) =>
    sense.words.map((word): VocabularyEntry => {
      const qualified = (seen.get(anchorOf(word.value)) ?? 0) > 1;
      const blazon = armsOf(tongue, sense, word);
      const typed = typing(tongue, sense, word, blazon);
      const read = readBlazon(typed, tongue.code);
      const written = 'blazon' in read ? writeBlazon(tongue.wording, read.blazon) : undefined;
      return {
        anchor: anchorOf(word.value, qualified ? sense.rank : undefined),
        word: word.value,
        spellings: word.spellings.map((spelling) => spelling.value),
        rank: sense.rank,
        qualified,
        letter: letterOf(word.value),
        description: word.descriptions.en.value,
        sources: word.descriptions.en.sources,
        blazon,
        typed,
        written: written === typed ? undefined : written,
        refused: 'refused' in read ? read.refused : undefined,
        alsoHere: sense.words
          .filter((sibling) => sibling !== word)
          .map((sibling) => whereabouts(sense.rank, sibling, tongue.code)),
        otherTongue: covering(word, theirs.get(`${sense.rank}/${sense.term}`) ?? []).map(
          (counterpart) => ({
            word: counterpart.value,
            anchor: anchorOf(counterpart.value),
            language: other.code,
          })
        ),
        note: noteOn(sense, word, tongue.code),
        otherwise: otherwise(tongue, sense, word, (rank, of) => whereabouts(rank, of, tongue.code)),
      };
    })
  );

  return [...entries].sort(
    (one, another) =>
      folded(one.word).localeCompare(folded(another.word)) || one.rank.localeCompare(another.rank)
  );
}

/**
 * The word an address names, out of these.
 *
 * A word answers to every way it is written and not only to the one it is
 * written in: whoever met "bezant" in an armorial looks that up, and is shown
 * the word it is a writing of.
 *
 * Nothing where the address names no word of this set — which is a question the
 * page asks as well as the pane that draws the answer, a vocabulary sifted down
 * to one kind having to know whether the word being read is still among them.
 */
export function struckIn(
  entries: readonly VocabularyEntry[],
  hash: string
): VocabularyEntry | undefined {
  return (
    entries.find((entry) => isAnchored(entry.anchor, hash)) ??
    entries.find((entry) =>
      entry.spellings.some((spelling) => isAnchored(anchorOf(spelling), hash))
    )
  );
}

/**
 * The vocabulary of one tongue, every word of it, filed under its own letter.
 *
 * Built rather than written down: what the page lists is what the wording holds,
 * so a word added to the library arrives on the page of itself and a word taken
 * away leaves it.
 */
export function vocabularyIn(language: Languages): readonly VocabularyEntry[] {
  return language === Languages.fr ? vocabularyOf(FRENCH, ENGLISH) : vocabularyOf(ENGLISH, FRENCH);
}

/** The letters the vocabulary of a tongue runs to, each with the words filed under it. */
export function lettersOf(
  entries: readonly VocabularyEntry[]
): readonly { readonly letter: string; readonly entries: readonly VocabularyEntry[] }[] {
  const letters: { letter: string; entries: VocabularyEntry[] }[] = [];
  for (const entry of entries) {
    const last = letters[letters.length - 1];
    if (last !== undefined && last.letter === entry.letter) {
      last.entries.push(entry);
    } else {
      letters.push({ letter: entry.letter, entries: [entry] });
    }
  }
  return letters;
}

/** Where a tongue's vocabulary is read. */
export function vocabularyPath(language: Languages): string {
  return `/doc/vocabulary/${language}`;
}
