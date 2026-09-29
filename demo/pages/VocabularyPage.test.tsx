// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Languages } from '../../src/domain/models/Languages';
import { Colours, Metals } from '../../src/domain/models/Tinctures';
import { WikipediaColours } from '../../src/infra/colours/WikipediaColours';
import { mount } from '../testing/Mounting';
import { OUTLINE } from '../utils/Colourings';
import { shortened } from '../utils/Shortened';
import { VocabularyEntry, vocabularyIn } from '../utils/Vocabulary';
import { VocabularyPage } from './VocabularyPage';

afterEach(cleanup);

const FRENCH = vocabularyIn(Languages.fr);
const ENGLISH = vocabularyIn(Languages.en);

/**
 * One word as the stack lists it, which is where a reader strikes one from.
 *
 * Looked for in the stack and not on the page at large: the struck word's own
 * reading points at its siblings by name — an annulet at the ring and the
 * gem-ring — so a word may stand twice over, once in the list and once in the
 * reading of the word beside it.
 */
const ghost = (word: string) =>
  within(document.querySelector('.stack') as HTMLElement).getByRole('link', { name: word });
const showing = () => document.querySelector('.showing') as HTMLElement;
/** What scrolls inside the reading, where the reading is a pane of its own. */
const leaf = () => document.querySelector('.showing__leaf') as HTMLElement;
const struck = () => showing().querySelector('.showing__spelling')?.textContent;
/** What the other tongue says it with, said beside the word itself. */
const abroad = () => showing().querySelector('.showing__abroad')?.textContent?.trim();
const strike = async (word: string) => userEvent.setup().click(ghost(word));

/** The words the struck one points at, which stand under "See also". */
const seeAlso = () => within(showing()).getByText('See also').parentElement as HTMLElement;

/** One word of a tongue, as the vocabulary itself holds it. */
const word = (vocabulary: readonly VocabularyEntry[], name: string): VocabularyEntry => {
  const found = vocabulary.find((entry) => entry.word === name);
  if (found === undefined) {
    throw new Error(`No word "${name}" in that vocabulary`);
  }
  return found;
};

/** The questions the struck word is asked, each under a heading of its own. */
const headings = () =>
  Array.from(showing().querySelectorAll('.showing__variants h3')).map(
    (heading) => heading.textContent
  );

const section = (heading: string) => {
  const found = Array.from(showing().querySelectorAll('.showing__variants')).find(
    (variants) => variants.querySelector('h3')?.textContent === heading
  );
  if (found === undefined) {
    throw new Error(`Nothing is shown under "${heading}"`);
  }
  return found as HTMLElement;
};

const labels = (heading: string) =>
  Array.from(section(heading).querySelectorAll('.showing__variant b')).map(
    (label) => label.textContent
  );

/** One kind of word in the line that counts them, which is also the way to it. */
const sift = (counted: string) =>
  within(document.querySelector('.sift') as HTMLElement).getByRole('link', { name: counted });

/** Which kind the line says is being read. */
const sifted = () => document.querySelector('.sift [aria-current="true"]')?.textContent;

/** The words standing in the stack, whatever the line has sifted it down to. */
const stacked = () => document.querySelectorAll('.stack .ghost').length;

/** The pane the vocabulary stands in, which is the box that scrolls it. */
const pane = () => document.querySelector('.reference__read') as HTMLElement;

/** Told to overflow, jsdom laying nothing out and measuring everything at nothing. */
const overflowing = (box: HTMLElement) => {
  Object.defineProperty(box, 'scrollHeight', { value: 2000, configurable: true });
  Object.defineProperty(box, 'clientHeight', { value: 500, configurable: true });
};

const painting = (colouring: string) =>
  decodeURIComponent(
    within(showing())
      .getByAltText(new RegExp(`, ${colouring}$`, 'i'))
      .getAttribute('src') ?? ''
  );

