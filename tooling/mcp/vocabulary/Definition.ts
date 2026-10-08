import { EnglishBlazonWording } from '../../../src/application/english/EnglishBlazonWording';
import { FrenchBlazonWording } from '../../../src/application/french/FrenchBlazonWording';
import { BlazonWording } from '../../../src/application/writer/BlazonWording';
import { Languages, TONGUES } from '../../../src/domain/models/Languages';
import { Source } from '../../../src/domain/models/Source';
import { TINCTURES, Tincture } from '../../../src/domain/models/Tinctures';
import { Translation, wordOf, wordsOf } from '../../../src/domain/translations/Translation';
import { Word } from '../../../src/domain/translations/Word';
import { folded } from '../../../demo/utils/Anchors';
import { Rank, Sighting, VocabularyEntry, vocabularyIn } from '../../../demo/utils/Vocabulary';

/** Where the demo is published, which is where a reader is sent to see the word drawn. */
const DEMO = 'https://vincent-psarga.github.io/the-herald-playground';

/** A word of the other tongue, or of this one, named with the tongue it belongs to. */
export interface Related {
  readonly word: string;
  readonly language: Languages;
}

/**
 * Everything the library knows about one word of one tongue.
 *
 * Built on the vocabulary page's own entries rather than beside them, so that
 * what the tool answers and what the page shows cannot come to disagree: a word
 * added to the library is a word the tool defines, with nothing to update here.
 */
export interface Definition {
  readonly word: string;
  readonly language: Languages;
  /** What kind of term it is: a charge, an ordinary, a tincture, a modifier… */
  readonly rank: Rank;
  /** Every way the word is written, the one it is written back in first, each with its plural. */
  readonly spellings: readonly { readonly singular: string; readonly plural: string }[];
  readonly description: string;
  readonly sources: readonly Source[];
  /** The other words of the same tongue that say exactly what this one says, as vairy says vairé. */
  readonly synonyms: readonly string[];
  /**
   * The other words of the same tongue for the same term that say something
   * more or other than this one, as rustre says a losange pierced, or bezant a
   * roundel or.
   */
  readonly variations: readonly string[];
  /** What the other tongue says it with, where it says it at all. */
  readonly translations: readonly Related[];
  /** For a modifier, the charges it is said of. */
  readonly appliesTo: readonly string[];
  /** For a charge, the modifiers that may be said of it. */
  readonly takes: readonly string[];
  /** The tinctures the word may be borne in, where it will not take them all. */
  readonly tinctures?: {
    readonly allowed: readonly string[];
    /** The tincture understood when the blazon names none. */
    readonly understood?: string;
  };
  /** The modifier the word already says, as a mascle says a lozenge voided. */
  readonly implies?: string;
  /** A rule about the term itself, where it is governed by one. */
  readonly note?: string;
  /** A blazon carrying this very spelling, and what the library writes it back as where that differs. */
  readonly example: { readonly blazon: string; readonly writtenBack?: string };
  /** Where the vocabulary page shows the word drawn. */
  readonly url: string;
}

/**
 * The words of a tongue's wording and nothing of how it puts them in a sentence,
 * which is all a definition asks of it and what lets French words stand in for
 * words at large: a sentence wants a French word, a list of them does not.
 */
type Vocabulary = Pick<
  BlazonWording,
  | 'tinctures'
  | 'divisions'
  | 'variations'
  | 'furs'
  | 'ordinaries'
  | 'charges'
  | 'modifiers'
  | 'strewings'
>;

const WORDINGS: Record<Languages, Vocabulary> = {
  [Languages.fr]: FrenchBlazonWording,
  [Languages.en]: EnglishBlazonWording,
};

/**
 * Every word a tongue holds under each rank that carries words of its own.
 *
 * The field's two ranks are left out: they are not a term of the model, and the
 * words for them carry nothing a definition has to say beyond their gloss.
 */
function wordsByRank(wording: Vocabulary): ReadonlyMap<Rank, readonly Word[]> {
  const all = (translation: Translation<string, Word>) =>
    Object.keys(translation).flatMap((term) => wordsOf(translation, term));
  return new Map<Rank, readonly Word[]>([
    ['tincture', all(wording.tinctures)],
    ['division', all(wording.divisions)],
    ['variation', all(wording.variations)],
    ['furred field', all(wording.furs)],
    ['ordinary', all(wording.ordinaries)],
    ['charge', all(wording.charges)],
    ['modifier', all(wording.modifiers)],
    [
      'strewing',
      Object.values(wording.strewings).flatMap((named) =>
        named === undefined ? [] : Array.isArray(named) ? named : [named]
      ),
    ],
  ]);
}

const RANKED: Record<Languages, ReadonlyMap<Rank, readonly Word[]>> = {
  [Languages.fr]: wordsByRank(WORDINGS[Languages.fr]),
  [Languages.en]: wordsByRank(WORDINGS[Languages.en]),
};

