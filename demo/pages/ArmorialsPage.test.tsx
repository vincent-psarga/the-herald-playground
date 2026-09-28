// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { Armorial } from '../../src/domain/models/Armorial';
import { Languages } from '../../src/domain/models/Languages';
import { mount } from '../testing/Mounting';
import { readingPath } from '../utils/Reading';
import { ArmorialsPage, armorialPath } from './ArmorialsPage';

afterEach(cleanup);

const ONE: Armorial = {
  name: 'A sample armorial',
  slug: 'sample',
  language: Languages.fr,
  licence: 'MIT',
  entries: [
    { name: 'Halberstadt', blazon: "Parti d'argent et de gueules", image: '' },
    { name: 'France', blazon: "D'azur", image: 'https://example.invalid/france.png' },
  ],
};

const ANOTHER: Armorial = {
  name: 'A roll of English arms',
  slug: 'english-roll',
  language: Languages.en,
  licence: 'CC BY-SA 4.0',
  entries: [{ name: 'Somewhere', blazon: 'Per pale argent and gules', image: '' }],
};

const index = () => screen.getByRole('navigation', { name: 'Armorials' });
const entry = (name: string) => within(index()).getByRole('link', { name: new RegExp(name) });

describe('ArmorialsPage', () => {
  test('states how many armorials there are, and how much they hold', () => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    expect(screen.getByText(/armorials/)).toHaveTextContent('2 armorials · 3 entries');
  });

  test('counts a lone armorial in the singular', () => {
    mount(<ArmorialsPage armorials={[ANOTHER]} />);
    expect(screen.getByText(/armorial /)).toHaveTextContent('1 armorial · 1 entry');
  });

  test('names every armorial it is given', () => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    expect(within(index()).getAllByRole('link')).toHaveLength(2);
    expect(entry('A sample armorial')).toBeInTheDocument();
    expect(entry('A roll of English arms')).toBeInTheDocument();
  });

  test('points each one at where it is read', () => {
    mount(<ArmorialsPage armorials={[ONE]} />);
    expect(entry('A sample armorial')).toHaveAttribute('href', '/armorial/sample');
  });

  test('says what each one holds, in which tongue, and under which licence', () => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    expect(entry('A sample armorial')).toHaveTextContent('2 entries · French · MIT');
    expect(entry('A roll of English arms')).toHaveTextContent('1 entry · English · CC BY-SA 4.0');
  });
});

describe('the search across the armorials', () => {
  const search = () => screen.getByRole('searchbox', { name: 'Search every armorial' });
  const list = () => screen.getByRole('list', { name: 'Entries found' });
  const found = () =>
    within(list())
      .getAllByRole('listitem')
      .map((item) => item.querySelector('.found__name')?.textContent);

  const seek = async (query: string) => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    await userEvent.type(search(), query);
  };

  test('stands over the rolls', () => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    expect(search()).toBeInTheDocument();
  });

  test('leaves the index of rolls alone while nothing is asked for', () => {
    mount(<ArmorialsPage armorials={[ONE, ANOTHER]} />);
    expect(index()).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Entries found' })).toBeNull();
  });

  test('reaches into every roll at once', async () => {
    // Argent is blazoned in the French roll and in the English one.
    await seek('argent');
    expect(found()).toEqual(['Halberstadt', 'Somewhere']);
  });

  test('gives way to what was found while a search is on', async () => {
    await seek('argent');
    expect(screen.queryByRole('navigation', { name: 'Armorials' })).toBeNull();
  });

  test('names the roll each entry came from, and leads there', async () => {
    await seek('argent');
    const entry = within(list()).getAllByRole('listitem')[0] as HTMLElement;
    expect(within(entry).getByRole('link', { name: 'A sample armorial' })).toHaveAttribute(
      'href',
      '/armorial/sample'
    );
  });

  test('leads from a blazon to the translator, in the tongue it is written in', async () => {
    await seek('per pale');
    const blazon = within(list()).getByRole('link', { name: 'Per pale argent and gules' });
    expect(blazon).toHaveAttribute('lang', 'en');
    expect(blazon).toHaveAttribute('href', readingPath(ANOTHER.entries[0].blazon, Languages.en));
  });

  test('searches the name as well as the blazon', async () => {
    await seek('halberstadt');
    expect(found()).toEqual(['Halberstadt']);
  });

  test('shows the entry holding the most of what was asked for first', async () => {
    // Halberstadt is parted of both; France holds neither and stays out of it.
    await seek('argent gueules');
    expect(found()).toEqual(['Halberstadt', 'Somewhere']);
  });

  test('asks for a quoted word whole', async () => {
    await seek('"azur"');
    expect(found()).toEqual(['France']);
  });

  test('says how much of the whole it found', async () => {
    await seek('halberstadt');
    expect(screen.getByText('1 of 3 entries')).toBeInTheDocument();
  });

  test('shows the arms the roll itself carries, where it carries any', async () => {
    await seek('azur');
    expect(within(list()).getByRole('presentation', { hidden: true })).toHaveAttribute(
      'src',
      'https://example.invalid/france.png'
    );
  });

  test('says so where nothing answers, and draws no empty list', async () => {
    await seek('hermine');
    expect(screen.getByText('No entry of any armorial answers to that.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Entries found' })).toBeNull();
  });

  test('brings the rolls back where the search is emptied', async () => {
    await seek('argent');
    await userEvent.clear(search());
    expect(index()).toBeInTheDocument();
  });
});

describe('the address of an armorial', () => {
  test('is its slug, so the index and whatever routes agree', () => {
    expect(armorialPath(ONE)).toBe('/armorial/sample');
  });
});
