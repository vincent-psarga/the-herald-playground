/**
 * The decks kept in demo/presentations, read as they stand.
 *
 * A deck is a file rather than an entry in a list: one is added by dropping it
 * in the directory, and nothing here has to be told about it. The file names
 * carry what the index needs — the order the decks are shown in, and the slug
 * each answers to — so the naming is the whole of the convention:
 *
 *   demo/presentations/0.the-herald-playground.mdx  →  /doc/presentations/the-herald-playground
 *
 * A deck is read twice over: once as the text it was written as, which is where
 * what it says about itself is read from, and once as the module the build makes
 * of it, which is what draws it. The build is what cuts a deck into slides, and
 * both readings go by its one rule: a line of three dashes ends a slide — except
 * the pair at the head of a file, which is a deck talking about itself rather
 * than starting.
 */

import { ComponentType, ElementType } from 'react';
import { Front, blockIn, frontIn, withoutBlock } from './Frontmatter.mjs';

/** The prefix that orders a deck, and the slug that is the rest of the name. */
const NAMED = /^(\d+)\.(.+)$/;

/**
 * A deck whose name carries no number is not refused — it is simply shown after
 * the numbered ones, where a reader looking for an order will not trip over it.
 */
const UNNUMBERED = Number.MAX_SAFE_INTEGER;

/** What a deck exports once the build has compiled it: the component that draws it. */
export type DeckContent = ComponentType<{
  readonly components?: Readonly<Record<string, ElementType>>;
}>;

export interface Presentation extends Front {
  /** The address it answers to: the file name, less its number and extension. */
  readonly slug: string;
  /** What the deck calls itself: what it said it was called, or its first heading. */
  readonly title: string;
  /** The number the file name begins with, by which the decks are ordered. */
  readonly order: number;
  /** How many slides it runs to, counted by the rule the deck splits on. */
  readonly slides: number;
  /** The markdown itself, which is what the index reads the deck's name from. */
  readonly source: string;
  /** Fetches the compiled deck, which is only wanted once one is opened. */
  readonly load: () => Promise<{ readonly default: DeckContent }>;
}

/**
 * Vite reads the directory at build time, so the decks travel with the demo and
 * no request is made for the directory itself.
 *
 * Twice over, because a deck is two things. Its text is read eagerly: the index
 * names every deck, and a page that must wait for a file to know what to list
 * shows nothing first. Its compiled self is fetched only when a deck is opened,
 * a deck being free to call on anything the demo can draw.
 */
const SOURCES = import.meta.glob('../presentations/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const DECKS = import.meta.glob('../presentations/*.mdx') as Record<
  string,
  () => Promise<{ readonly default: DeckContent }>
>;

/**
 * What a deck is called: what it said it was called, failing that the heading it
 * opens with, and failing that its own slug, with the hyphens read back as the
 * spaces they stand in for. The file name is an address and the last resort.
 */
function titleOf(front: Front, source: string, slug: string): string {
  const heading = /^#\s+(.+)$/m.exec(source);
  return front.title ?? heading?.[1].trim() ?? slug.replace(/-/g, ' ');
}

/** A line of three dashes and nothing else, which is where a slide ends. */
const BREAK = /^-{3,}$/;

/**
 * A line that opens something a deck wrote, and one that closes it again. A tag
 * that closes itself opens nothing, however much it looks like the first.
 */
const OPENS = /^<[A-Z]\w*(\s[^>]*)?>$/;
const SHUTS_ITSELF = /\/>$/;
const CLOSES = /^<\/[A-Z]\w*>$/;

/**
 * The same rule the deck is cut on, so the count and the cutting cannot drift
 * apart.
 *
 * A rule ends the slide before it — but only where it stands on its own in the
 * file. One written inside something the deck wrote is that thing's rule and
 * means whatever that thing means by it: the rules inside a `<Steps>` cut it
 * into steps and leave the slide whole. The build reads that off the tree, where
 * such a rule is plainly nested; here there is no tree, so the nesting is
 * followed as the lines go by — which the convention of writing a tag alone on
 * its line is what makes possible.
 *
 * So the count is the rules that stood on their own, plus the slide they leave
 * behind.
 */
export function slidesIn(source: string): number {
  let depth = 0;
  let rules = 0;
  for (const line of withoutBlock(source).split('\n')) {
    const written = line.trim();
    if (OPENS.test(written) && !SHUTS_ITSELF.test(written)) {
      depth += 1;
    } else if (CLOSES.test(written)) {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0 && BREAK.test(written)) {
      rules += 1;
    }
  }
  return rules + 1;
}

function read(path: string, source: string): Presentation {
  const name =
    path
      .split('/')
      .pop()
      ?.replace(/\.mdx$/, '') ?? path;
  const named = NAMED.exec(name);
  const load = DECKS[path];
  if (load === undefined) {
    // The two globs read the same directory, so this cannot happen; saying so
    // out loud is cheaper than a deck that lists but will not open.
    throw new Error(`The deck at ${path} was listed but cannot be fetched`);
  }
  const front = frontIn(blockIn(source));
  return {
    ...front,
    slug: named?.[2] ?? name,
    order: named === null ? UNNUMBERED : Number(named[1]),
    title: titleOf(front, source, named?.[2] ?? name),
    slides: slidesIn(source),
    source,
    load,
  };
}

/**
 * The decks in the order their numbers put them.
 *
 * The number is read as a number and not as text, which is the whole point of
 * reading it at all: 12 follows 2, where a file listing would file it between 1
 * and 2. Two decks given the same number fall back on their slugs, so the order
 * is settled whatever the directory happens to hold.
 */
export function inOrder(presentations: readonly Presentation[]): readonly Presentation[] {
  return [...presentations].sort(
    (one, other) => one.order - other.order || one.slug.localeCompare(other.slug)
  );
}

/** Every deck the directory holds, in the order it is read in. */
export const PRESENTATIONS: readonly Presentation[] = inOrder(
  Object.entries(SOURCES).map(([path, source]) => read(path, source))
);

/**
 * Where one deck is shown. The index and whatever routes the host keeps have to
 * agree on the address, so it is written once, here.
 */
export function presentationPath(slug: string): string {
  return `/doc/presentations/${slug}`;
}

/** The deck a slug names, if the directory holds one. */
export function presentationNamed(slug: string): Presentation | undefined {
  return PRESENTATIONS.find((presentation) => presentation.slug === slug);
}
