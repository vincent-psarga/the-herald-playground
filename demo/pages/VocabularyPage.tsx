import { Link, useLocation, useSearchParams } from 'react-router';
import { Languages } from '../../src/domain/models/Languages';
import { Reference } from '../components/Reference';
import { anchorOf } from '../utils/Anchors';
import { Colouring } from '../utils/Colourings';
import { LANGUAGES } from '../utils/Languages';
import { tally } from '../utils/Tally';
import { Rank, VocabularyEntry, struckIn, vocabularyIn, vocabularyPath } from '../utils/Vocabulary';

/**
 * What each rank is called where several of it are counted.
 *
 * Keyed on Rank, so a rank added to the vocabulary breaks the page until it is
 * said what a number of them is called.
 */
const SEVERAL: Record<Rank, readonly [string, string]> = {
  tincture: ['tincture', 'tinctures'],
  division: ['partition', 'partitions'],
  variation: ['varied field', 'varied fields'],
  'furred field': ['furred field', 'furred fields'],
  ordinary: ['ordinary', 'ordinaries'],
  charge: ['charge', 'charges'],
  modifier: ['modifier', 'modifiers'],
  attribute: ['attribute', 'attributes'],
  strewing: ['strewing', 'strewings'],
  'over all': ['word for what is laid over all', 'words for what is laid over all'],
  counterchange: ['counterchange', 'counterchanges'],
  field: ['word for the field itself', 'words for the field itself'],
};

const RANKS = Object.keys(SEVERAL) as Rank[];

/** The address a kind of word answers to, the whole vocabulary having none. */
const OF = 'of';

/** One kind of word, counted, and the address that shows only those. */
interface Kind {
  /** The rank it sifts to, or nothing at all for the whole vocabulary. */
  readonly rank?: Rank;
  /** How many there are, said as the extent has always said it. */
  readonly counted: string;
  readonly to: string;
}

/**
 * Every kind of word there is, each with how many of it the vocabulary holds.
 *
 * Counted off the vocabulary rather than written down, so that a word added to
 * it cannot leave the page claiming there are fewer — and a rank nothing is
 * filed under is left out rather than offered as an empty page.
 *
 * Each address is written out whole rather than as a search hung off wherever
 * the reader stands. A page reached under a route with a parameter in it cannot
 * say "here" and be understood: a relative "." resolves to the head of the
 * routes, and a bare search resolves against whatever path happens to be
 * current.
 */
function kindsOf(entries: readonly VocabularyEntry[], whole: string): readonly Kind[] {
  return [
    { counted: tally(entries.length, 'word'), to: whole },
    ...RANKS.map((rank) => ({
      rank,
      count: entries.filter((entry) => entry.rank === rank).length,
    }))
      .filter(({ count }) => count !== 0)
      .map(({ rank, count }) => ({
        rank,
        counted: tally(count, ...SEVERAL[rank]),
        to: `${whole}?${OF}=${anchorOf(rank)}`,
      })),
  ];
}

/** The kind an address asks for, where it asks for one this vocabulary files. */
function siftedTo(entries: readonly VocabularyEntry[], asked: string | null): Rank | undefined {
  return RANKS.find((rank) => anchorOf(rank) === asked && entries.some((e) => e.rank === rank));
}

/**
 * The kind asked for, unless the word asked for is not one of them.
 *
 * Every link that stays on this page carries the kind along with it, so that a
 * reader who has sifted the vocabulary down to the charges is still among the
 * charges a word later. Some of those links lead out of the kind all the same:
 * the losange shows what it is voided as, and voided is a modifier.
 *
 * So the kind gives way to the word rather than the other way about. The stack
 * widens to hold what is being read, which a reader sees happen; the alternative
 * is answering a reader who asked for vidé with a charge they did not ask for.
 */
function holding(
  entries: readonly VocabularyEntry[],
  rank: Rank | undefined,
  hash: string
): Rank | undefined {
  const asked = struckIn(entries, hash);
  return asked === undefined || asked.rank === rank ? rank : undefined;
}

export interface VocabularyPageProps {
  /** The tongue whose words this page is a page of. */
  readonly language: Languages;
  readonly colourings?: readonly Colouring[];
}

/**
 * One tongue's whole vocabulary, alphabetically, a word at a time.
 *
 * There is a page apiece rather than one page holding both, because a reader
 * comes to this with a word in hand and the word is in one tongue: the French
 * armorial says croisette and the English one says cross couped, and neither
 * reader should have to wade through the other's half to find theirs. What each
 * word is in the other tongue is said on the word itself, and links across.
 */
export function VocabularyPage({ language, colourings }: VocabularyPageProps) {
  const whole = vocabularyIn(language);
  // Which kind is being read is the address's to say, as which word is: a reader
  // who has sifted the vocabulary down to the charges can send someone the
  // charges, and the browser's own back button walks back out of them.
  const sifted = holding(whole, siftedTo(whole, useSearchParams()[0].get(OF)), useLocation().hash);
  const entries = sifted === undefined ? whole : whole.filter((entry) => entry.rank === sifted);

  return (
    <Reference
      title={`The ${LANGUAGES[language].named} vocabulary`}
      extent={<Kinds kinds={kindsOf(whole, vocabularyPath(language))} sifted={sifted} />}
      language={language}
      entries={entries}
      vocabulary={whole}
      colourings={colourings}
      lead={
        <>
          <p className="plane__lead">
            Every word the parser reads in {LANGUAGES[language].named}, filed under its own letter —
            the tinctures a field may be painted with, the lines it may be cut along, the bands and
            figures it may bear, and the words for what it has been sown with or for its carrying
            nothing at all. A word with an accent is filed under the letter without one, which is
            where a reader looks for it.
          </p>
          <p className="plane__lead">
            Choose any word to read it at full size, or a kind above to be shown those alone.
          </p>
        </>
      }
    />
  );
}

interface KindsProps {
  readonly kinds: readonly Kind[];
  readonly sifted?: Rank;
}

/**
 * What the vocabulary holds, and the way to each part of it.
 *
 * The extent of the page was a sentence counting the kinds, which a reader read
 * once and could do nothing with. It counts the same things in the same words
 * and each of them is now a way in, the one being read struck as a word in the
 * stack is struck: the line says what there is and sifts to it, where it used to
 * only say.
 *
 * The counts are of the whole vocabulary and stay so while one kind is read. A
 * count that fell to nothing beside every kind but the one in hand would leave a
 * reader unable to see what else there was to ask for.
 */
function Kinds({ kinds, sifted }: KindsProps) {
  return (
    <nav className="sift" aria-label="Kinds of word">
      {kinds.map(({ rank, counted, to }) => (
        <Link
          key={counted}
          className="sift__kind"
          to={to}
          aria-current={rank === sifted ? 'true' : undefined}
        >
          {counted}
        </Link>
      ))}
    </nav>
  );
}
