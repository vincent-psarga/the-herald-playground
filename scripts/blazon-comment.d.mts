import type { Change } from './new-blazons.mjs';

/** Where the comment's links and drawings are written from. */
export type Preview = {
  /** The preview's own address, as the deploy that published it reports it. */
  readonly preview: string;
  /** The commit the arms were drawn from, which is what keeps a proxy honest. */
  readonly sha: string;
};

/** A comment as the API reports it, of the two fields this reads. */
export type Comment = {
  readonly id: number;
  readonly body?: string | null;
};

export const MARKER: string;

export function escaped(text: string): string;
export function commentFor(changes: readonly Change[], where: Preview): string;
export function standing(comments: readonly Comment[]): Comment | undefined;
