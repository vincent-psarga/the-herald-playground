import type { ReadArmorial } from './armorials.mjs';

/** One armorial of a baseline coverage reading, as coverage.json records it. */
export type Measured = {
  readonly slug: string;
  readonly name: string;
  readonly readSlug?: readonly string[];
};

/**
 * One entry a reading gained or lost. The name and the blazon are missing where
 * the entry has left the roll altogether, there being nothing left to read them
 * off.
 */
export type Entry = {
  readonly slug: string;
  readonly name?: string;
  readonly blazon?: string;
};

/** What one armorial gained and lost between two readings. */
export type Change = {
  readonly slug: string;
  readonly name: string;
  readonly gained: readonly Entry[];
  readonly lost: readonly Entry[];
};

export function changed(
  baseline: readonly Measured[],
  current: readonly ReadArmorial[]
): readonly Change[];

export function gainedIn(changes: readonly Change[]): number;
export function lostIn(changes: readonly Change[]): number;
export function namesWhatItRead(baseline: unknown): boolean;
