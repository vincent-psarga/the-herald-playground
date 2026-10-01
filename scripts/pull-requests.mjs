/**
 * Writes the list of open work the published demo shows, from what GitHub says
 * is open.
 *
 * Run before the demo is built from main. A preview is built from a branch and
 * never runs this, so it carries the empty list the repository holds and shows
 * no work in progress — which is right: a preview is one piece of the work, and
 * has no business listing the others.
 */
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const DESTINATION = 'demo/preview/PullRequests.ts';

/**
 * How much of a description the demo shows.
 *
 * Enough for an opening line, a picture of what it does and a list of what is
 * still to do, which is how the work tends to be written up. Past that a
 * description turns into the discussion of the work rather than an account of
 * it, and the reader who wants that has the link to the pull request.
 */
const PARAGRAPHS = 3;

/**
 * The opening of a description, which is as much as a list of several can show.
 *
 * Paragraphs are parted by a blank line, and the blank lines are put back: what
 * comes back is markdown still, and a list that was parted from the line
 * introducing it has to stay parted from it to be read as a list at all.
 *
 * A description opening on blank lines, or on nothing at all, has no summary to
 * give.
 */
export function opening(body, paragraphs = PARAGRAPHS) {
  return (body ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
    .slice(0, paragraphs)
    .join('\n\n');
}

/**
 * The pull requests the demo will show, from what `gh` reported.
 *
 * Work opened from a fork is left out. The description is written by whoever
 * opened it and is rendered as markdown on the page, so what is rendered is
 * kept to what someone who can already push to this repository wrote.
 */
export function shown(reported) {
  return reported
    .filter((pull) => !pull.isCrossRepository)
    .map((pull) => ({
      id: pull.number,
      title: pull.title,
      description: opening(pull.body),
      url: pull.url,
    }))
    .sort((one, other) => one.id - other.id);
}

/** The file as it is written, the comment at its head being the same either way. */
export function fileFor(pulls) {
  const head = `/**
 * The work that is open but not yet landed, and the preview each piece of it
 * can be read in.
 *
 * The list below is written by scripts/pull-requests.mjs when the demo is
 * deployed from main, and is committed empty on purpose: a preview is built
 * from a branch, which carries this file as it stands here, so a preview shows
 * no work in progress and offers no way into one. Only the published demo
 * knows what is open, which is the one place that knowing is of any use.
 */
export type PullRequest = {
  /** The number GitHub gave it, which also names its preview. */
  readonly id: number;
  readonly title: string;
  /** The opening paragraph of the description, as markdown. */
  readonly description: string;
  /** The pull request itself, for a reader who wants the whole of it. */
  readonly url: string;
};

`;
  return `${head}export const currentPullRequests: readonly PullRequest[] = ${JSON.stringify(pulls, null, 2)};\n`;
}

function main() {
  const reported = JSON.parse(
    execFileSync(
      'gh',
      [
        'pr',
        'list',
        '--state',
        'open',
        '--limit',
        '100',
        '--json',
        'number,title,body,url,isCrossRepository',
      ],
      { encoding: 'utf8' }
    )
  );
  const pulls = shown(reported);
  writeFileSync(DESTINATION, fileFor(pulls));
  // The file is TypeScript the repository holds, so it is left in the shape the
  // repository writes TypeScript in, whoever ran this and whenever.
  execFileSync('npx', ['prettier', '--write', DESTINATION], { stdio: 'ignore' });
  console.log(
    `${pulls.length} of ${reported.length} open pull requests written to ${DESTINATION}` +
      `${reported.length - pulls.length > 0 ? ` (${reported.length - pulls.length} from forks, left out)` : ''}`
  );
}

// Only when run, so that the pieces above can be read by a test.
if (process.argv[1]?.endsWith('pull-requests.mjs')) {
  main();
}
