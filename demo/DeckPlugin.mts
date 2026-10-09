import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import { Plugin } from 'vite';
import { footerOf, frontIn } from './utils/Frontmatter.mjs';

/** As much of a markdown tree as the work below needs to know about. */
interface Node {
  readonly type: string;
  readonly name?: string;
  /** What a deck said about itself, on the one node that carries it. */
  readonly value?: string;
}

interface Root extends Node {
  children: Node[];
}

/** An element written into the tree, which a deck then calls by name. */
function elementOf(name: string, children: Node[]): Node {
  return { type: 'mdxJsxFlowElement', name, attributes: [], children } as Node;
}

/** What a deck writes to set something beside the rest of its slide. */
function isSide(node: Node): boolean {
  return node.type === 'mdxJsxFlowElement' && node.name === 'Side';
}

/** What a deck writes around things it means to say one after another. */
function isSteps(node: Node): boolean {
  return node.type === 'mdxJsxFlowElement' && node.name === 'Steps';
}

/** Everything between two rules, which is one thing however many blocks it runs to. */
function cutOn(children: Node[], name: string): Node[] {
  const groups: Node[][] = [[]];
  for (const node of children) {
    if (node.type === 'thematicBreak') {
      groups.push([]);
    } else {
      groups[groups.length - 1]?.push(node);
    }
  }
  return groups.map((group) => elementOf(name, group));
}

/**
 * Cuts what a slide says in turn into the steps it is said in.
 *
 * The same mark does the same work at both levels: between slides a rule means
 * the next slide, and inside a `Steps` it means the next step. A rule written
 * there never reaches the cutting of slides — it is inside an element by then,
 * and the slides are cut from what stands at the top of the file — so the two
 * readings cannot be confused with one another.
 *
 * A step is everything between two rules and not one block apiece: a line that
 * introduces a list is saying the same thing the list says, and showing it alone
 * says nothing at all.
 */
function intoSteps(children: Node[]): Node[] {
  return children.map((node) =>
    isSteps(node) ? elementOf('Steps', cutOn((node as Root).children, 'Step')) : node
  );
}

/**
 * A slide's title spans the whole of it, a title being a title and not a column.
 * Only the headings it opens with: one further down belongs to whatever it heads.
 */
function titlesOf(children: Node[]): number {
  let at = 0;
  while (children[at]?.type === 'heading') {
    at += 1;
  }
  return at;
}

/**
 * Sets a slide out.
 *
 * A slide is a title and a body, and they are wanted apart: a title is read
 * where a title is looked for, at the top, while the body is set in the middle
 * of whatever room the title leaves it. So the headings a slide opens with are
 * left standing where they are and everything under them is gathered into one
 * body, which is the thing the stylesheet then has to place.
 *
 * Within that body, a deck says what stands beside what by writing one of the
 * two — the smaller, usually, a set of arms or a figure — inside `<Side>`, and
 * leaves the rest as it would have written it anyway. Where it puts that `Side`
 * is the whole of the instruction:
 *
 *   - no Side at all, and the body is one column as it always was;
 *   - a Side before anything else, and it stands to the left of the rest;
 *   - a Side after something, and it stands to the right of it.
 *
 * So the two are paired off here and written down in the order they are to be
 * read across. The page that shows a deck then has a title and a body to place,
 * and no question to answer about either.
 *
 * A Side with nothing to stand beside is not a side at all, and is left where it
 * is to take the width like anything else.
 */
function laidOut(all: Node[]): Node[] {
  const children = intoSteps(all);
  const titles = titlesOf(children);
  const below = children.slice(titles);
  return [...children.slice(0, titles), elementOf('Body', paired(below))];
}

/** The body of a slide, as one column or as a side and the rest of it. */
function paired(below: Node[]): Node[] {
  const side = below.findIndex(isSide);
  const rest = below.filter((_, at) => at !== side);
  if (side === -1 || rest.length === 0) {
    return below;
  }
  return side === 0
    ? [below[side]!, elementOf('Rest', rest)]
    : [elementOf('Rest', rest), below[side]!];
}

/**
 * Cuts a deck into slides where its markdown says to cut it, and sets each out.
 *
 * A line of three dashes is a rule in markdown and the end of a slide in a deck,
 * which is how decks have been written since long before this one. So the rules
 * are read out of the tree and what stood between them is wrapped in a slide —
 * meaning the page that shows a deck is handed slides, and never has to know
 * what a deck is made of.
 *
 * Nothing is dropped and nothing is counted twice: the slides are the rules plus
 * one, which is what the index says a deck runs to, counted from the text.
 */
function intoSlides() {
  return (tree: Root) => {
    // What a deck said about itself is not a slide and is not cut into one: it
    // is read, taken out, and answered for in the footer below.
    const said = tree.children.find((node) => node.type === 'yaml');
    const footer = footerIn(said);

    const slides: Node[][] = [[]];
    for (const node of tree.children) {
      if (node.type === 'yaml') {
        continue;
      }
      if (node.type === 'thematicBreak') {
        slides.push([]);
      } else {
        slides[slides.length - 1]?.push(node);
      }
    }
    tree.children = slides.map((slide) => elementOf('Slide', [...laidOut(slide), ...footer]));
  };
}

/**
 * What stands under every slide, made of what the deck said about itself: where
 * the talk was given and when.
 *
 * It is written here rather than by the deck because it is the same under every
 * slide and true of none of them in particular — a deck that had to write it on
 * each would be saying five times over what it means once.
 */
function footerIn(said: Node | undefined): Node[] {
  const footer = footerOf(frontIn(said?.value));
  return footer === undefined ? [] : [elementOf('Footer', [{ type: 'text', value: footer }])];
}

/**
 * Compiles the decks.
 *
 * A deck is written in MDX — markdown that may call a component by name — and
 * what comes out is ordinary JavaScript calling React's runtime, which
 * everything downstream already knows how to read. `Slide`, `Body`, `Rest`,
 * `Step` and `Footer` are among the names it calls, the cutting above having
 * written them in; the page that shows a deck says what those names mean.
 *
 * A deck is imported twice, though: as itself, which is what draws it, and with
 * ?raw, which is the text the index reads its name and its length from. The
 * plugin underneath drops the query before deciding what to compile, so it
 * cannot be told to leave the second alone and is asked here instead.
 *
 * It lives apart from either config because both want it and neither owns it: a
 * test that opens a deck must be handed what the browser is handed.
 */
export function decks(): Plugin {
  // Frontmatter first, so that the pair of rules a deck opens with is read as a
  // deck talking about itself and never as an empty slide.
  const compiling = mdx({ remarkPlugins: [remarkFrontmatter, intoSlides] });

  return {
    ...compiling,
    enforce: 'pre',
    transform(value: string, id: string) {
      return id.includes('?raw') ? undefined : compiling.transform.call(this, value, id);
    },
  } as Plugin;
}
