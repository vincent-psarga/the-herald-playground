/**
 * Which blazons a branch reads that main did not, and which it stopped reading.
 *
 * A coverage table says how far the parser got. It does not say what it got,
 * and what it got is the whole interest of a piece of work: some blazon nobody
 * could read before now reads, and it is worth seeing rather than counting.
 *
 * Run before a pull request's preview is published. The arms are drawn into the
 * build so that they go up with it — a comment can only show an image that is
 * served from somewhere, and the only place serving this branch's work is its
 * own preview — and what changed is written out for the step that writes the
 * comment, once the preview is up and its address is known.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readArmorials, readSlugs } from './armorials.mjs';

const BASELINE = process.argv[2] ?? 'baseline/coverage.json';
const ARMS = process.argv[3] ?? 'demo/dist/arms';
const CHANGES = process.argv[4] ?? 'new-blazons.json';

/**
 * What a shield's edge is drawn in here.
 *
 * The demo draws its edge in near-parchment, which is chosen for a page
 * committed to a dark ground. These arms are read on a comment instead, whose
 * ground is whichever of the two the reader keeps, so the edge is a middle grey
 * that holds against either rather than one picked for one of them.
 */
const OUTLINE = '#6e7781';

/**
 * What the two readings say of each armorial: the entries read now and not
 * before, and the entries read before and not now.
 *
 * An armorial the baseline never knew is wholly gained, which is right — a roll
 * added by the work is blazons the site reads that it did not. An armorial
 * neither reading has anything to say about is left out altogether.
 *
 * An entry that was read and is now gone from the roll is reported by its slug
 * alone: there is no name left in this tree to report it under, and a reading
 * that quietly dropped it would be the one worth seeing.
 */
export function changed(baseline, current) {
  const before = new Map(baseline.map((one) => [one.slug, new Set(one.readSlug ?? [])]));
  return current
    .map((armorial) => {
      const was = before.get(armorial.slug) ?? new Set();
      const now = new Set(readSlugs(armorial));
      const held = new Map(armorial.entries.map((entry) => [entry.slug, entry]));
      const told = (slug) => {
        const entry = held.get(slug);
        return entry === undefined
          ? { slug }
          : { slug, name: entry.name, blazon: entry.blazon.trim() };
      };
      return {
        slug: armorial.slug,
        name: armorial.name,
        gained: [...now].filter((slug) => !was.has(slug)).map(told),
        lost: [...was].filter((slug) => !now.has(slug)).map(told),
      };
    })
    .filter(({ gained, lost }) => gained.length !== 0 || lost.length !== 0);
}

/** How many entries a set of changes gained, across every armorial in it. */
export function gainedIn(changes) {
  return changes.reduce((running, one) => running + one.gained.length, 0);
}

/** How many it lost. */
export function lostIn(changes) {
  return changes.reduce((running, one) => running + one.lost.length, 0);
}

/**
 * Whether a baseline says which blazons it read, rather than only how many.
 *
 * A coverage reading taken before the entries had slugs counts them and names
 * none, and a reading like that cannot be differenced: read as an empty list it
 * would call every blazon on the branch newly supported, which is both wrong
 * and several hundred entries long. One armorial that cannot say disqualifies
 * the whole reading — half a difference is worse than none, because it looks
 * like an answer.
 */
export function namesWhatItRead(baseline) {
  return Array.isArray(baseline) && baseline.every((one) => Array.isArray(one.readSlug));
}

async function main() {
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(BASELINE, 'utf8')).armorials.each;
  } catch {
    baseline = undefined;
  }
  if (!namesWhatItRead(baseline)) {
    // The ordinary state of a first run, of a baseline old enough to have been
    // swept up, and of one taken before this was recorded at all. Nothing can
    // be called new against nothing, and saying so is better than calling the
    // whole of it new.
    console.log(`No coverage at ${BASELINE} naming what it read. Nothing to call new.`);
    return;
  }

  const { armorials, draw } = await readArmorials();
  const changes = changed(baseline, armorials);
  const drawn = new Map(
    armorials.flatMap((armorial) =>
      armorial.entries.map((entry) => [`${armorial.slug}/${entry.slug}`, entry.read])
    )
  );

  for (const armorial of changes) {
    for (const entry of armorial.gained) {
      const at = join(ARMS, armorial.slug, `${entry.slug}.svg`);
      mkdirSync(dirname(at), { recursive: true });
      writeFileSync(at, draw(drawn.get(`${armorial.slug}/${entry.slug}`), OUTLINE));
    }
  }

  mkdirSync(dirname(CHANGES) === '' ? '.' : dirname(CHANGES), { recursive: true });
  writeFileSync(CHANGES, `${JSON.stringify(changes, null, 2)}\n`);
  console.log(
    `${gainedIn(changes)} blazons newly read and ${lostIn(changes)} no longer read, written to ${CHANGES}.`
  );
}

// Only when run, so that the pieces above can be read by a test.
if (process.argv[1]?.endsWith('new-blazons.mjs')) {
  await main();
}
