// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { mount } from '../testing/Mounting';
import { Presentation } from '../utils/Presentations';
import Deck from '../testing/Deck.mdx';
import { PresentationPage } from './PresentationPage';

afterEach(cleanup);

// A deck of the kind the directory holds, compiled the way the build compiles
// them: the fixture is MDX, so what is under test is what a reader is shown.
const DECK: Presentation = {
  order: 0,
  slug: 'a-deck',
  title: 'A deck',
  slides: 5,
  source: '',
  load: () => Promise.resolve({ default: Deck }),
};

/** The two the build paired off, in the order they are to be read across. */
const pairedIn = (slide: Element | undefined) =>
  [...(slide?.querySelector('.deck__body')?.children ?? [])]
    .map((child) => ['deck__side', 'deck__rest'].find((which) => child.classList.contains(which)))
    .filter((which) => which !== undefined);

const slideSaying = (words: string) =>
  [...document.querySelectorAll('.deck__slide')].find((slide) =>
    slide.textContent?.includes(words)
  );

const opened = async () => {
  mount(<PresentationPage presentation={DECK} />, '/doc/presentations/a-deck');
  // The deck is fetched rather than bundled with the page, so it is waited for.
  await screen.findByText('The second slide');
};

describe('a deck, shown as slides', () => {
  test('says which deck is open, whatever slide the reader has reached', async () => {
    await opened();
    expect(document.querySelector('.deck__head h1')).toHaveTextContent('A deck');
  });

  test('leads back to the whole list, a deck being a page a reader arrives at', async () => {
    await opened();
    expect(screen.getByRole('link', { name: 'All presentations' })).toHaveAttribute(
      'href',
      '/doc/presentations'
    );
  });

  test('cuts the file where the markdown says to cut it', async () => {
    await opened();
    // Both slides are drawn: the deck holds them all and shows one at a time,
    // rather than fetching each as it is reached. The name is on the page twice
    // over — once as the page's own title, once as the slide the deck opens on.
    expect(screen.getAllByText('A deck')).toHaveLength(2);
    expect(screen.getByText('One thing')).toBeInTheDocument();
  });

  test('leaves no rule of the markdown drawn, a rule being where a slide ends', async () => {
    await opened();
    expect(document.querySelector('hr')).toBeNull();
  });

  test('lets a slide call a component by name, and draws what it asked for', async () => {
    await opened();
    // The arms are drawn from what the parser made of the words on the slide.
    expect(screen.getByRole('img', { name: "d'or au sautoir de gueules" })).toBeInTheDocument();
  });

  test('sets what a slide put aside beside the rest of it, markdown and all', async () => {
    await opened();
    const side = document.querySelector('.deck__side');
    const rest = side?.parentElement?.querySelector('.deck__rest');
    expect(side?.textContent).toContain('Beside what was written first');
    expect(rest?.textContent).toContain('a list, which begins two spaces in');
  });

  test('puts a side written after what it stands beside on the right of it', async () => {
    await opened();
    // The two are read across in the order they are written down, so which side
    // a side is on is which of the two the build put first.
    expect(pairedIn(slideSaying('written after what it stands beside'))).toEqual([
      'deck__rest',
      'deck__side',
    ]);
  });

  test('puts a side written before what it stands beside on the left of it', async () => {
    await opened();
    expect(pairedIn(slideSaying('written before it'))).toEqual(['deck__side', 'deck__rest']);
  });

  test('spans a slide with its title, whichever side the side is on', async () => {
    await opened();
    const slide = slideSaying('written before it');
    // The title is neither of the two that were paired off: it stands above the
    // body they are in, and takes the width of the slide.
    expect(slide?.firstElementChild?.textContent).toBe('A side written before it');
    expect(slide?.firstElementChild?.className).not.toContain('deck__');
  });

  test('leaves a slide its title at the top and gathers the rest into a body', async () => {
    await opened();
    const slide = slideSaying('written before it');
    // The parts of a slide are placed differently — the title where a title is
    // looked for, the body in the middle of what the title leaves, the footer at
    // the foot — so the build hands the stylesheet each of them apart.
    expect([...(slide?.children ?? [])].map((child) => child.tagName.toLowerCase())).toEqual([
      'h2',
      'div',
      'footer',
    ]);
    expect(slide?.querySelector('.deck__body')).toBe(slide?.children[1]);
    expect(slide?.querySelector('.deck__body h2')).toBeNull();
  });

  test('leaves a slide that set nothing aside in one piece', async () => {
    await opened();
    const slide = slideSaying('One thing');
    expect(slide?.querySelector('.deck__side')).toBeNull();
    expect(slide?.querySelector('.deck__rest')).toBeNull();
  });

  test('holds a slide said in parts together, the parts waiting their turn', async () => {
    await opened();
    const slide = slideSaying('A slide said in parts');
    // One slide, not two: the heading stays put and the parts arrive on it.
    expect(slide?.textContent).toContain('Said on arrival');
    expect(slide?.textContent).toContain('Said next');
    // What waits is marked as waiting, which is what the presenter steps
    // through; what was written first is simply there.
    expect(
      [...(slide?.querySelectorAll('.deck__step') ?? [])].map((step) =>
        step.classList.contains('fragment')
      )
    ).toEqual([false, true]);
  });

  test('cuts a step where a rule inside says to, not at every block', async () => {
    await opened();
    const slide = slideSaying('A slide said in parts');
    const [first] = [...(slide?.querySelectorAll('.deck__step') ?? [])];
    // The line and the list it introduces are one step: a rule ends a step, the
    // way a rule ends a slide.
    expect(first?.querySelector('p')?.textContent).toBe('Said on arrival:');
    expect(first?.querySelector('li')?.textContent).toBe('and this comes with it');
  });

  test('says under every slide where the talk was given and when', async () => {
    await opened();
    // Said once, at the head of the file, and true of the talk rather than of
    // any slide of it.
    const slides = [...document.querySelectorAll('.deck__slide')];
    expect(slides.map((slide) => slide.querySelector('.deck__footer')?.textContent)).toEqual(
      slides.map(() => 'Somewhere · Some day')
    );
  });

  test('keeps what a deck said about itself out of the slides', async () => {
    await opened();
    // The block a deck opens with is the deck talking about itself: it is read,
    // taken out, and never cut into a slide of its own.
    const slides = [...document.querySelectorAll('.deck__slide')];
    expect(slides).toHaveLength(DECK.slides);
    for (const slide of slides) {
      expect(slide.querySelector('.deck__body')?.textContent).not.toContain('Somewhere');
    }
  });

  test('lays every slide out the same way, whether it sets anything aside or not', async () => {
    await opened();
    expect(document.querySelectorAll('.deck__slide')).toHaveLength(DECK.slides);
  });
});
