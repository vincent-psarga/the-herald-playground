import type { Blazon } from '../src/domain/models/Blazon';

/** One entry of an armorial, with what the parser made of its blazon. */
export type ReadEntry = {
  readonly slug: string;
  readonly name: string;
  /** The blazon as the source wrote it, which is what was put to the parser. */
  readonly blazon: string;
  /** What was read, or undefined where the blazon was beyond the parser. */
  readonly read?: Blazon;
};

/** One armorial as the parser found it. */
export type ReadArmorial = {
  readonly slug: string;
  readonly name: string;
  readonly entries: readonly ReadEntry[];
};

export function readArmorials(): Promise<{
  readonly armorials: readonly ReadArmorial[];
  /** The arms of a blazon, drawn against an edge the caller names. */
  readonly draw: (blazon: Blazon, outline?: string) => string;
}>;

export function readSlugs(armorial: ReadArmorial): readonly string[];
