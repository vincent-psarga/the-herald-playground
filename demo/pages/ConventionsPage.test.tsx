// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { isDivision, isFurred, isPlain, isVariation } from '../../src/domain/models/Field';
import { Languages } from '../../src/domain/models/Languages';
import { METALS, Tincture, isFur } from '../../src/domain/models/Tinctures';
import { mount } from '../testing/Mounting';
import { LANGUAGES } from '../utils/Languages';
import { readingPath } from '../utils/Reading';
import { ConventionsPage } from './ConventionsPage';

afterEach(cleanup);

/** One worked pair on the page: what was typed, and what came back of it. */
interface Case {
  readonly typed: string;
  /** The tongue it was typed in, which the page says of every blazon it shows. */
  readonly language: Languages;
  readonly written: readonly string[];
  readonly refused: string | undefined;
  readonly arms: number;
}

const cases = (): readonly Case[] =>
  Array.from(document.querySelectorAll('.case')).map((shown) => ({
    typed: shown.querySelector('.case__typed')?.textContent ?? '',
    language: shown.querySelector('.case__typed')?.getAttribute('lang') as Languages,
    written: Array.from(shown.querySelectorAll('.case__written a')).map(
      (link) => link.textContent ?? ''
    ),
    refused: shown.querySelector('.case__refused')?.textContent ?? undefined,
    arms: shown.querySelectorAll('img').length,
  }));

const shown = (typed: string): Case => {
  const found = cases().find((one) => one.typed === typed);
  expect(found, `no case typed «${typed}»`).toBeDefined();
  return found!;
};

/** What the library answers, asked of it directly rather than of the page. */
const answered = (typed: string, read: Languages, written: Languages) =>
  LANGUAGES[written].writer.write(LANGUAGES[read].parser.parse(typed));

const HEADINGS = [
  'One spelling for each term',
  'English counts the pieces, French counts only when it must',
  'A name that means a tincture is written without one',
  'A tincture that has a name of its own is written by it',
  'A name that means what was done to the charge is written without saying it',
  'A name that means a part of the figure is written, and the part keeps its tincture',
  'Two parts of one colour are written once, and the colour said last',
  'A strewing is named where heraldry names it',
  'A word that says nothing is read and never written',
  'A modifier stands after the charge and before its tincture',
  'A French modifier agrees with the charge the blazon named',
  'A modifier is said only of a charge that can show it',
  'A word the armorials keep for one charge is written of that charge alone',
  'The smaller settlements',
];

