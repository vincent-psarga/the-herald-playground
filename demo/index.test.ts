import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

/**
 * The page carries a few lines of script that run before anything else does,
 * and they are the only part of the demo no bundler and no type checker ever
 * looks at. They are read out of the page itself here, so that what is tested
 * is what is served rather than a copy of it kept in step by hand.
 */
const script = readFileSync(new URL('./index.html', import.meta.url), 'utf8').match(
  /<script>([\s\S]*?)<\/script>/
)![1];

type Arrival = { sentOn: string | null; restored: string | null };

/** Opens an address the way a browser would, and says what the script did. */
function arriveAt(address: string): Arrival {
  const url = new URL(address);
  const arrival: Arrival = { sentOn: null, restored: null };

  const window = {
    location: {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      replace: (to: string) => (arrival.sentOn = to),
    },
  };
  const history = {
    replaceState: (_state: unknown, _title: string, to: string) => (arrival.restored = to),
  };

  new Function('window', 'history', 'URLSearchParams', script)(window, history, URLSearchParams);
  return arrival;
}

const SITE = 'https://vincent-psarga.github.io';

describe('a deep link into a pull request preview', () => {
  // Pages keeps one 404 page for the whole site and it is the published
  // demo's, so an address inside a preview is answered by the wrong copy of
  // the app. The script sends it to the right one.
  test('is sent to the preview it names, carrying the route it asked for', () => {
    expect(arriveAt(`${SITE}/the-herald-playground/pr-preview/pr-5/doc/conventions`)).toEqual({
      sentOn: '/the-herald-playground/pr-preview/pr-5/?p=doc%2Fconventions',
      restored: null,
    });
  });

  test('has its route given back to it once the preview answers', () => {
    expect(arriveAt(`${SITE}/the-herald-playground/pr-preview/pr-5/?p=doc%2Fconventions`)).toEqual({
      sentOn: null,
      restored: '/the-herald-playground/pr-preview/pr-5/doc/conventions',
    });
  });

  test('keeps a query and a fragment of its own through both halves of the trip', () => {
    const asked = `${SITE}/the-herald-playground/pr-preview/pr-3/armorial/x?q=or#arms`;
    expect(arriveAt(asked).sentOn).toBe(
      '/the-herald-playground/pr-preview/pr-3/?p=armorial%2Fx&q=or#arms'
    );
    expect(
      arriveAt(`${SITE}/the-herald-playground/pr-preview/pr-3/?p=armorial%2Fx&q=or#arms`).restored
    ).toBe('/the-herald-playground/pr-preview/pr-3/armorial/x?q=or#arms');
  });
});

describe('every other address', () => {
  // The published demo's own deep links are already answered by the published
  // demo, which routes them itself. Nothing here has anything to add.
  test.each([
    ['a deep link on the published demo', `${SITE}/the-herald-playground/doc/conventions`],
    [
      'the root of a preview, which is a file Pages has',
      `${SITE}/the-herald-playground/pr-preview/pr-5/`,
    ],
    ['the published demo itself', `${SITE}/the-herald-playground/`],
    ['development, served from the root', 'http://localhost:5173/doc/conventions'],
  ])('is left alone: %s', (_what, address) => {
    expect(arriveAt(address)).toEqual({ sentOn: null, restored: null });
  });
});
