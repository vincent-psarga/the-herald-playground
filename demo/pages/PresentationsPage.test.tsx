// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { mount } from '../testing/Mounting';
import { PRESENTATIONS, Presentation } from '../utils/Presentations';
import { PresentationsPage } from './PresentationsPage';

afterEach(cleanup);

const deck = (order: number, slug: string, title: string): Presentation => ({
  order,
  slug,
  title,
  slides: 2,
  source: `# ${title}`,
  // Never opened here: these suites are about what the index makes of a
  // deck's name, not about what the deck draws.
  load: () => Promise.reject(new Error('not opened')),
});

const listed = () =>
  within(screen.getByRole('navigation', { name: 'Presentations' })).getAllByRole('link');

describe('the index of the decks', () => {
  test('names each deck by the heading it opens with', () => {
    mount(<PresentationsPage presentations={PRESENTATIONS} />, '/doc/presentations');
    for (const shown of PRESENTATIONS) {
      expect(screen.getByRole('link', { name: new RegExp(shown.title) })).toBeInTheDocument();
    }
  });

  test('leads to each deck by the slug its file name gave it', () => {
    mount(<PresentationsPage presentations={PRESENTATIONS} />, '/doc/presentations');
    expect(listed().map((link) => link.getAttribute('href'))).toEqual(
      PRESENTATIONS.map((shown) => `/doc/presentations/${shown.slug}`)
    );
  });

  test('shows them in the order it was handed them, the ordering being settled elsewhere', () => {
    const presentations = [deck(0, 'first', 'First'), deck(2, 'second', 'Second')];
    mount(<PresentationsPage presentations={presentations} />, '/doc/presentations');
    expect(listed().map((link) => link.textContent)).toEqual([
      expect.stringContaining('First'),
      expect.stringContaining('Second'),
    ]);
  });

  test('shows what a deck said it was about, for a reader choosing among them', () => {
    mount(
      <PresentationsPage
        presentations={[{ ...deck(0, 'one', 'One'), summary: 'What it is about' }]}
      />,
      '/doc/presentations'
    );
    expect(screen.getByText('What it is about')).toBeInTheDocument();
  });

  test('says where and when a talk was given, where the deck said so', () => {
    mount(
      <PresentationsPage
        presentations={[{ ...deck(0, 'one', 'One'), context: 'Somewhere', date: 'Some day' }]}
      />,
      '/doc/presentations'
    );
    expect(screen.getByText('Somewhere · Some day · 2 slides')).toBeInTheDocument();
  });

  test('announces no occasion for a deck that named none, and still says its length', () => {
    mount(<PresentationsPage presentations={[deck(0, 'one', 'One')]} />, '/doc/presentations');
    expect(screen.getByText('2 slides')).toBeInTheDocument();
  });

  test('counts the slides the decks run to, a reader choosing one by its length', () => {
    mount(
      <PresentationsPage presentations={[deck(0, 'one', 'One'), deck(1, 'other', 'Other')]} />,
      '/doc/presentations'
    );
    expect(screen.getByText('2 decks · 4 slides')).toBeInTheDocument();
  });

  test('says so rather than showing an empty page when no deck has been written', () => {
    mount(<PresentationsPage presentations={[]} />, '/doc/presentations');
    expect(screen.getByText('No deck has been written yet.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Presentations' })).toBeNull();
  });
});
