import { describe, expect, test } from 'vitest';
import { EnglishBlazonWriter } from '../../src/application/writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from '../../src/application/writer/FrenchBlazonWriter';
import { Languages, TONGUES } from '../../src/domain/models/Languages';
import { isFur } from '../../src/domain/models/Tinctures';
import { IBlazonWriter } from '../../src/domain/services/IBlazonWriter';
import { anchorOf, folded } from './Anchors';
import { readBlazon } from './Reading';
import { VocabularyEntry, lettersOf, vocabularyIn } from './Vocabulary';

const WRITERS: Record<Languages, IBlazonWriter> = {
  [Languages.fr]: new FrenchBlazonWriter(),
  [Languages.en]: new EnglishBlazonWriter(),
};

const french = vocabularyIn(Languages.fr);
const english = vocabularyIn(Languages.en);

const word = (entries: readonly VocabularyEntry[], spelling: string) => {
  const found = entries.find((entry) => entry.spellings.includes(spelling));
  if (found === undefined) {
    throw new Error(`No entry spells "${spelling}"`);
  }
  return found;
};

const spelled = (entries: readonly VocabularyEntry[]) =>
  entries.flatMap((entry) => entry.spellings);

/** One heading's worth of further arms, which is one question about the word. */
const under = (entry: VocabularyEntry, heading: string) => {
  const found = entry.otherwise.find((variants) => variants.heading === heading);
  if (found === undefined) {
    throw new Error(`"${entry.word}" says nothing under "${heading}"`);
  }
  return found.entries;
};

const asked = (entry: VocabularyEntry) => entry.otherwise.map(({ heading }) => heading);
const labelled = (entry: VocabularyEntry, heading: string) =>
  under(entry, heading).map(({ label }) => label);
const blazoned = (entry: VocabularyEntry, heading: string) =>
  under(entry, heading).map(({ typed }) => typed);
const leadingTo = (entry: VocabularyEntry, heading: string) =>
  under(entry, heading).map(({ sighting }) => sighting?.word);