describe('ConventionsPage', () => {
  test('says what the page is before any rule is read', () => {
    mount(<ConventionsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conventions');
    expect(screen.getByText(/Several blazons in · one blazon out/)).toBeInTheDocument();
  });

  test.each(HEADINGS)('states the rule: %s', (heading) => {
    mount(<ConventionsPage />);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  test('gives each rule a place of its own, so one may be sent without the rest', () => {
    mount(<ConventionsPage />);
    const rules = Array.from(document.querySelectorAll('.rule'));
    expect(rules).toHaveLength(HEADINGS.length);
    for (const rule of rules) {
      expect(rule.id).not.toBe('');
    }
  });

  test('works every pair through the library rather than quoting one', () => {
    mount(<ConventionsPage />);
    for (const { typed, language, written, refused } of cases()) {
      if (refused !== undefined) {
        expect(() => LANGUAGES[language].parser.parse(typed)).toThrow(refused);
        continue;
      }
      expect(written).toEqual([
        answered(typed, language, Languages.fr),
        answered(typed, language, Languages.en),
      ]);
    }
  });

  test('offers every written blazon as a way to the reading of it', () => {
    mount(<ConventionsPage />);
    for (const link of Array.from(document.querySelectorAll('.case__written a'))) {
      const blazon = link.textContent ?? '';
      const language = link.getAttribute('lang') as Languages;
      expect(link).toHaveAttribute('href', readingPath(blazon, language));
    }
  });
});

describe('what each rule shows', () => {
  test('writes one spelling of the several it reads', () => {
    mount(<ConventionsPage />);
    expect(shown('Argent a border gules').written).toContain('Argent a bordure gules.');
    expect(shown('Azure a bezant').written).toContain('Azure a besant.');
    expect(shown('Pily counter pily of four or and azure').written).toContain(
      'Pily of four or and azure.'
    );
    expect(shown("D'argent au losange de gueules").written).toContain(
      "D'argent à la losange de gueules."
    );
    expect(shown("D'or aux trois tourteaux de gueules").written).toContain(
      "D'or à trois tourteaux de gueules."
    );
  });

  test('counts the pieces in English and keeps quiet about the usual number in French', () => {
    mount(<ConventionsPage />);
    expect(shown('Barry or and azure').written).toEqual([
      "Fascé d'or et d'azur.",
      'Barry of six or and azure.',
    ]);
    expect(shown("Bandé d'or et d'azur de six pièces").written).toContain("Bandé d'or et d'azur.");
    expect(shown("Bandé d'or et d'azur de huit pièces").written).toContain(
      "Bandé d'or et d'azur de huit pièces."
    );
  });

  test('drops a tincture the name has already said', () => {
    mount(<ConventionsPage />);
    expect(shown("D'azur au besant d'or").written).toEqual([
      "D'azur au besant.",
      'Azure a besant.',
    ]);
  });

  test('keeps the tincture where the name means no single one', () => {
    mount(<ConventionsPage />);
    expect(shown("D'or au tourteau de gueules").written).toContain("D'or au tourteau de gueules.");
  });

  test('refuses a tincture the name cannot mean, and draws no arms for it', () => {
    mount(<ConventionsPage />);
    const refused = shown('Azure a besant argent');
    expect(refused.refused).toBe('Wrong tincture: besant is never argent');
    expect(refused.written).toEqual([]);
    expect(refused.arms).toBe(0);
  });

  test('writes the name the tincture has, where it has one', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a roundel or').written).toContain('Azure a besant.');
    expect(shown('Or three roundels gules').written).toContain('Or three torteaux.');
    expect(shown('Azure a roundel argent').written).toContain('Azure a plate.');
  });

  test('writes the plain name where the tincture has none', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a roundel ermine').written).toContain('Azure a roundel ermine.');
  });

  test('names a strewing where the language has a word for it', () => {
    mount(<ConventionsPage />);
    expect(shown("D'azur semé de billettes d'or").written).toEqual([
      "D'azur billeté d'or.",
      'Azure billetty or.',
    ]);
    expect(shown('Azure semy of roundels or').written).toContain('Azure bezanty.');
  });

  test('sows it in as many words where no word of the language will take the tincture', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure semy of roundels argent').written).toContain('Azure semy of plates.');
    expect(shown("D'azur semé d'annelets d'or").written).toContain("D'azur semé d'annelets d'or.");
  });

  test('never writes "plain" back, the blazon saying it by stopping', () => {
    mount(<ConventionsPage />);
    expect(shown('De gueules plain').written).toEqual(['De gueules.', 'Gules.']);
    expect(shown("D'hermine plain").written).toContain("D'hermine.");
  });

  test('refuses a field called plain and then charged', () => {
    mount(<ConventionsPage />);
    const refused = shown("D'or plain au chef de gueules");
    expect(refused.refused).toBe('A plain field bears nothing: one was laid on it');
    expect(refused.written).toEqual([]);
  });

  test('writes a modifier between the charge and its tincture', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a billet voided or').written).toEqual([
      "D'azur à la billette vidée d'or.",
      'Azure a billet voided or.',
    ]);
    expect(shown("D'or à trois billettes de sable vidées").written).toContain(
      'Or three billets voided sable.'
    );
  });

  test('writes the name heraldry gave the modified figure, and drops the modifier into it', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a lozenge voided or').written).toEqual([
      "D'azur à la macle d'or.",
      'Azure a mascle or.',
    ]);
    expect(shown('Or three lozenges pierced sable').written).toEqual([
      "D'or à trois rustres de sable.",
      'Or three rustres sable.',
    ]);
    // Said twice and understood; said two ways and refused.
    expect(shown('Azure a mascle voided or').written).toContain('Azure a mascle or.');
    const refused = shown('Azure a mascle pierced or');
    expect(refused.refused).toBe('Wrong modifier: mascle is never pierced');
    expect(refused.arms).toBe(0);
    // English named no pierced star, so it writes the two words French says in
    // one — and reads its own writing back.
    expect(shown('Azure a mullet pierced or').written).toEqual([
      "D'azur à la molette d'or.",
      'Azure a mullet pierced or.',
    ]);
  });

  test('writes the name heraldry gave the figure with a part painted, and keeps the tincture', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a ring or stoned argent').written).toEqual([
      "D'azur à l'anneau d'or chatonné d'argent.",
      'Azure a gem-ring or stoned argent.',
    ]);
    expect(shown('Azure an annulet or stoned argent').written).toEqual(
      shown('Azure a ring or stoned argent').written
    );
    // The name says there is a stone and never its colour, so a blazon that
    // named none gets none back.
    expect(shown('Azure a gem-ring or').written).toEqual([
      "D'azur à l'anneau d'or.",
      'Azure a gem-ring or.',
    ]);
  });

  test('says the colour once where two parts share it, and twice where they do not', () => {
    mount(<ConventionsPage />);
    expect(shown("D'argent au lion de sable armé et lampassé de gueules").written).toEqual([
      "D'argent au lion de sable armé et lampassé de gueules.",
      'Argent a lion sable armed and langued gules.',
    ]);
    // Written with the mark instead, and answered with the conjunction.
    expect(shown("D'argent au lion de sable, armé, lampassé de gueules").written).toEqual(
      shown("D'argent au lion de sable armé et lampassé de gueules").written
    );
    expect(shown('Argent a lion sable armed gules langued azure').written).toEqual([
      "D'argent au lion de sable armé de gueules, lampassé d'azur.",
      'Argent a lion sable armed gules, langued azure.',
    ]);
  });

  test('agrees every word of the run with the charge, in number as in gender', () => {
    mount(<ConventionsPage />);
    expect(shown('Argent three lions sable armed and langued gules').written).toContain(
      "D'argent à trois lions de sable armés et lampassés de gueules."
    );
  });

  test('refuses a part of a figure the charge has not got', () => {
    mount(<ConventionsPage />);
    const refused = shown('Azure a billet or stoned argent');
    expect(refused.refused).toBe('Wrong attribute: billet is never stoned');
    expect(refused.arms).toBe(0);
  });

  test('never writes a pierced charge as a voided one, the two being two things', () => {
    mount(<ConventionsPage />);
    expect(shown("D'azur à la billette percée d'or").written).toEqual([
      "D'azur à la billette percée d'or.",
      'Azure a billet pierced or.',
    ]);
  });

  test('reads it after the tincture too, and answers in the settled order', () => {
    mount(<ConventionsPage />);
    expect(shown('Azure a billet or voided').written).toEqual(
      shown('Azure a billet voided or').written
    );
  });

  test('refuses the word set before the charge, which is no word order of blazon', () => {
    mount(<ConventionsPage />);
    const refused = shown('Azure a voided lozenge or');
    expect(refused.refused).toBe('Unknown ordinary: voided');
    expect(refused.arms).toBe(0);
  });

  test('holds a blazon to the gender it chose for the charge', () => {
    mount(<ConventionsPage />);
    const refused = shown("D'azur à la billette vidé d'or");
    expect(refused.refused).toBe('Wrong agreement: expected "vidée"');
    expect(refused.written).toEqual([]);
    // The losange is read under either article and the word said of it has to
    // agree with the one the blazon chose — which is the other rule's case, the
    // losange voided having a name of its own to come back under.
    expect(shown("D'azur au losange vidé d'or").written).toContain("D'azur à la macle d'or.");
    // And under the other article, with the word agreeing the other way: one
    // charge, one answer, whichever gender the blazon chose for it.
    expect(shown("D'azur à la losange vidée d'or").written).toContain("D'azur à la macle d'or.");
  });

  test('writes each of the two French voidings of the charges it is kept for', () => {
    mount(<ConventionsPage />);
    // Read with the other word and answered with the charge's own: the star is
    // évidée where everything else is vidée, and neither reading is refused.
    expect(shown("D'azur à la billette évidée d'or").written).toEqual([
      "D'azur à la billette vidée d'or.",
      'Azure a billet voided or.',
    ]);
    expect(shown("D'argent à l'étoile vidée de gueules").written).toEqual([
      "D'argent à l'étoile évidée de gueules.",
      'Argent a mullet voided gules.',
    ]);
    expect(shown("D'or à trois billettes vidées de sable").written).toContain(
      "D'or à trois billettes vidées de sable."
    );
    // English says it with the one word wherever it says it.
    expect(shown('Azure a mullet voided or').written).toEqual([
      "D'azur à l'étoile évidée d'or.",
      'Azure a mullet voided or.',
    ]);
  });

  test('refuses a modifier on a charge that is already what it says', () => {
    mount(<ConventionsPage />);
    const refused = shown('Azure an annulet voided or');
    expect(refused.refused).toBe('Wrong modifier: annulet is never voided');
    expect(refused.arms).toBe(0);
  });

  test('refuses a modifier on an ordinary, no voided band being drawn', () => {
    mount(<ConventionsPage />);
    const refused = shown('Azure a fess voided or');
    expect(refused.refused).toBe('Wrong modifier: fess is never voided');
    expect(refused.arms).toBe(0);
  });

  test('parts one charge from the next, and writes the blazon as a sentence', () => {
    mount(<ConventionsPage />);
    expect(shown('or a chief gules a bordure azure').written).toContain(
      'Or a chief gules, a bordure azure.'
    );
  });
});