describe('the vocabulary of one tongue', () => {
  test('states how many words there are, counting them rather than claiming', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(sift(`${FRENCH.length} words`)).toBeInTheDocument();
  });

  test.each(FRENCH.map((entry) => entry.word))('keeps %s present in the stack', (word) => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(ghost(word)).toBeInTheDocument();
  });

  test.each(ENGLISH.map((entry) => entry.word))('keeps %s present in English too', (word) => {
    mount(<VocabularyPage language={Languages.en} />);
    expect(ghost(word)).toBeInTheDocument();
  });

  test('holds the French words to the French page and the English to the English', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(screen.queryByRole('link', { name: 'saltire' })).toBeNull();
    cleanup();
    mount(<VocabularyPage language={Languages.en} />);
    expect(screen.queryByRole('link', { name: 'sautoir' })).toBeNull();
  });

  test('files the words under the letters of the alphabet', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    const letters = Array.from(document.querySelectorAll('.stack__letter')).map(
      (heading) => heading.textContent
    );
    expect(letters).toEqual([...letters].sort());
    // The accented word is filed where a reader looks for it.
    expect(letters).toContain('E');
    expect(within(screen.getByLabelText('E')).getByRole('link', { name: 'étoile' })).toBeTruthy();
  });

  test('strikes the head of the vocabulary where the address names no word', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(struck()).toBe(FRENCH[0].word);
  });

  test('strikes the word the address names', () => {
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr#sautoir');
    expect(struck()).toBe('sautoir');
  });

  test('strikes the word an address names by any way it is written', () => {
    // A reader who met the spelling in an armorial looks that up, and is shown
    // the word it is a writing of rather than the head of the vocabulary.
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en#bezant');
    expect(struck()).toBe('besant');
    cleanup();
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr#fleur-de-lis');
    expect(struck()).toBe('fleur de lys');
  });
});

describe('the kinds of word the vocabulary holds', () => {
  const CHARGES = FRENCH.filter((entry) => entry.rank === 'charge');

  test('counts every kind there is, and counts it off the vocabulary', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(sift(`${CHARGES.length} charges`)).toBeInTheDocument();
    expect(sift('1 furred field')).toBeInTheDocument();
  });

  test('leads to a kind by an address of its own, so one can be sent alone', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(sift(`${CHARGES.length} charges`)).toHaveAttribute(
      'href',
      '/doc/vocabulary/fr?of=charge'
    );
    // The whole vocabulary is named by its path: a relative "here" under a route
    // with a parameter resolves to the front page.
    expect(sift(`${FRENCH.length} words`)).toHaveAttribute('href', '/doc/vocabulary/fr');
  });

  test('shows the whole vocabulary where the address asks for no kind', () => {
    mount(<VocabularyPage language={Languages.fr} />);
    expect(stacked()).toBe(FRENCH.length);
    expect(sifted()).toBe(`${FRENCH.length} words`);
  });

  test('shows one kind alone where the address asks for one', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await userEvent.setup().click(sift(`${CHARGES.length} charges`));
    expect(stacked()).toBe(CHARGES.length);
    expect(sifted()).toBe(`${CHARGES.length} charges`);
    expect(ghost('losange')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'azur' })).toBeNull();
  });

  test('keeps the kind as the reader moves from one of its words to the next', async () => {
    // A reader who has sifted the vocabulary down to the charges is still among
    // them a word later: every link that stays on this page carries the kind.
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr?of=charge');
    await strike('losange');
    expect(struck()).toBe('losange');
    expect(sifted()).toBe(`${CHARGES.length} charges`);
    expect(stacked()).toBe(CHARGES.length);
  });

  test('gives the kind up for the word, where the word asked for is not of it', () => {
    // The losange shows what it is voided as, and voided is a modifier. The
    // stack widens to hold what is being read rather than answering a reader who
    // asked for azur with a charge they did not ask for.
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr?of=charge#azur');
    expect(struck()).toBe('azur');
    expect(stacked()).toBe(FRENCH.length);
    expect(sifted()).toBe(`${FRENCH.length} words`);
  });

  test('carries the kind on every link that stays on the page', async () => {
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr?of=charge');
    await strike('losange');
    for (const link of Array.from(showing().querySelectorAll('a[href^="/doc/vocabulary/fr"]'))) {
      expect(link.getAttribute('href'), link.textContent ?? '').toContain('?of=charge');
    }
    // In the stack, where "macle" also stands in the reading as a word to see.
    const listed = within(document.querySelector('.stack') as HTMLElement);
    expect(listed.getByRole('link', { name: 'macle' })).toHaveAttribute(
      'href',
      '/doc/vocabulary/fr?of=charge#macle'
    );
  });

  test('counts the whole vocabulary still, a reader sifted down to one kind', () => {
    // A count that fell to nothing beside every kind but the one in hand would
    // leave a reader unable to see what else there was to ask for.
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr?of=charge');
    expect(sift(`${FRENCH.length} words`)).toBeInTheDocument();
    expect(sift('8 tinctures')).toBeInTheDocument();
  });

  test('shows the whole of it where the address asks for a kind there is none of', () => {
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr?of=wyvern');
    expect(stacked()).toBe(FRENCH.length);
    expect(sifted()).toBe(`${FRENCH.length} words`);
  });
});

