// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { Armorial } from '../../src/domain/models/Armorial';
import { Languages } from '../../src/domain/models/Languages';
import { Metals } from '../../src/domain/models/Tinctures';
import { WikipediaColours } from '../../src/infra/colours/WikipediaColours';
import { mount } from '../testing/Mounting';
import { readingPath } from '../utils/Reading';
import { ArmorialPage } from './ArmorialPage';

afterEach(cleanup);

const HALBERSTADT = {
  name: 'Halberstadt',
  blazon: "Parti d'argent et de gueules",
  image: 'https://example.invalid/halberstadt.png',
};

/**
 * The entry the parser cannot read, which every row about a refusal is about.
 *
 * It wants a lion, which is the kind of charge the vocabulary has none of and
 * will not have for a while. A blazon the parser was merely behind on would stop
 * testing anything the day it caught up.
 */
const FLANDERS = {
  name: 'Flanders',
  blazon: "D'or au lion de sable",
  image: 'https://example.invalid/flanders.png',
  source: {
    title: 'Wikipédia, Armoiries de la Flandre',
    url: 'https://example.invalid/flanders',
    language: Languages.fr,
  },
};

const ARMORIAL: Armorial = {
  name: 'An armorial',
  slug: 'an-armorial',
  language: Languages.fr,
  licence: 'MIT',
  source: {
    title: 'Wherever it came from',
    url: 'https://example.invalid/armorial',
    language: Languages.en,
  },
  entries: [HALBERSTADT, FLANDERS],
};

const rows = () => screen.getAllByRole('row').slice(1);
const row = (name: string) => screen.getByRole('rowheader', { name }).closest('tr') as HTMLElement;
/** The four cells of a row, by what they hold rather than by where they sit. */
const cells = (name: string) => {
  const [source, blazon, sourced, drawn] = within(row(name)).getAllByRole('cell');
  return { source, blazon, sourced, drawn };
};