describe('what the vocabulary holds', () => {
  test.each(TONGUES)('%s lists every word its wording knows', (language) => {
    // Counted off the vocabulary rather than written down: what fails here is a
    // word the library reads and the page does not show.
    const spellings = spelled(vocabularyIn(language));
    expect(spellings).toContain(language === Languages.fr ? 'gueules' : 'gules');
    expect(spellings).toContain(language === Languages.fr ? 'croisette' : 'cross couped');
    expect(spellings).toContain(language === Languages.fr ? 'billeté' : 'billetty');
  });

  test('holds the two words that say what a field is rather than what it bears', () => {
    expect(spelled(french)).toContain('plain');
    expect(spelled(french)).toContain('semé');
    expect(spelled(english)).toContain('semy');
  });

  test('holds no plumbing: an article is not a word of the vocabulary', () => {
    for (const plumbing of ['à la', 'au', 'de', 'et', 'and', 'of', 'pièces', 'trois', 'three']) {
      expect(spelled(french)).not.toContain(plumbing);
      expect(spelled(english)).not.toContain(plumbing);
    }
  });

  test('has no word for a bare field in English, which is given none', () => {
    expect(spelled(english)).not.toContain('plain');
  });

  test.each(TONGUES)('%s says what every one of its words means', (language) => {
    for (const entry of vocabularyIn(language)) {
      expect(entry.description, entry.word).not.toBe('');
    }
  });

  test.each(TONGUES)('%s says who says so of every one of its words', (language) => {
    // A gloss nobody stands behind is this library's opinion about heraldry,
    // which is not a thing it is entitled to have.
    for (const entry of vocabularyIn(language)) {
      expect(entry.sources.length, entry.word).toBeGreaterThan(0);
      for (const source of entry.sources) {
        expect(source.title, entry.word).not.toBe('');
        expect(source.url, entry.word).toMatch(/^https?:\/\/\S+$/);
      }
    }
  });

  test('answers for a French word out of a French work, and says as much', () => {
    // The gloss is English on both pages; the authority behind it need not be,
    // and the dictionaries that settle French heraldry are French.
    for (const source of word(french, 'sautoir').sources) {
      expect(source.language).toBe(Languages.fr);
    }
    for (const source of word(english, 'saltire').sources) {
      expect(source.language).toBe(Languages.en);
    }
  });

  test.each(TONGUES)('%s files each word at an address of its own', (language) => {
    const anchors = vocabularyIn(language).map((entry) => entry.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
  });
});

describe('what a word means', () => {
  test('is the thing itself, not what the other tongue calls it', () => {
    // A reader of one page is learning that tongue; what the other says is the
    // business of the link across, and is said there.
    expect(word(french, 'azur').description).toBe('Blue.');
    expect(word(english, 'azure').description).toBe('Blue.');
    expect(word(english, 'mullet').description).not.toMatch(/French/);
    expect(word(french, 'étoile').description).not.toMatch(/English/);
    expect(word(french, 'macle').description).not.toMatch(/English/);
    expect(word(english, 'mascle').description).not.toMatch(/French/);
  });

  test('stands on its own, a reader arriving at any word by its anchor alone', () => {
    // Every spelling says what the figure is before it says what sort of
    // spelling it is: "the same flower" is no use to whoever came here first.
    for (const spelling of ['fleur-de-lis', 'fleur-de-lys']) {
      expect(word(english, spelling).description).toMatch(/middle petal rising to a point/);
    }
    for (const spelling of ['vairy', 'vairé']) {
      expect(word(english, spelling).description).toMatch(/bells of vair/);
    }
    expect(word(english, 'besant').description).toMatch(/plain disc/);
    expect(word(english, 'cross humetty').description).toMatch(/four equal arms/);
    expect(word(english, 'border').description).toMatch(/whole edge of the shield/);
    expect(word(english, 'pily counter pily').description).toMatch(/long triangles/);
  });
});

describe('the letters the words are filed under', () => {
  test.each(TONGUES)('%s runs them in order', (language) => {
    const letters = lettersOf(vocabularyIn(language)).map(({ letter }) => letter);
    expect(letters).toEqual([...letters].sort());
    expect(new Set(letters).size).toBe(letters.length);
  });

  test('files an accented word under the letter without the accent', () => {
    expect(word(french, 'étoile').letter).toBe('E');
    expect(word(french, 'émanché').letter).toBe('E');
  });

  test('files a word of several under its first', () => {
    expect(word(english, 'bar gemel').letter).toBe('B');
    expect(word(english, 'per bend sinister').letter).toBe('P');
  });
});

describe('a word written more than one way', () => {
  test('is the one word, and answers to every way of writing it', () => {
    const lily = word(english, 'fleur-de-lys');
    expect(lily.word).toBe('fleur-de-lis');
    expect(lily.spellings).toEqual([
      'fleur-de-lis',
      'fleur-de-lys',
      'fleur de lis',
      'fleur de lys',
    ]);
  });

  test('is one entry of the vocabulary and not several', () => {
    for (const spelling of ['fleur-de-lys', 'fleur de lis', 'fleur de lys']) {
      expect(english.filter((entry) => entry.word === spelling)).toEqual([]);
    }
    expect(french.filter((entry) => entry.word.startsWith('fleur'))).toHaveLength(1);
  });

  test('is read under every one of them all the same', () => {
    // The vocabulary lists one; the parser answers to the lot.
    for (const spelling of ['Argent a fleur-de-lys gules.', 'Argent a fleur de lis gules.']) {
      const read = readBlazon(spelling, Languages.en);
      expect('blazon' in read, spelling).toBe(true);
    }
    expect(readBlazon("D'argent à trois fleurs-de-lis de gueules.", Languages.fr)).toHaveProperty(
      'blazon'
    );
    expect(readBlazon('Argent semy-de-lys gules.', Languages.en)).toHaveProperty('blazon');
    expect(readBlazon('Argent semee of annulets gules.', Languages.en)).toHaveProperty('blazon');
    expect(readBlazon('Gules a bezant.', Languages.en)).toHaveProperty('blazon');
    expect(readBlazon('Vaire argent and gules.', Languages.en)).toHaveProperty('blazon');
  });

  test('keeps a spelling that is another word rather than another writing of one', () => {
    // Vairy is English and vairé the French participle English borrowed; semy
    // and semé the same pair. Telling a reader they were one spelling would be
    // telling them something false.
    expect(word(english, 'vairy').word).toBe('vairy');
    expect(word(english, 'vairé').word).toBe('vairé');
    expect(word(english, 'semy').word).toBe('semy');
    expect(word(english, 'semé').word).toBe('semé');
    expect(word(english, 'border').word).toBe('border');
    expect(word(english, 'cross humetty').word).toBe('cross humetty');
  });

  test('gathers the accent and the hyphen under the word they are a writing of', () => {
    expect(word(english, 'vaire').word).toBe('vairé');
    expect(word(english, 'semee').word).toBe('semé');
    expect(word(english, 'bezant').word).toBe('besant');
    expect(word(english, 'semé-de-lis').word).toBe('semy-de-lis');
  });
});

describe('the arms a word is shown in', () => {
  test.each(TONGUES)('%s writes a blazon carrying that very spelling', (language) => {
    for (const entry of vocabularyIn(language)) {
      expect(entry.typed.toLowerCase(), entry.word).toContain(entry.word.toLowerCase());
    }
  });

  test.each(TONGUES)('%s offers nothing the parser refuses', (language) => {
    for (const entry of vocabularyIn(language)) {
      expect(entry.refused, `${entry.word}: ${entry.typed}`).toBeUndefined();
    }
  });

  test.each(TONGUES)('%s answers each typed blazon with what the writer writes', (language) => {
    for (const entry of vocabularyIn(language)) {
      const read = readBlazon(entry.typed, language);
      expect('blazon' in read).toBe(true);
      if ('blazon' in read) {
        expect(WRITERS[language].write(read.blazon)).toBe(entry.written ?? entry.typed);
      }
    }
  });

  test('says what a spelling read and never written comes back as', () => {
    expect(word(english, 'cross humetty').typed).toBe('Argent a cross humetty gules.');
    expect(word(english, 'cross humetty').written).toBe('Argent a cross couped gules.');
    expect(word(english, 'border').written).toBe('Argent a bordure gules.');
    // Plain is read and never written at all, so what it comes back as is the
    // field without it.
    expect(word(french, 'plain').typed).toBe('De gueules plain.');
    expect(word(french, 'plain').written).toBe('De gueules.');
  });

  test('says nothing about coming back where the blazon comes back as it went in', () => {
    expect(word(english, 'besant').written).toBeUndefined();
    expect(word(french, 'croix').written).toBeUndefined();
  });

  test('bears a word that means no tincture gules on argent', () => {
    expect(word(french, 'annelet').typed).toBe("D'argent à l'annelet de gueules.");
    expect(word(english, 'saltire').typed).toBe('Argent a saltire gules.');
  });

  test('bears a word that means a tincture in the one it means', () => {
    // The field turns to keep the rule of tincture rather than the word turning
    // to keep the field.
    expect(word(french, 'besant').typed).toBe('De gueules au besant.');
    expect(word(french, 'tourteau').typed).toBe("D'argent au tourteau de gueules.");
    expect(word(english, 'hurt').typed).toBe('Argent a hurt.');
    expect(word(english, 'plate').typed).toBe('Gules a plate.');
  });

  test.each(TONGUES)('%s chooses no fur for a word that does not name one', (language) => {
    for (const entry of vocabularyIn(language)) {
      const borne = entry.blazon.chargesOrOrdinaries ?? [];
      for (const one of borne) {
        expect(isFur(one.tincture) && entry.rank !== 'tincture', entry.word).toBe(false);
      }
    }
  });
});

describe('the same word elsewhere', () => {
  test('names every other spelling of the term in this tongue', () => {
    expect(word(french, 'besant').alsoHere.map((seen) => seen.word)).toEqual(['tourteau']);
    expect(word(english, 'hurt').alsoHere.map((seen) => seen.word)).toEqual([
      'roundel',
      'besant',
      'plate',
      'torteau',
      'pellet',
      'pomme',
    ]);
  });

  test('names the fewest words of the other tongue that mean everything it means', () => {
    // English keeps a name for every colour of roundel and French keeps two, so
    // neither reaches the other's half in one word.
    expect(word(english, 'roundel').otherTongue.map((seen) => seen.word)).toEqual([
      'besant',
      'tourteau',
    ]);
    expect(word(english, 'hurt').otherTongue.map((seen) => seen.word)).toEqual(['tourteau']);
    expect(word(french, 'tourteau').otherTongue.map((seen) => seen.word)).toEqual(['roundel']);
  });

  test('names nothing where the other tongue has no word at all', () => {
    expect(word(french, 'plain').otherTongue).toEqual([]);
    // English sows a field with red discs in as many words: there is no adjective.
    expect(word(french, 'tourtelé').otherTongue).toEqual([]);
  });

  test('names the plain counterpart where the two tongues divide the term alike', () => {
    expect(word(french, 'croix').otherTongue.map((seen) => seen.word)).toEqual(['cross']);
    expect(word(english, 'per bend sinister').otherTongue.map((seen) => seen.word)).toEqual([
      'taillé',
    ]);
    expect(word(french, 'semé').otherTongue.map((seen) => seen.word)).toEqual(['semy']);
  });

  test("answers a name for a modified figure with the other tongue's own", () => {
    // A mascle is a macle and neither is the losange: what was done to the
    // charge is settled before the tinctures are, and settled strictly.
    expect(word(english, 'mascle').otherTongue.map(({ word }) => word)).toEqual(['macle']);
    expect(word(french, 'macle').otherTongue.map(({ word }) => word)).toEqual(['mascle']);
    expect(word(english, 'lozenge').otherTongue.map(({ word }) => word)).toEqual(['losange']);
    expect(word(english, 'rustre').otherTongue.map(({ word }) => word)).toEqual(['rustre']);
    // Where the other tongue named no such figure the plain name answers, being
    // as near as that tongue comes: English has no word for the pierced star.
    expect(word(french, 'molette').otherTongue.map(({ word }) => word)).toEqual(['mullet']);
    expect(word(english, 'mullet').otherTongue.map(({ word }) => word)).toEqual(['étoile']);
  });

  test('sends a word of the other tongue to the other tongue', () => {
    expect(word(french, 'croix').otherTongue[0].language).toBe(Languages.en);
    expect(word(french, 'besant').alsoHere[0].language).toBe(Languages.fr);
  });
});

describe('the words that say more than one drawing can', () => {
  test('bears an ordinary in number where a field may bear several', () => {
    expect(blazoned(word(english, 'chevron'), 'Borne in number')).toEqual([
      'Argent two chevrons gules.',
      'Argent three chevrons gules.',
    ]);
  });

  test('says why an ordinary is borne but once, where it is', () => {
    expect(word(english, 'chief').otherwise).toEqual([]);
    expect(word(english, 'chief').note).toMatch(/shield has one top/);
  });

  test("says why without naming the band, the reason being the shield's", () => {
    // The one sentence serves either tongue, so neither page is told the other's
    // word for what it is reading.
    expect(word(french, 'chef').note).toBe(word(english, 'chief').note);
    expect(word(french, 'chef').note).not.toMatch(/chief|chef/i);
  });

  test('asks one question per heading, a charge being asked three', () => {
    // Borne twice, sown, and voided are three different answers about the one
    // word, and a reader after one of them should not have to pick it out of
    // the other two.
    expect(asked(word(french, 'croisette'))).toEqual(['Borne in number', 'Sown']);
    expect(asked(word(french, 'billette'))).toEqual(['Borne in number', 'Sown', 'Modified']);
    expect(asked(word(english, 'chevron'))).toEqual(['Borne in number']);
    expect(asked(word(english, 'barry'))).toEqual(['Cut otherwise']);
    expect(asked(word(english, 'voided'))).toEqual(['Said of']);
  });

  test('bears a charge in number and sows it, every charge being both', () => {
    expect(labelled(word(french, 'croisette'), 'Borne in number')).toEqual(['Twice', 'Thrice']);
    expect(blazoned(word(french, 'billette'), 'Sown')).toEqual(["D'argent billeté de gueules."]);
  });

  test('shows a charge under every modifier it will take, agreement and all', () => {
    // The label names the word as the blazon beneath it names it: a billette is
    // vidée where a tourteau is vidé, and it is percée rather than vidée when
    // the hole is a hole and not the whole middle.
    expect(labelled(word(french, 'billette'), 'Modified')).toEqual(['Vidée', 'Percée']);
    expect(blazoned(word(french, 'billette'), 'Modified')).toEqual([
      "D'argent à la billette vidée de gueules.",
      "D'argent à la billette percée de gueules.",
    ]);
    expect(blazoned(word(english, 'billet'), 'Modified')).toEqual([
      'Argent a billet voided gules.',
      'Argent a billet pierced gules.',
    ]);
    // The star is voided in a word of its own, so its page says that word — and
    // pierced in the word every other charge is pierced with.
    expect(labelled(word(french, 'étoile'), 'Modified')).toEqual(['Évidée', 'Percée']);
    expect(blazoned(word(french, 'étoile'), 'Modified')).toEqual([
      "D'argent à l'étoile évidée de gueules.",
      "D'argent à l'étoile percée de gueules.",
    ]);
  });

  test('leads from the modified charge to the word that modified it', () => {
    // The pairing is written once, on the arms that show it: the label a reader
    // is looking at is the way to the word it names.
    expect(leadingTo(word(english, 'billet'), 'Modified')).toEqual(['voided', 'pierced']);
    // Which word that is, is the charge's own affair: the étoile leads to évidé
    // where the losange leads to vidé, and a page that led both to the same one
    // would be sending a reader to a word their charge never gets.
    expect(leadingTo(word(french, 'étoile'), 'Modified')).toEqual(['évidé', 'percé']);
    expect(leadingTo(word(french, 'losange'), 'Modified')).toEqual(['vidé', 'percé']);
    // Nothing else leads anywhere: a charge borne twice is the same word again.
    expect(leadingTo(word(french, 'billette'), 'Borne in number')).toEqual([undefined, undefined]);
  });

  test('shows a modifier on the charges that take it, having no figure of its own', () => {
    // Every charge it is written of stands under it, so that which charges those
    // are is said where they are shown and nowhere twice.
    expect(word(english, 'voided').typed).toBe('Argent a billet voided gules.');
    expect(labelled(word(english, 'voided'), 'Said of')).toEqual([
      'Billet',
      'Lozenge',
      'Roundel',
      'Mullet',
    ]);
    expect(leadingTo(word(english, 'voided'), 'Said of')).toEqual([
      'billet',
      'lozenge',
      'roundel',
      'mullet',
    ]);
    // A tongue that keeps a word for one charge shows it on that charge and on
    // no other: évidé is the star's word, so the star is the whole of its page.
    expect(word(french, 'évidé').typed).toBe("D'argent à l'étoile évidée de gueules.");
    expect(labelled(word(french, 'évidé'), 'Said of')).toEqual(['Étoile']);
    expect(labelled(word(french, 'vidé'), 'Said of')).toEqual(['Billette', 'Losange', 'Besant']);
    // Percé is nobody's word in particular, so it stands on every charge that
    // will take the piercing.
    expect(labelled(word(english, 'pierced'), 'Said of')).toEqual(['Billet', 'Lozenge', 'Mullet']);
    expect(word(french, 'percé').typed).toBe("D'argent à la billette percée de gueules.");
  });

  test("files each of a tongue's words for the one modifier under itself", () => {
    // Évider and vider are two verbs, so the page holds two words and says what
    // each is, rather than one word with the other hidden inside it as a
    // spelling.
    expect(word(french, 'vidé').rank).toBe('modifier');
    expect(word(french, 'vidé').typed).toBe("D'argent à la billette vidée de gueules.");
    // Each is shown on a charge it is itself the word for, so neither page is
    // quietly rewritten into the other's word.
    expect(word(french, 'vidé').written).toBeUndefined();
    expect(word(french, 'évidé').written).toBeUndefined();
    expect(word(french, 'vidé').alsoHere.map(({ word }) => word)).toEqual(['évidé']);
    expect(word(french, 'évidé').alsoHere.map(({ word }) => word)).toEqual(['vidé']);
    expect(word(french, 'vidé').otherTongue.map(({ word }) => word)).toEqual(['voided']);
    // The note shows the word's own agreements and never the other word's.
    expect(word(french, 'vidé').note).toContain('vidé, vidés, vidée, vidées');
    expect(word(french, 'vidé').note).not.toContain('évidé');
    expect(word(french, 'évidé').note).toContain('évidé, évidés, évidée, évidées');
  });

  test('tells a French reader how the word agrees, and an English reader nothing', () => {
    // French agreement is a rule of the language and has to be learnt. That a
    // modifier stands after the charge and agrees with nothing is a rule about
    // blazon, said once on the conventions page for both tongues — repeating it
    // under every English modifier would be filling the page with what the word
    // itself does not say.
    expect(word(french, 'percé').note).toMatch(/agrees with the charge in gender and in number/);
    expect(word(english, 'pierced').note).toBeUndefined();
    expect(word(english, 'voided').note).toBeUndefined();
  });

  test('files a name for a modified figure as the charge it is, and draws it modified', () => {
    // A mascle is the lozenge with the voiding done to it, so its page draws
    // that and not a plain lozenge, and its blazon is one a reader could type.
    expect(word(english, 'mascle').rank).toBe('charge');
    expect(word(english, 'mascle').typed).toBe('Argent a mascle gules.');
    expect(word(english, 'mascle').written).toBeUndefined();
    expect(word(english, 'mascle').blazon.chargesOrOrdinaries?.[0]).toHaveProperty(
      'modifier',
      'Modifier.voided'
    );
    expect(word(french, 'macle').typed).toBe("D'argent à la macle de gueules.");
    expect(word(french, 'rustre').typed).toBe("D'argent au rustre de gueules.");
    expect(word(french, 'molette').typed).toBe("D'argent à la molette de gueules.");
  });

  test('shows such a name borne in number and under what it already says', () => {
    // It cannot be sown — a field is sown with a charge and not with a charge
    // under a modifier, so a semy of mascles is a blazon the model cannot hold —
    // and the one modifier it answers to is the one its own name means.
    expect(asked(word(english, 'mascle'))).toEqual(['Borne in number', 'Modified']);
    expect(labelled(word(english, 'mascle'), 'Borne in number')).toEqual(['Twice', 'Thrice']);
    expect(blazoned(word(english, 'mascle'), 'Borne in number')).toEqual([
      'Argent two mascles gules.',
      'Argent three mascles gules.',
    ]);
    // Which is also the only way its page leads to the word it means.
    expect(leadingTo(word(english, 'mascle'), 'Modified')).toEqual(['voided']);
    expect(leadingTo(word(english, 'rustre'), 'Modified')).toEqual(['pierced']);
    expect(leadingTo(word(french, 'molette'), 'Modified')).toEqual(['percé']);
    // The plain name keeps all three, being the word that says nothing.
    expect(asked(word(english, 'lozenge'))).toEqual(['Borne in number', 'Sown', 'Modified']);
  });

  test('says nothing of a charge that will take nothing', () => {
    expect(asked(word(english, 'crescent'))).toEqual(['Borne in number', 'Sown']);
  });

  test('tells each tongue its own rule about counting the pieces', () => {
    // The one thing the two disagree on, so the one note the page writes twice.
    expect(word(french, 'fascé').note).toMatch(/left unwritten/);
    expect(word(english, 'barry').note).toMatch(/blazoned all the same/);
    expect(word(french, 'fascé').note).not.toBe(word(english, 'barry').note);
  });

  test('tells them the same where they agree, no number being understood', () => {
    expect(word(french, 'émanché').note).toBe(word(english, 'pily').note);
    expect(word(english, 'pily').note).toMatch(/No number understood/);
  });

  test('cuts a varied field into some other number of pieces', () => {
    expect(blazoned(word(english, 'barry'), 'Cut otherwise')).toEqual([
      'Barry of four argent and gules.',
      'Barry of ten argent and gules.',
    ]);
  });

  test('sorts a word alphabetically whatever its accents', () => {
    const words = french.map((entry) => folded(entry.word));
    expect(words).toEqual([...words].sort((one, another) => one.localeCompare(another)));
  });
});

describe('a word written one way only', () => {
  test('answers to that way and no other', () => {
    expect(word(english, 'vairy').spellings).toEqual(['vairy']);
    expect(word(french, 'sautoir').spellings).toEqual(['sautoir']);
  });
});

describe('a spelling that names two things', () => {
  test.each(TONGUES)('%s names the rank after it exactly where one is shared', (language) => {
    // No spelling of either tongue names two things today. What is tested is the
    // rule rather than the case: where one did — a croix that is a charge as
    // well as a band — both would say which they are, and neither would take the
    // plain address the word has always answered to.
    const entries = vocabularyIn(language);
    for (const entry of entries) {
      const shared =
        entries.filter((other) => anchorOf(other.word) === anchorOf(entry.word)).length > 1;
      expect(entry.qualified, entry.word).toBe(shared);
      expect(entry.anchor).toBe(shared ? anchorOf(entry.word, entry.rank) : anchorOf(entry.word));
    }
  });
});