describe('a word read at full size', () => {
  test('says what it means, in the tongue the documentation is written in', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('croisette');
    expect(within(showing()).getByText(/The little cross/)).toBeInTheDocument();
  });

  test('says who says so by a mark, and leads to the entry itself', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('mascle');
    const cited = within(showing()).getByRole('link', { name: /A Glossary of Terms Used/ });
    // The reading carries the mark, and the citation waits behind it: in the
    // title a pointer shows, and in the name a screen reader says.
    expect(cited.textContent).toContain('[1]');
    expect(cited).toHaveAccessibleName(
      '[1] James Parker, A Glossary of Terms Used in Heraldry, under Mascle'
    );
    expect(cited).toHaveAttribute(
      'title',
      'James Parker, A Glossary of Terms Used in Heraldry, under Mascle'
    );
    expect(cited).toHaveAttribute(
      'href',
      'https://www.heraldsnet.org/saitou/parker/Jpglossm.htm#Mascle'
    );
  });

  test('stands against the gloss it answers for, nothing between the two', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('évidé');
    const read = showing().querySelector('.showing__read') as HTMLElement;
    const blocks = Array.from(read.children).map((block) => block.className);
    expect(blocks.indexOf('cited')).toBe(blocks.indexOf('showing__gloss') + 1);
  });

  test('says which tongue a source is in, where it is not the one being read', async () => {
    // Both pages are written in English, the French one included: a reader
    // learning French heraldry is not thereby reading French, so a citation
    // that leads out of English says where it leads before it is followed.
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('macle');
    const cited = within(showing()).getByRole('link', { name: /Au blason des armoiries/ });
    expect(cited).toHaveAttribute('title', 'Au blason des armoiries, Macle — in French');
    expect(cited).toHaveAttribute('hreflang', 'fr');
    expect(cited).toHaveAttribute('href', 'https://blason-armoiries.org/heraldique/m/macle.htm');
    // The tongue is marked around the citation alone: the mark belongs to no
    // language, and neither does the English saying which language this is.
    expect(cited.querySelector('[lang="fr"]')?.textContent).toBe('Au blason des armoiries, Macle');
  });

  test('says nothing of the tongue where the source is in the one being read', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('mascle');
    const cited = within(showing()).getByRole('link', { name: /A Glossary of Terms Used/ });
    expect(cited.getAttribute('title')).not.toMatch(/in English/);
  });

  test('names the rank it belongs to', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('croix');
    expect(showing().querySelector('.showing__rank')?.textContent).toBe('ordinary');
  });

  test('shows it painted and hatched, a tincture being a convention either way', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('saltire');
    expect(painting('colour')).toContain(WikipediaColours[Colours.gules]);
    expect(painting('hatching')).toContain('<pattern');
  });

  test('bears it gules on argent, so what changes is the word', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('billet');
    const painted = painting('colour').match(/(?:fill|stroke)="(#[0-9a-f]{6})"/g) ?? [];
    const [field, ...borne] = painted.filter((paint) => !paint.includes(OUTLINE));
    expect(field).toBe(`fill="${WikipediaColours[Metals.argent]}"`);
    expect(borne.every((paint) => paint.endsWith(`"${WikipediaColours[Colours.gules]}"`))).toBe(
      true
    );
  });

  test('offers a blazon carrying that very spelling, in this tongue alone', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('billette');
    expect(within(showing()).getByText("D'argent à la billette de gueules.")).toBeInTheDocument();
    expect(within(showing()).queryByText('Argent a billet gules.')).toBeNull();
  });

  test('says what a word it reads and never writes comes back as', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('cross humetty');
    expect(within(showing()).getByText('Written back as')).toBeInTheDocument();
    expect(within(showing()).getByText('Argent a cross couped gules.')).toBeInTheDocument();
  });

  test('says nothing of the sort where the blazon comes back as it went in', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('besant');
    expect(within(showing()).queryByText('Written back as')).toBeNull();
  });

  test('stands every other way of writing the word beside the one that is written', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('fleur de lys');
    const spellings = showing().querySelector('.showing__spellings') as HTMLElement;
    expect(Array.from(spellings.querySelectorAll('b')).map((one) => one.textContent)).toEqual([
      'fleur-de-lys',
      'fleur de lis',
      'fleur-de-lis',
    ]);
    // One entry, not four: the stack names the lily once.
    const stack = document.querySelector('.stack') as HTMLElement;
    expect(
      Array.from(stack.querySelectorAll('.ghost__name')).filter((name) =>
        name.textContent?.startsWith('fleur')
      )
    ).toHaveLength(1);
  });

  test('sends the reader to the other spellings of the same term, all of them', async () => {
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('hurt');
    const seen = seeAlso();
    expect(Array.from(seen.querySelectorAll('a')).map((link) => link.textContent)).toEqual([
      'roundel',
      'besant',
      'plate',
      'torteau',
      'pellet',
      'pomme',
    ]);
    expect(seen.querySelector('a')).toHaveAttribute('href', '/doc/vocabulary/en#roundel');
  });

  test('says what the other tongue calls it beside the word itself', async () => {
    // Beside the name and not filed below the rest: it is the same word said
    // again, so a reader who came for the translation finds it where the word
    // is.
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('hurt');
    expect(struck()).toBe('hurt');
    expect(abroad()).toBe('(French: tourteau)');
    const link = showing().querySelector('.showing__abroad a') as HTMLElement;
    expect(link).toHaveTextContent('tourteau');
    expect(link).toHaveAttribute('href', '/doc/vocabulary/fr#tourteau');
  });

  test('says nothing beside it where the other tongue has no such word', async () => {
    mount(<VocabularyPage language={Languages.fr} />);
    await strike('plain');
    expect(struck()).toBe('plain');
    expect(abroad()).toBeUndefined();
  });

  test('opens each word at its head, however far the last one was read', async () => {
    // Where the reading perches beside the vocabulary it scrolls itself, so a
    // long word read to the foot would leave the next one opened halfway down
    // itself. jsdom lays nothing out, so the scroll is set by hand and the
    // question put is only whether striking a word returns it.
    mount(<VocabularyPage language={Languages.fr} />, '/doc/vocabulary/fr#losange');
    expect(struck()).toBe('losange');
    leaf().scrollTop = 705;
    await strike('chef');
    expect(struck()).toBe('chef');
    expect(leaf().scrollTop).toBe(0);
  });

  test('brings the word into view among the rest, where the stack scrolls itself', async () => {
    // A reader who strikes a word from the stack is looking at it already; one
    // who follows "see also" out of the reading is not, and the stack stands
    // wherever it was last left. jsdom lays nothing out, so the pane is told it
    // overflows and the question put is only which word was brought.
    mount(<VocabularyPage language={Languages.fr} />);
    overflowing(pane());
    const brought = vi.spyOn(Element.prototype, 'scrollIntoView');
    await strike('sautoir');
    expect(brought.mock.instances).toContain(pane().querySelector('.stack [aria-current="true"]'));
    brought.mockRestore();
  });

  test('leaves the stack where it stands where the page is what scrolls', async () => {
    // Narrow, the pane holds no scroll of its own and the page is already
    // carrying the reader to the reading: two answers to one tap would fight.
    mount(<VocabularyPage language={Languages.fr} />);
    const brought = vi.spyOn(Element.prototype, 'scrollIntoView');
    await strike('sautoir');
    expect(brought.mock.instances).not.toContain(
      pane().querySelector('.stack [aria-current="true"]')
    );
    brought.mockRestore();
  });

  test('sets the blazon with the arms it drew, the two being the one fact', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('billet');
    const arms = showing().querySelector('.showing__arms') as HTMLElement;
    // The shields and the blazon that produced them stand in the one block, so
    // that nobody has to be told they belong together.
    expect(arms.querySelectorAll('.showing__field').length).toBeGreaterThan(0);
    expect(within(arms).getByText('Argent a billet gules.')).toBeInTheDocument();
  });
});

