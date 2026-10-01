import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Armorial, ArmorialEntry } from '../../src/domain/models/Armorial';
import { BlazonLink } from '../components/Reference';
import { SearchField } from '../components/SearchField';
import { LANGUAGES } from '../utils/Languages';
import { sought } from '../utils/Searching';
import { tally } from '../utils/Tally';

/** As wide as the roll draws them, this being the same evidence in a shorter row. */
const ARMS = 72;

/**
 * Where one armorial is read. The index and whatever routes the host keeps have
 * to agree on the address, so it is written once, here.
 */
export function armorialPath(armorial: Armorial): string {
  return `/armorial/${armorial.slug}`;
}

/** One entry with the roll it stands in, a search across armorials losing that otherwise. */
type Held = {
  readonly armorial: Armorial;
  readonly entry: ArmorialEntry;
};

/** Every entry the page carries, each still knowing whose it is. */
function everyEntry(armorials: readonly Armorial[]): readonly Held[] {
  return armorials.flatMap((armorial) => armorial.entries.map((entry) => ({ armorial, entry })));
}

export interface ArmorialsPageProps {
  /** The armorials the host carries. It owns them; the page only shows them. */
  readonly armorials: readonly Armorial[];
}

export function ArmorialsPage({ armorials }: ArmorialsPageProps) {
  const held = useMemo(() => everyEntry(armorials), [armorials]);
  // The search reaches across the rolls rather than into one of them: a reader
  // looking for a macle has no reason to know which roll blazons one, and
  // picking a roll first is the question they came here unable to answer.
  const [query, setQuery] = useState('');
  const found = useMemo(
    () => sought(held, query, ({ entry }) => [entry.name, entry.blazon]),
    [held, query]
  );
  const searching = query.trim() !== '';

  return (
    <main className="plane">
      <h1>Armorials</h1>
      <p className="plane__extent">
        {tally(armorials.length, 'armorial')} · {tally(held.length, 'entry', 'entries')}
      </p>
      <p className="plane__lead">
        Rolls of arms copied from their sources, blazon and all, and read by the parser as they
        stand. They are evidence rather than examples: nothing here was written to be parsed, so
        each one says plainly how much of it the parser could read.
      </p>

      <SearchField label="Search every armorial" value={query} onChange={setQuery}>
        {searching &&
          found.length !== 0 &&
          `${found.length} of ${tally(held.length, 'entry', 'entries')}`}
      </SearchField>

      {/* The rolls give way to what was asked for. Each entry found names the
          roll it came from, so the way in is still there while a search is on. */}
      {searching ? <Found held={found} /> : <Index armorials={armorials} />}
    </main>
  );
}

function Index({ armorials }: { readonly armorials: readonly Armorial[] }) {
  return (
    <nav className="index" aria-label="Armorials">
      {armorials.map((armorial) => (
        <Link key={armorial.slug} to={armorialPath(armorial)}>
          <span className="index__name">{armorial.name}</span>
          <p className="index__note">
            {tally(armorial.entries.length, 'entry', 'entries')} ·{' '}
            {LANGUAGES[armorial.language].named} · {armorial.licence}
          </p>
        </Link>
      ))}
    </nav>
  );
}

/**
 * The entries a search found, drawn from every roll at once.
 *
 * The arms are the source's own and the parser draws none here: what the parser
 * made of a blazon is shown beside it on the roll it belongs to, and the blazon
 * leads to the translator, where a reading is spelled out in full and so is a
 * refusal.
 */
function Found({ held }: { readonly held: readonly Held[] }) {
  if (held.length === 0) {
    return <p className="plane__lead">No entry of any armorial answers to that.</p>;
  }

  return (
    <>
      <p className="plane__lead">
        Entries from every roll, the most matches first. Each blazon leads to the translator.
      </p>
      <ol className="found" aria-label="Entries found">
        {held.map(({ armorial, entry }, index) => (
          <li className="found__entry" key={`${armorial.slug}-${index}-${entry.name}`}>
            {entry.image !== '' && (
              <img className="found__arms" src={entry.image} alt="" width={ARMS} loading="lazy" />
            )}
            <div className="found__said">
              <b className="found__name">{entry.name}</b>
              <BlazonLink blazon={entry.blazon} language={armorial.language} />
              <Link className="found__of" to={armorialPath(armorial)}>
                {armorial.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