describe('ArmorialPage', () => {
  test('names the armorial', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('An armorial');
  });

  test('states how much of it the parser could read', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(screen.getByText(/of this armorial is read/)).toHaveTextContent(
      '50% of this armorial is read: 1 of 2 blazons.'
    );
  });

  test('leads to the armorial’s own source, named in full', () => {
    // There is room for the citation here, where a gloss has room for a mark
    // alone, so the work is named rather than numbered.
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(screen.getByRole('link', { name: 'Wherever it came from' })).toHaveAttribute(
      'href',
      'https://example.invalid/armorial'
    );
  });

  test('says nothing of a source an armorial does not have', () => {
    mount(<ArmorialPage armorial={{ ...ARMORIAL, source: undefined }} />);
    expect(screen.queryByText(/Copied from/)).toBeNull();
  });

  test('says what the armorial holds, in which tongue, and under which licence', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(screen.getByText(/2 entries/)).toHaveTextContent('2 entries · French · MIT');
  });

  test('carries one row per entry, unread ones included', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(rows()).toHaveLength(2);
    expect(row('Halberstadt')).toBeInTheDocument();
    expect(row('Flanders')).toBeInTheDocument();
  });

  test('shows the blazon as the source wrote it, marked in the armorial’s tongue', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { blazon } = cells('Halberstadt');
    const source = within(blazon).getByRole('link', { name: "Parti d'argent et de gueules" });
    expect(source).toHaveAttribute('lang', 'fr');
  });

  test('marks an English armorial’s blazons as English', () => {
    mount(
      <ArmorialPage
        armorial={{
          ...ARMORIAL,
          language: Languages.en,
          entries: [{ ...HALBERSTADT, blazon: 'Per pale argent and gules' }],
        }}
      />
    );
    const { blazon } = cells('Halberstadt');
    expect(within(blazon).getByRole('link', { name: 'Per pale argent and gules' })).toHaveAttribute(
      'lang',
      'en'
    );
  });

  test('leads from every blazon to the translator, in the tongue it is written in', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const source = within(cells('Halberstadt').blazon).getByRole('link', {
      name: HALBERSTADT.blazon,
    });
    expect(source).toHaveAttribute('href', readingPath(HALBERSTADT.blazon, Languages.fr));
  });

  test('leads from a blazon the parser refused too: the refusal is spelled out there', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const refused = within(cells('Flanders').blazon).getByRole('link', { name: FLANDERS.blazon });
    expect(refused).toHaveAttribute('href', readingPath(FLANDERS.blazon, Languages.fr));
  });

  test('shows the translation under a blazon it could read, and links that too', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const translated = within(cells('Halberstadt').blazon).getByRole('link', {
      name: 'Per pale argent and gules.',
    });
    expect(translated).toHaveAttribute('lang', 'en');
    expect(translated).toHaveAttribute(
      'href',
      readingPath('Per pale argent and gules.', Languages.en)
    );
  });

  test('shows no translation of a blazon it could not read', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(within(cells('Flanders').blazon).getAllByRole('link')).toHaveLength(1);
  });

  test('translates an English armorial into French', () => {
    mount(
      <ArmorialPage
        armorial={{
          ...ARMORIAL,
          language: Languages.en,
          entries: [{ ...HALBERSTADT, blazon: 'Per pale argent and gules' }],
        }}
      />
    );
    const translated = within(cells('Halberstadt').blazon).getByRole('link', {
      name: "Parti d'argent et de gueules.",
    });
    expect(translated).toHaveAttribute('lang', 'fr');
  });

  test('links an entry’s source where it has one', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(
      within(row('Flanders')).getByRole('link', {
        name: 'Wikipédia, Armoiries de la Flandre — in French',
      })
    ).toHaveAttribute('href', 'https://example.invalid/flanders');
  });

  test('says which tongue a source is in, where it is not the one being read', () => {
    // Said of the French page a roll was copied from, and not of the English
    // one: a reader told it of every source would learn nothing from being told.
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const entry = within(row('Flanders')).getByRole('link', { name: /Armoiries de la Flandre/ });
    expect(entry).toHaveAttribute('hreflang', 'fr');
    expect(entry.querySelector('[lang="fr"]')?.textContent).toBe(
      'Wikipédia, Armoiries de la Flandre'
    );
    expect(screen.getByRole('link', { name: 'Wherever it came from' }).textContent).not.toMatch(
      /in English/
    );
  });

  test('leaves the source cell empty for an entry without one', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { source } = cells('Halberstadt');
    expect(source).toBeEmptyDOMElement();
  });

  test('shows the arms the armorial itself carries', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { sourced } = cells('Halberstadt');
    expect(sourced?.querySelector('img')).toHaveAttribute('src', HALBERSTADT.image);
  });

  test('draws the arms it could read', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { drawn } = cells('Halberstadt');
    const shield = drawn?.querySelector('img');
    expect(shield).toHaveAttribute('alt', 'Halberstadt, as the parser read it');
    expect(decodeURIComponent(shield?.getAttribute('src') ?? '')).toContain('<svg');
  });

  test('leaves the last cell empty where the blazon was beyond the parser', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { drawn } = cells('Flanders');
    expect(drawn).toBeEmptyDOMElement();
  });

  // On a screen too narrow for five columns the roll is laid out entry by entry
  // and the headings go out of sight, so each drawing carries whose it is.
  test('says whose each drawing is, for where the headings cannot be seen', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    const { sourced, drawn } = cells('Halberstadt');
    expect(sourced).toHaveAttribute('data-drawn', 'The source');
    expect(drawn).toHaveAttribute('data-drawn', 'The parser');
  });

  test('says nothing where nothing is drawn', () => {
    mount(<ArmorialPage armorial={ARMORIAL} />);
    expect(cells('Flanders').drawn).not.toHaveAttribute('data-drawn');
  });

  describe('the overview of what it could not read', () => {
    /** The words listed under one label, as the reader sees them. */
    const under = (label: string) => screen.getByText(label).nextElementSibling?.textContent ?? '';

    const GAPS: Armorial = {
      ...ARMORIAL,
      entries: [
        { ...HALBERSTADT, blazon: 'De fuchsia' },
        { ...HALBERSTADT, name: 'Second', blazon: "Gironné d'azur et d'or" },
        { ...HALBERSTADT, name: 'Third', blazon: "D'azur à la champagne d'or" },
      ],
    };

    test('lists each word under the term that was expected there', () => {
      mount(<ArmorialPage armorial={GAPS} />);
      expect(under('Unknown tincture')).toBe('fuchsia');
      expect(under('Unknown division')).toBe('gironné');
      expect(under('Unknown ordinary')).toBe('champagne');
    });

    test('names the words in the armorial’s own tongue', () => {
      mount(<ArmorialPage armorial={GAPS} />);
      expect(screen.getByText('fuchsia')).toHaveAttribute('lang', 'fr');
    });

    test('speaks of one word in the singular and several in the plural', () => {
      mount(
        <ArmorialPage
          armorial={{
            ...ARMORIAL,
            entries: [
              { ...HALBERSTADT, blazon: 'De fuchsia' },
              { ...HALBERSTADT, name: 'Second', blazon: 'De mauve' },
            ],
          }}
        />
      );
      expect(screen.getByText('Unknown tinctures')).toBeInTheDocument();
      expect(screen.queryByText('Unknown tincture')).toBeNull();
    });

    test('leaves out a term it wants nothing under', () => {
      mount(
        <ArmorialPage
          armorial={{ ...ARMORIAL, entries: [{ ...HALBERSTADT, blazon: 'De fuchsia' }] }}
        />
      );
      expect(screen.getByText('Unknown tincture')).toBeInTheDocument();
      expect(screen.queryByText(/Unknown division/)).toBeNull();
      expect(screen.queryByText(/Unknown ordinary/)).toBeNull();
    });

    test('says nothing at all of an armorial it read entire', () => {
      mount(
        <ArmorialPage
          armorial={{ ...ARMORIAL, entries: [{ ...HALBERSTADT, blazon: 'De gueules' }] }}
        />
      );
      expect(screen.queryByText(/^Unknown /)).toBeNull();
      expect(screen.queryByText(/Where it stopped/)).toBeNull();
    });

    test('owns up to reporting only the first refusal of each blazon', () => {
      mount(<ArmorialPage armorial={GAPS} />);
      expect(screen.getByText(/One reading is refused per blazon/)).toBeInTheDocument();
    });

    test('warns that a word is filed under what was expected, not what it is', () => {
      mount(<ArmorialPage armorial={GAPS} />);
      expect(screen.getByText(/counted an ordinary/)).toBeInTheDocument();
    });
  });

  describe('the search', () => {
    /**
     * Three entries told apart by what their blazons hold. No name holds a word
     * of any blazon, so a test of what the blazons match is a test of that.
     */
    const ROLL: Armorial = {
      ...ARMORIAL,
      entries: [
        { ...HALBERSTADT, name: 'Nevers', blazon: "Parti d'or et de gueules" },
        { ...HALBERSTADT, name: 'Poitiers', blazon: "De gueules à la bordure d'argent" },
        { ...HALBERSTADT, name: 'Vannes', blazon: "D'azur à la macle d'or" },
      ],
    };

    const search = () => screen.getByRole('searchbox', { name: 'Search the entries' });
    const named = () => screen.getAllByRole('rowheader').map((header) => header.textContent);

    const seek = async (query: string, armorial = ROLL) => {
      mount(<ArmorialPage armorial={armorial} />);
      await userEvent.type(search(), query);
    };

    test('stands over the roll', () => {
      mount(<ArmorialPage armorial={ROLL} />);
      expect(search()).toBeInTheDocument();
    });

    test('says how a word is looked for and how to ask for it whole', () => {
      mount(<ArmorialPage armorial={ROLL} />);
      expect(screen.getByText(/Quote it to ask for the word whole/)).toBeInTheDocument();
    });

    test('leaves the roll whole while nothing is asked for', () => {
      mount(<ArmorialPage armorial={ROLL} />);
      expect(named()).toEqual(['Nevers', 'Poitiers', 'Vannes']);
    });

    test('keeps the entries a word stands in', async () => {
      await seek('macle');
      expect(named()).toEqual(['Vannes']);
    });

    test('searches the name as well as the blazon', async () => {
      await seek('poitiers');
      expect(named()).toEqual(['Poitiers']);
    });

    test('searches the source’s own words and not the translation', async () => {
      // Every blazon here is French, and each is translated into English under
      // it; "and" is a word of those translations and of no entry.
      await seek('and');
      expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    });

    test('shows the entry holding the most of what was asked for first', async () => {
      // Nevers is parted of both and leads; the two holding one apiece follow in
      // the roll's own order.
      await seek('or gueules');
      expect(named()).toEqual(['Nevers', 'Poitiers', 'Vannes']);
    });

    test('finds a word standing inside a longer one', async () => {
      await seek('gueul');
      expect(named()).toEqual(['Nevers', 'Poitiers']);
    });

    test('finds a word inside a longer one on the page as in the roll', async () => {
      // The or of Poitiers' bordure is an or as far as a plain search is concerned.
      await seek('or');
      expect(named()).toEqual(['Nevers', 'Poitiers', 'Vannes']);
    });

    test('asks for a quoted word whole, and leaves the longer ones out', async () => {
      await seek('"or"');
      expect(named()).toEqual(['Nevers', 'Vannes']);
    });

    test('says how much of the roll is left', async () => {
      await seek('macle');
      expect(screen.getByText('1 of 3 entries')).toBeInTheDocument();
    });

    test('counts nothing while nothing is asked for', () => {
      mount(<ArmorialPage armorial={ROLL} />);
      expect(screen.queryByText(/of 3 entries/)).toBeNull();
    });

    test('says so where nothing answers, and draws no empty roll', async () => {
      await seek('hermine');
      expect(screen.getByText('No entry of this armorial answers to that.')).toBeInTheDocument();
      expect(screen.queryByRole('table')).toBeNull();
    });

    test('says the roll is the search’s and in what order, while one is on', async () => {
      await seek('or');
      expect(screen.getByText(/The entries this search found/)).toBeInTheDocument();
    });

    test('leaves the score and the gaps speaking for the whole armorial', async () => {
      await seek('macle');
      expect(screen.getByText(/of this armorial is read/)).toHaveTextContent(
        '100% of this armorial is read: 3 of 3 blazons.'
      );
      expect(screen.getByText(/French/)).toHaveTextContent('3 entries · French · MIT');
    });
  });

  test('paints the drawn arms in the colours it is given', () => {
    const colours = { ...WikipediaColours, [Metals.argent]: '#123456' };
    mount(<ArmorialPage armorial={ARMORIAL} colours={colours} />);
    const { drawn } = cells('Halberstadt');
    expect(decodeURIComponent(drawn?.querySelector('img')?.getAttribute('src') ?? '')).toContain(
      '#123456'
    );
  });
});
