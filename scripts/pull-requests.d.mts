/** What `gh pr list` reports of one pull request, of the fields asked for. */
export type Reported = {
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly url: string;
  readonly isCrossRepository: boolean;
};

/** One pull request as the demo shows it. */
export type Shown = {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly url: string;
};

export function opening(body: string | null | undefined, paragraphs?: number): string;
export function shown(reported: readonly Reported[]): readonly Shown[];
export function fileFor(pulls: readonly Shown[]): string;
