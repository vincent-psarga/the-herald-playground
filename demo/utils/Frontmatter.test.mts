import { describe, expect, test } from 'vitest';
import { blockIn, footerOf, frontIn, withoutBlock } from './Frontmatter.mjs';

const BLOCK = `---
title: The Heraldry Playground
summary: A short talk about the project
context: Packmind - veille tech
date: 2026/09/25
---

# A heading
`;

describe('what a deck says about itself', () => {
  test('is read from the block it opens with', () => {
    expect(frontIn(blockIn(BLOCK))).toEqual({
      title: 'The Heraldry Playground',
      summary: 'A short talk about the project',
      context: 'Packmind - veille tech',
      date: '2026/09/25',
    });
  });

  test('keeps what was written after the colon, colons and all', () => {
    // The context of a talk may name a time or a ratio, and neither is this
    // reader's business to cut short.
    expect(frontIn('context: Lunch: 12:30').context).toBe('Lunch: 12:30');
  });

  test('takes a quoted value to mean the value and not the quotes', () => {
    expect(frontIn('title: "Or, a bend"').title).toBe('Or, a bend');
    expect(frontIn("date: '2026/09/25'").date).toBe('2026/09/25');
  });

  test('passes over a line that says nothing of the kind rather than refusing the deck', () => {
    // Half-written notes at the head of a talk should cost a field, not a file.
    expect(frontIn('title: A talk\nand then I said\ndate: someday')).toEqual({
      title: 'A talk',
      summary: undefined,
      context: undefined,
      date: 'someday',
    });
  });

  test('says nothing of a deck that opened with nothing', () => {
    expect(blockIn('# Straight into it\n')).toBeUndefined();
    expect(frontIn(undefined)).toEqual({
      title: undefined,
      summary: undefined,
      context: undefined,
      date: undefined,
    });
  });

  test('is not mistaken for a slide, the rules of the block being its own', () => {
    // The first rule of the file is a deck talking about itself; only what comes
    // after it cuts one slide from the next.
    expect(withoutBlock(BLOCK)).toBe('# A heading\n');
  });

  test('leaves a deck alone that never said anything about itself', () => {
    const deck = '# A heading\n\n---\n\n## Another\n';
    expect(withoutBlock(deck)).toBe(deck);
  });
});

describe('what stands under every slide', () => {
  test('is where the talk was given and when', () => {
    expect(footerOf({ context: 'Packmind', date: '2026/09/25' })).toBe('Packmind · 2026/09/25');
  });

  test('is whichever of the two there are, either being worth saying alone', () => {
    expect(footerOf({ context: 'Packmind' })).toBe('Packmind');
    expect(footerOf({ date: '2026/09/25' })).toBe('2026/09/25');
  });

  test('is nothing at all when a deck said neither, rather than an empty line', () => {
    expect(footerOf({})).toBeUndefined();
    expect(footerOf({ title: 'A talk' })).toBeUndefined();
  });
});