describe('the arms beside a case', () => {
  test('draws the one shield both blazons describe, the reading having changed nothing', () => {
    mount(<ConventionsPage />);
    for (const { typed, refused, arms } of cases()) {
      expect(arms, `arms beside «${typed}»`).toBe(refused === undefined ? 1 : 0);
    }
  });

  test('leaves the arms unnamed, the blazon beside them already naming them', () => {
    mount(<ConventionsPage />);
    const first = document.querySelector('.case img');
    expect(first).toHaveAttribute('alt', '');
  });
});

/**
 * The arms a rule is shown by are arms first: a reader learning heraldry off this
 * page must not be taught a blazon no herald would grant. A fur is neither metal
 * nor colour and answers to nothing here, and a field divided between two
 * tinctures is exempt by the rule's own terms — so what is checked is a plain
 * field and what is laid on it.
 */
const rank = (tincture: Tincture) =>
  isFur(tincture) ? 'fur' : METALS.includes(tincture as never) ? 'metal' : 'colour';

describe('the rule of tincture, which every example must keep', () => {
  test('lays no metal on metal and no colour on colour', () => {
    mount(<ConventionsPage />);
    for (const { typed, language, refused } of cases()) {
      if (refused !== undefined) {
        continue;
      }
      const blazon = LANGUAGES[language].parser.parse(typed);
      const { field } = blazon;
      if (isDivision(field) || isVariation(field) || isFurred(field)) {
        continue;
      }
      const ground = rank(field.tincture);
      // What is sown on the field answers to the rule as surely as what is
      // borne on it: a semy lies straight on the tincture with nothing between.
      const over = [
        ...(isPlain(field) && field.semy !== undefined ? [field.semy] : []),
        ...(blazon.chargesOrOrdinaries ?? []),
      ];
      for (const one of over) {
        const laid = rank(one.tincture);
        expect(
          ground === 'fur' || laid === 'fur' || ground !== laid,
          `«${typed}» lays ${laid} on ${ground}`
        ).toBe(true);
      }
    }
  });
});

