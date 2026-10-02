/**
 * What a deck may say about itself before it starts.
 *
 * A talk has facts that are not slides — what it is called, what it is about,
 * where it was given and when — and a deck that wrote them as slides would be
 * saying them twice: once to the room and once to whoever lists it afterwards.
 * So they are written once at the head of the file, between two rules, in the
 * way every other tool writes such things:
 *
 *     ---
 *     title: The Heraldry Playground
 *     summary: A short talk about the project
 *     context: Packmind - veille tech
 *     date: 2026/09/25
 *     ---
 *
 * Both readings of a deck want this — the build, which writes the footer out of
 * it, and the index, which lists the deck by it — so it is read in one place.
 */

/** A name and what was written after it. Nothing here nests, and nothing needs to. */
const SAID = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/;

/**
 * The block a deck may open with: two rules, and what stands between them. The
 * blank line under it goes with it, so that a deck read without the block reads
 * as the deck would have been written without one.
 */
const BLOCK = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n)*/;

export interface Front {
  /** What the deck is called, in the index and above the slides alike. */
  readonly title?: string;
  /** What it is about, in a sentence, for a reader choosing among decks. */
  readonly summary?: string;
  /** Where it was given: an event, a meeting, an audience. */
  readonly context?: string;
  /** When it was given, written as the deck chose to write it. */
  readonly date?: string;
}

/** What a deck said about itself, if it said anything: the block, less its rules. */
export function blockIn(source: string): string | undefined {
  return BLOCK.exec(source)?.[1];
}

/** The deck, less what it said about itself, which is where the slides begin. */
export function withoutBlock(source: string): string {
  return source.replace(BLOCK, '');
}

/**
 * What the block says.
 *
 * A name, a colon, and the rest of the line as it was written — which is all
 * this has ever needed to be. A line that says nothing of the kind is passed
 * over rather than refused: a deck is somebody's talk, and half-written notes at
 * the head of one should cost them a field and not the whole file.
 */
export function frontIn(block: string | undefined): Front {
  const said: Record<string, string> = {};
  for (const line of (block ?? '').split('\n')) {
    const match = SAID.exec(line.trim());
    if (match !== null) {
      said[match[1]!.toLowerCase()] = unquoted(match[2]!.trim());
    }
  }
  return {
    title: said['title'],
    summary: said['summary'],
    context: said['context'],
    date: said['date'],
  };
}

/** A value written in quotes meant the value, not the quotes. */
function unquoted(value: string): string {
  const quoted = /^(['"])([\s\S]*)\1$/.exec(value);
  return quoted?.[2] ?? value;
}

/**
 * What stands under every slide: where the talk was given and when.
 *
 * Both are optional and either alone is worth saying, so the footer is whichever
 * of them there are — and a deck that says neither has no footer rather than an
 * empty one.
 */
export function footerOf(front: Front): string | undefined {
  const said = [front.context, front.date].filter((part) => part !== undefined && part !== '');
  return said.length === 0 ? undefined : said.join(' · ');
}