describe('what one drawing cannot say', () => {
  test('bears a charge in number, and sows it, under a heading apiece', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('cross couped');
    expect(headings()).toEqual(['Borne in number', 'Sown']);
    expect(labels('Borne in number')).toEqual(['Twice', 'Thrice']);
    expect(labels('Sown')).toEqual(['Over the field']);
  });

  test('shows a charge under whatever may be said of it, where anything may', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('billet');
    expect(headings()).toEqual(['Borne in number', 'Sown', 'Modified']);
    expect(labels('Modified')).toEqual(['Voided', 'Pierced']);
  });

  test('leads from the modified charge to the word that modified it', async () => {
    // The pairing is written once, on the arms that show it, so there is no
    // second list of the same words standing apart from them.
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('billet');
    const shown = within(section('Modified')).getByRole('link', { name: 'Voided' });
    expect(shown).toHaveAttribute('href', '/doc/vocabulary/en#voided');
    expect(within(showing()).queryByText('Said of it')).toBeNull();
  });

  test('shows a modifier on every charge it is said of, and leads to each', async () => {
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('voided');
    expect(headings()).toEqual(['Said of']);
    expect(labels('Said of')).toEqual(['Billet', 'Lozenge', 'Roundel', 'Mullet']);
    expect(within(section('Said of')).getByRole('link', { name: 'Lozenge' })).toHaveAttribute(
      'href',
      '/doc/vocabulary/en#lozenge'
    );
  });

  test('says why an ordinary is borne but once, rather than bearing it twice', async () => {
    mount(<VocabularyPage language={Languages.en} />);
    await strike('bordure');
    expect(showing().querySelectorAll('.showing__variant')).toHaveLength(0);
    expect(within(showing()).getByText(/shield has one edge/)).toBeInTheDocument();
  });
});