/** The word behind an entry, where its rank keeps words of its own. */
function wordBehind(entry: VocabularyEntry, language: Languages): Word | undefined {
  return RANKED[language].get(entry.rank)?.find((word) => word.value === entry.word);
}

/** The words a heading of further arms points at, which is how the page says what goes with what. */
function sighted(entry: VocabularyEntry, heading: string): readonly string[] {
  return (entry.otherwise.find((variants) => variants.heading === heading)?.entries ?? [])
    .map((shown) => shown.sighting)
    .filter((sighting): sighting is Sighting => sighting !== undefined)
    .map((sighting) => sighting.word);
}

/** The tinctures a word is held to, said in its own tongue; nothing where it takes them all. */
function tincturesOf(word: Word, language: Languages): Definition['tinctures'] {
  const named = (tincture: Tincture) => wordOf(WORDINGS[language].tinctures, tincture).value;
  if (word.defaultTincture === undefined && word.allowedTinctures.length === TINCTURES.length) {
    return undefined;
  }
  return {
    allowed: word.allowedTinctures.map(named),
    ...(word.defaultTincture === undefined ? {} : { understood: named(word.defaultTincture) }),
  };
}

/**
 * Whether two words of one term say the same thing: the same modifier already
 * said, and the same tinctures understood and allowed. A mascle is a lozenge
 * and a bezant a roundel, but neither says only that.
 */
function saysTheSame(one: Word, other: Word): boolean {
  return (
    one.defaultModifier === other.defaultModifier &&
    one.defaultTincture === other.defaultTincture &&
    one.allowedTinctures.length === other.allowedTinctures.length &&
    one.allowedTinctures.every((tincture) => other.accepts(tincture))
  );
}

function define(entry: VocabularyEntry, language: Languages): Definition {
  const word = wordBehind(entry, language);
  const siblings = entry.alsoHere.map((sighting) => sighting.word);
  // A rank that keeps no words of its own leaves nothing to tell its words
  // apart by, and they are taken for synonyms.
  const isSynonym = (sibling: string) => {
    const other = RANKED[language]
      .get(entry.rank)
      ?.find((candidate) => candidate.value === sibling);
    return word === undefined || other === undefined || saysTheSame(word, other);
  };
  const tinctures = word === undefined ? undefined : tincturesOf(word, language);
  const implies =
    word?.defaultModifier === undefined
      ? undefined
      : wordOf(WORDINGS[language].modifiers, word.defaultModifier).value;
  return {
    word: entry.word,
    language,
    rank: entry.rank,
    spellings:
      word === undefined
        ? entry.spellings.map((singular) => ({ singular, plural: singular }))
        : word.spellings.map(({ value, plural }) => ({ singular: value, plural })),
    description: entry.description,
    sources: entry.sources,
    synonyms: siblings.filter(isSynonym),
    variations: siblings.filter((sibling) => !isSynonym(sibling)),
    translations: entry.otherTongue.map(({ word, language }) => ({ word, language })),
    appliesTo: sighted(entry, 'Said of'),
    takes: sighted(entry, 'Modified'),
    ...(tinctures === undefined ? {} : { tinctures }),
    ...(implies === undefined ? {} : { implies }),
    ...(entry.note === undefined ? {} : { note: entry.note }),
    example: {
      blazon: entry.typed,
      ...(entry.written === undefined ? {} : { writtenBack: entry.written }),
    },
    url: `${DEMO}/doc/vocabulary/${language}#${entry.anchor}`,
  };
}

// Built once per tongue and kept: building one writes and reads back a blazon
// for every word, which a server answering question after question should not
// do again for each of them.
const VOCABULARIES = new Map<Languages, readonly VocabularyEntry[]>();

function vocabularyOf(language: Languages): readonly VocabularyEntry[] {
  const known = VOCABULARIES.get(language);
  if (known !== undefined) {
    return known;
  }
  const built = vocabularyIn(language);
  VOCABULARIES.set(language, built);
  return built;
}

/**
 * Every definition a spelling leads to, in one tongue or in both.
 *
 * A spelling may name more than one thing — besant is a word of both tongues,
 * and the two do not mean the same disc — so the answer is a list, and an empty
 * one where no word of the library is written so. Matched on every spelling a word answers
 * to, with case and accents folded away: whoever asks for "vaire" means vairé.
 * An exact match wins over a folded one, so vairy is not answered with vairé.
 */
export function definitionsOf(spelling: string, language?: Languages): readonly Definition[] {
  const asked = spelling.trim().toLowerCase();
  const tongues = language === undefined ? TONGUES : [language];
  const found = (matches: (candidate: string) => boolean) =>
    tongues.flatMap((tongue) =>
      vocabularyOf(tongue)
        .filter((entry) => entry.spellings.some(matches))
        .map((entry) => define(entry, tongue))
    );
  const exact = found((candidate) => candidate.toLowerCase() === asked);
  return exact.length !== 0 ? exact : found((candidate) => folded(candidate) === folded(asked));
}
