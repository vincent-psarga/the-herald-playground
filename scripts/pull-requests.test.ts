import { describe, expect, test } from 'vitest';
import { fileFor, opening, shown, type Reported } from './pull-requests.mjs';

describe('the summary a description gives', () => {
  test('is its opening paragraphs, the rest being more than a list can show', () => {
    expect(opening('One.\n\nTwo.\n\nThree.\n\nFour.\n\nFive.')).toBe('One.\n\nTwo.\n\nThree.');
  });

  // A description tends to open on a line about the work, a picture of it and a
  // list of what is still to do. All three are worth showing; the argument that
  // follows them is not, and the pull request is linked for whoever wants it.
  test('reaches past the opening line to the picture and the list under it', () => {
    const written = [
      'Allow: `azure, a bend indented or`',
      '<img src="https://example.invalid/shot.png" />',
      '',
      'Also, add support for:',
      '- [ ] `denché`',
      '- [ ] `vivré`',
    ].join('\n');
    expect(opening(written)).toContain('<img');
    expect(opening(written)).toContain('- [ ] `denché`');
  });

  // The blank line is what makes a list a list, and what parts a line of prose
  // from the picture under it. Joining the paragraphs back up without it would
  // hand the page one run-on paragraph of markdown.
  test('puts back the blank lines that part one paragraph from the next', () => {
    expect(opening('Lead.\n\n- one\n- two')).toBe('Lead.\n\n- one\n- two');
  });

  test('shows fewer where fewer are asked for', () => {
    expect(opening('One.\n\nTwo.\n\nThree.', 1)).toBe('One.');
  });

  test('keeps a paragraph that runs over several lines, those being one paragraph', () => {
    expect(opening('A reading of\nthe indented line.\n\nNotes.', 1)).toBe(
      'A reading of\nthe indented line.'
    );
  });

  test('steps over a description that opens on blank lines', () => {
    expect(opening('\n\n  \n\nThe first thing actually said.')).toBe(
      'The first thing actually said.'
    );
  });

  test('gives the whole of a description shorter than what it may show', () => {
    expect(opening('Just the one line.')).toBe('Just the one line.');
  });

  test('is nothing where there is nothing to summarise', () => {
    // A pull request may be opened with no description at all, and GitHub
    // reports that as null rather than as an empty string.
    expect(opening(null)).toBe('');
    expect(opening('')).toBe('');
    expect(opening('   \n  \n')).toBe('');
  });

  test('reads a description typed on a machine that ends its lines differently', () => {
    expect(opening('First.\r\n\r\nSecond.')).toBe('First.\n\nSecond.');
  });
});

const fromHere: Reported = {
  number: 3,
  title: 'Add slides in demo',
  body: 'Slides for a talk.\n\nStill rough.',
  url: 'https://github.com/vincent-psarga/the-herald-playground/pull/3',
  isCrossRepository: false,
};

const fromAFork: Reported = {
  number: 9,
  title: 'Something a stranger opened',
  body: 'Anything at all.',
  url: 'https://github.com/vincent-psarga/the-herald-playground/pull/9',
  isCrossRepository: true,
};

describe('the work the demo shows', () => {
  test('is each pull request, under the number that also names its preview', () => {
    expect(shown([fromHere])).toEqual([
      {
        id: 3,
        title: 'Add slides in demo',
        description: 'Slides for a talk.\n\nStill rough.',
        url: 'https://github.com/vincent-psarga/the-herald-playground/pull/3',
      },
    ]);
  });

  // The description is rendered as markdown, and anyone at all may open a pull
  // request from a fork. What is rendered is kept to what someone who can
  // already push here wrote.
  test('leaves out work opened from a fork', () => {
    expect(shown([fromHere, fromAFork]).map(({ id }) => id)).toEqual([3]);
  });

  test('is ordered by number, oldest first, however GitHub reported it', () => {
    const later = { ...fromHere, number: 5 };
    const earlier = { ...fromHere, number: 1 };
    expect(shown([later, fromHere, earlier]).map(({ id }) => id)).toEqual([1, 3, 5]);
  });

  test('is empty where nothing is open, which is a thing the page must show', () => {
    expect(shown([])).toEqual([]);
  });
});

describe('the file written', () => {
  test('declares the list the demo imports', () => {
    expect(fileFor(shown([fromHere]))).toContain(
      'export const currentPullRequests: readonly PullRequest[] ='
    );
  });

  test('says nothing of a fork it left out', () => {
    expect(fileFor(shown([fromHere, fromAFork]))).not.toContain('stranger');
  });
});