describe('the glimpse a name gives of the word it leads to', () => {
  const card = () => screen.queryByRole('tooltip');
  const glimpse = async (among: HTMLElement, name: string) => {
    await userEvent.setup().hover(within(among).getByRole('link', { name }));
    return card();
  };

  test('shows a word under "See also" before the reader goes to it', async () => {
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('hurt');
    const shown = (await glimpse(seeAlso(), 'pomme')) as HTMLElement;
    expect(shown.querySelector('.preview__name')).toHaveTextContent('pomme');
    // The arms are the half that answers "is this the word I want?" fastest.
    expect(shown.querySelector('img')).toBeInTheDocument();
    expect(shown.querySelector('.preview__gloss')?.textContent).toBe(
      shortened(word(ENGLISH, 'pomme').description)
    );
  });

  test('leaves the translation alone: it is the same word again, not a word to look up', async () => {
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('hurt');
    const abroadLink = showing().querySelector('.showing__abroad a') as HTMLElement;
    await userEvent.setup().hover(abroadLink);
    expect(card()).toBeNull();
  });

  test('shows a charge named under "Said of" as well', async () => {
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en');
    await strike('voided');
    const shown = (await glimpse(section('Said of'), 'Lozenge')) as HTMLElement;
    expect(shown.querySelector('.preview__name')).toHaveTextContent('lozenge');
    expect(shown.querySelector('.preview__gloss')?.textContent).toBe(
      shortened(word(ENGLISH, 'lozenge').description)
    );
  });

  test('shows a word the stack has been sifted out of, the glimpse being of the whole', async () => {
    // Sifted to the modifiers, voided still points at the losange, which is a
    // charge: what is listed and what may be glimpsed are two questions.
    mount(<VocabularyPage language={Languages.en} />, '/doc/vocabulary/en?of=modifier#voided');
    expect(struck()).toBe('voided');
    expect((await glimpse(section('Said of'), 'Lozenge')) as HTMLElement).toHaveTextContent(
      'lozenge'
    );
  });
});
