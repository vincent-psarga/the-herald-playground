/**
 * The comment a pull request carries saying which blazons it newly reads.
 *
 * One comment, written once and edited after: a reader wants the branch as it
 * stands, not a push-by-push history of it, and a thread of near-identical
 * comments is how a useful thing becomes noise. It is found again by a marker
 * hidden in its first line.
 *
 * Run after the preview is published, for two reasons. The arms are served from
 * the preview, so a comment written before it is up would show broken images
 * for as long as whoever proxies them cares to remember; and the address to
 * write every link from is the deploy's own answer rather than this script's
 * guess at it.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gainedIn, lostIn } from './new-blazons.mjs';

/**
 * How the comment is found again on the next push.
 *
 * Named for this repository rather than for what it does: the preview action
 * leaves a sticky comment of its own, by the same author and with a marker of
 * the same shape, and the two must not be mistaken for one another.
 */
export const MARKER = '<!-- herald:new-blazons -->';

/**
 * How many entries are shown before the list is cut short.
 *
 * Not a limit of the medium — a comment holds some sixty-five thousand
 * characters, which is a few hundred of these. It is that one word of
 * vocabulary can unlock dozens of entries at once, and a list past this length
 * has stopped being read: what it is for is seeing what the work did, and forty
 * is more than enough to see it.
 */
const SHOWN = 40;

/** Fewer, a loss being a thing to look into rather than to browse. */
const SHOWN_LOST = 20;

/** As wide as the roll draws them, which is as small as arms can be read. */
const ARMS = 72;
const ARMS_TALL = Math.round((ARMS * 240) / 200);

const NOTHING = 'This branch reads no blazon that main does not, and stops reading none.';

const GONE =
  'The preview for this pull request has been taken down, so the arms this comment showed are no longer served.';

/** One or several, said the way the demo says it. */
function tally(count, one, several = `${one}s`) {
  return `${count} ${count === 1 ? one : several}`;
}

/**
 * Text that will be read as text.
 *
 * Nothing in the armorials needs this today — no name and no blazon of the
 * three rolls holds a character markdown would take for punctuation. They are
 * transcribed by hand from somebody else's page, though, and the next roll
 * copied in is under no obligation to be as well behaved.
 */