describe('the authorities the decisions rest on', () => {
  test.each([
    ['https://www.heraldry.ca/resources/BLAZONRY_GUIDE_2014.pdf'],
    ['https://blason-armoiries.org/heraldique/b/bandee.htm'],
    ['https://www.heraldsnet.org/saitou/parker/Jpglossr.htm#Roundles'],
    ['https://blason-armoiries.org/heraldique/b/besant.htm'],
    ['https://blason-armoiries.org/heraldique/l/losange.htm'],
    ['https://www.heraldsnet.org/saitou/parker/Jpglossv.htm#Voided'],
    ['https://blason-armoiries.org/heraldique/e/evide.htm'],
    ['https://blason-armoiries.org/heraldique/v/vide.htm'],
    ['https://en.wikipedia.org/wiki/Blazon'],
  ])('cites %s', (href) => {
    mount(<ConventionsPage />);
    expect(document.querySelector(`.cited a[href="${href}"]`)).toBeInTheDocument();
  });

  test('says who says so by a mark, the citation waiting behind it', () => {
    mount(<ConventionsPage />);
    const rule = document.querySelector('#naming-a-strewing') as HTMLElement;
    const cited = within(rule).getByRole('link', { name: /A Glossary of Terms Used/ });
    expect(cited.textContent).toContain('[1]');
    expect(cited).toHaveAttribute(
      'title',
      'James Parker, A Glossary of Terms Used in Heraldry, under Seme'
    );
  });

  test("marks each rule's works in the order its prose quotes them", () => {
    mount(<ConventionsPage />);
    const rule = document.querySelector('#a-name-that-means-what-was-done') as HTMLElement;
    const marks = Array.from(rule.querySelectorAll('.cited a')).map((cited) =>
      cited.getAttribute('title')
    );
    expect(marks).toEqual([
      'James Parker, A Glossary of Terms Used in Heraldry, under Mascle',
      'James Parker, A Glossary of Terms Used in Heraldry, under Rustre',
      'Au blason des armoiries, Macle — in French',
      'Au blason des armoiries, Rustre — in French',
      'James Parker, A Glossary of Terms Used in Heraldry, under Mullet',
    ]);
  });

  test('names the guide that says English counts every time', () => {
    mount(<ConventionsPage />);
    const rule = document.querySelector('#counting-the-pieces') as HTMLElement;
    expect(
      within(rule).getByText(/always stating the number and the tinctures involved/)
    ).toBeInTheDocument();
  });
});
