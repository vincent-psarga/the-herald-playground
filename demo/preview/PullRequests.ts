/**
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

export const currentPullRequests: readonly PullRequest[] = [];