export function escaped(text) {
  return text.replace(/([\\`*_[\]<>|])/g, '\\$1');
}

/** The preview's own address, with whatever is wanted under it. */
function at(preview, path) {
  return `${preview.replace(/\/+$/, '')}/${path}`;
}

/**
 * One entry: its name, leading to where it is read; the arms the drawer made of
 * it; and the blazon the source wrote, which is the sentence that now parses.
 *
 * The drawing is asked for at the size the roll draws it rather than the two
 * hundred and forty the drawer hands over, forty of those being a comment
 * several screens tall before a word of it is read. It says what it is arms of,
 * for a reader who cannot see it.
 */
function gainedEntry(armorial, entry, { preview, sha }) {
  const anchor = at(preview, `armorial/${armorial.slug}#${entry.slug}`);
  // The drawing at an address is replaced by the next push and the address is
  // not, so whoever proxies it is told the commit it was drawn from. Without
  // that, a reader is shown the drawing a previous push left there.
  const arms = `${at(preview, `arms/${armorial.slug}/${entry.slug}.svg`)}?v=${sha}`;
  const name = entry.name ?? entry.slug;
  return [
    `**[${escaped(name)}](${anchor})**`,
    '',
    `<img src="${arms}" alt="The arms of ${name}, as the parser read them" width="${ARMS}" height="${ARMS_TALL}" />`,
    '',
    `> ${escaped(entry.blazon ?? '')}`,
  ].join('\n');
}

/** One entry that stopped reading. There is no drawing to show: it did not parse. */
function lostEntry(entry) {
  const name = entry.name ?? entry.slug;
  return entry.blazon === undefined
    ? `**${escaped(name)}** — no longer in the roll`
    : [`**${escaped(name)}**`, '', `> ${escaped(entry.blazon)}`].join('\n');
}

/**
 * One half of the comment: the entries of each armorial under the armorial's
 * own name, in the order the rolls hold them, down to however many are shown.
 */
function section(heading, changes, pick, write, shown) {
  const blocks = [];
  let left = shown;
  let over = 0;
  for (const armorial of changes) {
    const entries = pick(armorial);
    if (entries.length === 0) {
      continue;
    }
    const taken = entries.slice(0, Math.max(left, 0));
    left -= taken.length;
    over += entries.length - taken.length;
    if (taken.length !== 0) {
      blocks.push(
        [`### ${escaped(armorial.name)}`, ...taken.map((entry) => write(armorial, entry))].join(
          '\n\n'
        )
      );
    }
  }
  return [`# ${heading}`, ...blocks, ...(over === 0 ? [] : [`…and ${over} more.`])].join('\n\n');
}

/**
 * The comment, whole.
 *
 * A branch that changed nothing still gets a body: where a comment is already
 * standing from an earlier push, it has to be brought down to the truth rather
 * than left saying what the branch used to do.
 */
export function commentFor(changes, { preview, sha }) {
  const gained = gainedIn(changes);
  const lost = lostIn(changes);
  if (gained === 0 && lost === 0) {
    return `${MARKER}\n\n${NOTHING}\n`;
  }

  const halves = [];
  if (gained !== 0) {
    halves.push(
      section(
        `${tally(gained, 'newly supported blazon')}`,
        changes,
        (armorial) => armorial.gained,
        (armorial, entry) => gainedEntry(armorial, entry, { preview, sha }),
        SHOWN
      )
    );
  }
  if (lost !== 0) {
    halves.push(
      section(
        `${tally(lost, 'blazon')} no longer read`,
        changes,
        (armorial) => armorial.lost,
        (_armorial, entry) => lostEntry(entry),
        SHOWN_LOST
      )
    );
  }
  return `${MARKER}\n\n${halves.join('\n\n')}\n`;
}

/** Our comment among the pull request's, found by the marker it carries. */
export function standing(comments) {
  return comments.find(({ body }) => typeof body === 'string' && body.includes(MARKER));
}

const api = (...args) => JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8' }));

/**
 * Every comment on the pull request.
 *
 * Paged by hand rather than left to the client: a long thread puts ours past
 * the first page, and a comment that cannot be found is a second comment
 * posted beside the first.
 */
function commentsOn(repository, pull) {
  const comments = [];
  for (let page = 1; ; page += 1) {
    const got = api(`repos/${repository}/issues/${pull}/comments?per_page=100&page=${page}`);
    comments.push(...got);
    if (got.length < 100) {
      return comments;
    }
  }
}

function main() {
  const gone = process.argv.includes('--gone');
  const changesAt = process.argv[2];
  const { GITHUB_REPOSITORY: repository, PULL_NUMBER: pull, PREVIEW_URL: preview } = process.env;
  const sha = (process.env.HEAD_SHA ?? '').slice(0, 7);

  let body;
  if (gone) {
    body = `${MARKER}\n\n${GONE}\n`;
  } else {
    let changes;
    try {
      changes = JSON.parse(readFileSync(changesAt, 'utf8'));
    } catch {
      // Nothing was worked out, there having been no reading to work it out
      // against. Saying nothing is the honest answer.
      console.log(`No changes at ${changesAt}. No comment to leave.`);
      return;
    }
    body = commentFor(changes, { preview, sha });
  }

  const already = standing(commentsOn(repository, pull));
  if (already === undefined && gone) {
    console.log('No comment of ours on this pull request. Nothing to take down.');
    return;
  }

  const where =
    already === undefined
      ? `repos/${repository}/issues/${pull}/comments`
      : `repos/${repository}/issues/comments/${already.id}`;
  // --raw-field, never --field: the latter reads a value that looks like a
  // number or a boolean as one, and a body is a string whatever it says.
  api(where, '--method', already === undefined ? 'POST' : 'PATCH', '--raw-field', `body=${body}`);
  console.log(
    already === undefined
      ? 'Comment left on the pull request.'
      : `Comment ${already.id} brought up to date.`
  );
}

// Only when run, so that the pieces above can be read by a test.
if (process.argv[1]?.endsWith('blazon-comment.mjs')) {
  main();
}
