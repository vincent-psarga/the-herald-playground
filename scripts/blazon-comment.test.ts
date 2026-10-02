import { describe, expect, test } from 'vitest';
import { MARKER, commentFor, escaped, standing } from './blazon-comment.mjs';
import type { Change } from './new-blazons.mjs';

const WHERE = {
  preview: 'https://example.invalid/the-herald-playground/pr-preview/pr-5/',
  sha: 'a1b2c3d',
};

const VAUDREY = { slug: 'de-vaudrey', name: 'De Vaudrey', blazon: "De gueules à la bande d'or." };

const FRANCHE_COMTE: Change = {
  slug: 'franche-comte',
  name: 'Familles de Franche-Comté',
  gained: [VAUDREY],
  lost: [],
};

/** Some number of entries, for the counts and the cutting short. */
const many = (count: number, from = 0) =>
  Array.from({ length: count }, (_one, at) => ({
    slug: `entry-${from + at}`,
    name: `Entry ${from + at}`,
    blazon: `Blazon ${from + at}.`,
  }));

describe('the comment', () => {
  test('opens on the marker the next push finds it by', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE).startsWith(MARKER)).toBe(true);
  });

  // The preview action leaves a sticky comment of its own, by the same author.
  test('carries a marker of this repository’s own, not a generic one', () => {
    expect(MARKER).toBe('<!-- herald:new-blazons -->');
  });

  test('counts what was gained in its heading', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain('# 1 newly supported blazon');
  });

  test('says several in the plural', () => {
    const changes = [{ ...FRANCHE_COMTE, gained: many(3) }];
    expect(commentFor(changes, WHERE)).toContain('# 3 newly supported blazons');
  });

  test('files the entries under the armorial they belong to', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain('### Familles de Franche-Comté');
  });

  test('leads from a name to where the entry is read on the preview', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain(
      '**[De Vaudrey](https://example.invalid/the-herald-playground/pr-preview/pr-5/armorial/franche-comte#de-vaudrey)**'
    );
  });

  // The drawing at an address is replaced by the next push and the address is
  // not, so the commit it was drawn from is named in the asking.
  test('shows the arms from the preview, stamped with the commit they were drawn from', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain(
      'src="https://example.invalid/the-herald-playground/pr-preview/pr-5/arms/franche-comte/de-vaudrey.svg?v=a1b2c3d"'
    );
  });

  test('says what each drawing is arms of, for a reader who cannot see it', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain(
      'alt="The arms of De Vaudrey, as the parser read them"'
    );
  });

  // The drawer hands over two hundred and forty tall. Forty of those would be
  // a comment several screens deep before a word of it is read.
  test('asks for the arms at the size the roll draws them', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain('width="72" height="86"');
  });

  test('quotes the blazon the source wrote', () => {
    expect(commentFor([FRANCHE_COMTE], WHERE)).toContain("> De gueules à la bande d'or.");
  });

  test('is given the preview’s address however it was spelled', () => {
    const bare = { ...WHERE, preview: WHERE.preview.replace(/\/$/, '') };
    expect(commentFor([FRANCHE_COMTE], bare)).toBe(commentFor([FRANCHE_COMTE], WHERE));
  });
});

describe('what stopped reading', () => {
  const LOST: Change = {
    slug: 'table-ronde',
    name: 'Chevaliers de la Table ronde',
    gained: [],
    lost: [{ slug: 'agloval', name: 'Agloval', blazon: 'De pourpre.' }],
  };

  test('is a section of its own', () => {
    expect(commentFor([LOST], WHERE)).toContain('# 1 blazon no longer read');
  });

  test('names the entry and quotes it, there being no drawing to show', () => {
    const body = commentFor([LOST], WHERE);
    expect(body).toContain('**Agloval**');
    expect(body).toContain('> De pourpre.');
    expect(body).not.toContain('<img');
  });

  test('says so of an entry that has left the roll altogether', () => {
    const gone = { ...LOST, lost: [{ slug: 'agloval' }] };
    expect(commentFor([gone], WHERE)).toContain('**agloval** — no longer in the roll');
  });

  test('stands beside what was gained where a branch did both', () => {
    const body = commentFor([FRANCHE_COMTE, LOST], WHERE);
    expect(body).toContain('# 1 newly supported blazon');
    expect(body).toContain('# 1 blazon no longer read');
  });
});

/**
 * One word of vocabulary can unlock dozens of entries at once, and a list past
 * a certain length has stopped being read.
 */
describe('a list too long to read', () => {
  test('is cut short, and says how much was left out', () => {
    const changes = [{ ...FRANCHE_COMTE, gained: many(55) }];
    const body = commentFor(changes, WHERE);
    expect(body).toContain('# 55 newly supported blazons');
    expect(body).toContain('…and 15 more.');
    expect(body.match(/<img/g)).toHaveLength(40);
  });

  test('counts what it left out across every armorial', () => {
    const changes = [
      { ...FRANCHE_COMTE, gained: many(30) },
      { slug: 'other', name: 'Another roll', gained: many(30, 30), lost: [] },
    ];
    expect(commentFor(changes, WHERE)).toContain('…and 20 more.');
  });

  test('is not cut short where it does not need to be', () => {
    expect(commentFor([{ ...FRANCHE_COMTE, gained: many(40) }], WHERE)).not.toContain('more.');
  });
});

/**
 * A comment standing from an earlier push has to be brought down to the truth,
 * rather than left saying what the branch used to do.
 */
describe('a branch that changed nothing', () => {
  test('still has a body, which says as much', () => {
    expect(commentFor([], WHERE)).toContain(
      'reads no blazon that main does not, and stops reading none'
    );
  });

  test('shows no heading and no arms', () => {
    const body = commentFor([], WHERE);
    expect(body).not.toContain('#  ');
    expect(body).not.toContain('<img');
  });
});

describe('finding the comment again', () => {
  test('is by the marker it carries', () => {
    const comments = [
      { id: 1, body: 'Something somebody said' },
      { id: 2, body: `${MARKER}\n\n# 1 newly supported blazon` },
    ];
    expect(standing(comments)?.id).toBe(2);
  });

  test('passes over the preview action’s own sticky comment', () => {
    const comments = [{ id: 7, body: '<!-- Sticky Pull Request Comment -->\nPreview is ready.' }];
    expect(standing(comments)).toBeUndefined();
  });

  test('finds none where there is none', () => {
    expect(standing([])).toBeUndefined();
  });

  test('is unbothered by a comment with no body at all', () => {
    expect(standing([{ id: 1, body: null }])).toBeUndefined();
  });
});

/**
 * Nothing in the three rolls needs this today. They are transcribed by hand
 * from somebody else's page, and the next one copied in owes markdown nothing.
 */
describe('text that will be read as text', () => {
  test('holds markdown’s own punctuation back', () => {
    expect(escaped('a | b *c* [d]')).toBe('a \\| b \\*c\\* \\[d\\]');
  });

  test('leaves ordinary words alone', () => {
    expect(escaped("De gueules à l'aigle éployée d'argent.")).toBe(
      "De gueules à l'aigle éployée d'argent."
    );
  });
});
