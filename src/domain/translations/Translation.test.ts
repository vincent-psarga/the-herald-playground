import { describe, expect, test } from 'vitest';
import { ChargeType } from '../models/Charge';
import { Modifier } from '../models/Modifier';
import { DIVISIONS } from '../models/Field';
import { COLOURS, Colours, Furs, METALS, Metals, PELTS, TINCTURES } from '../models/Tinctures';
import { OrdinaryType } from '../models/Ordinary';
import {
  Translation,
  asSeveral,
  bySpelling,
  nameOf,
  spellingsOf,
  wordIn,
  wordOf,
  wordSaidOf,
  wordsOf,
  writtenAs,
} from './Translation';
import { Word } from './Word';
import { EnglishChargeType } from './en/Charges';
import { EnglishModifiers } from './en/Modifiers';
import { FrenchChargeType } from './fr/Charges';
import { FrenchModifiers } from './fr/Modifiers';
import { FrenchDivisionType } from './fr/Divisions';
import { FrenchOrdinaryType } from './fr/Ordinaries';
import { FrenchTinctures } from './fr/Tinctures';

// A partition not yet in the vocabulary, kept here to exercise synonyms without
// committing the domain to a term it does not otherwise need.
enum Partition {
  mantled = 'Partition.mantled',
  mantledReversed = 'Partition.mantledReversed',
}

const FrenchPartition: Translation<Partition> = {
  [Partition.mantled]: new Word('mantelé'),
  [Partition.mantledReversed]: [
    new Word('mantelé-versé'),
    new Word('mantelé-renversé'),
    new Word('mantelé versé'),
  ],
};

describe('spellingsOf', () => {
  test('wraps a term written only one way', () => {
    expect(spellingsOf(FrenchPartition, Partition.mantled)).toEqual(['mantelé']);
  });

  test('returns every synonym, the canonical one first', () => {
    expect(spellingsOf(FrenchPartition, Partition.mantledReversed)).toEqual([
      'mantelé-versé',
      'mantelé-renversé',
      'mantelé versé',
    ]);
  });
});

describe('nameOf', () => {
  test('writes a term with its canonical spelling', () => {
    expect(nameOf(FrenchPartition, Partition.mantledReversed)).toBe('mantelé-versé');
  });
});

describe('wordOf', () => {
  test('hands back the word itself, not only how it is spelled', () => {
    expect(wordOf(FrenchPartition, Partition.mantledReversed)).toBe(
      (FrenchPartition[Partition.mantledReversed] as Word[])[0]
    );
  });
});

describe('wordIn', () => {
  test('writes a term with its canonical word where no word names a tincture', () => {
    expect(wordIn(FrenchPartition, Partition.mantledReversed, Metals.or).value).toBe(
      'mantelé-versé'
    );
  });

  test('prefers the word that already means the tincture asked for', () => {
    expect(wordIn(EnglishChargeType, ChargeType.roundel, Metals.or).value).toBe('besant');
    expect(wordIn(EnglishChargeType, ChargeType.roundel, Metals.argent).value).toBe('plate');
    expect(wordIn(EnglishChargeType, ChargeType.roundel, Colours.gules).value).toBe('torteau');
  });

  test('falls back on the first word the tincture is allowed under', () => {
    expect(wordIn(EnglishChargeType, ChargeType.roundel, Furs.ermine).value).toBe('roundel');
    expect(wordIn(FrenchChargeType, ChargeType.roundel, Metals.argent).value).toBe('besant');
    expect(wordIn(FrenchChargeType, ChargeType.roundel, Colours.azure).value).toBe('tourteau');
  });

  test('has a word for every tincture a roundel may be borne in, in either tongue', () => {
    for (const tincture of TINCTURES) {
      expect(wordIn(EnglishChargeType, ChargeType.roundel, tincture).accepts(tincture)).toBe(true);
      expect(wordIn(FrenchChargeType, ChargeType.roundel, tincture).accepts(tincture)).toBe(true);
    }
  });
});

describe('wordSaidOf', () => {
  test('prefers the word that claims the charge asked about', () => {
    expect(wordSaidOf(FrenchModifiers, Modifier.voided, ChargeType.mullet).value).toBe('évidé');
  });

  test('falls back on the word that claims nothing, which is the general one', () => {
    for (const type of [ChargeType.lozenge, ChargeType.roundel, ChargeType.billet]) {
      expect(wordSaidOf(FrenchModifiers, Modifier.voided, type).value).toBe('vidé');
    }
  });

  test('hands back the one word where a tongue holds one', () => {
    for (const type of Object.values(ChargeType)) {
      expect(wordSaidOf(EnglishModifiers, Modifier.voided, type).value).toBe('voided');
    }
  });

  test('is a claim on charges and never a licence, every word being read of every charge', () => {
    // The star's word claims the star and the general word claims nothing, so
    // neither refuses anything: what this settles is which comes back.
    const [general, starred] = wordsOf(FrenchModifiers, Modifier.voided);
    expect(general.saidOf).toBeUndefined();
    expect(starred.saidOf).toEqual([ChargeType.mullet]);
    expect(starred.claims(ChargeType.mullet)).toBe(true);
    expect(starred.claims(ChargeType.lozenge)).toBe(false);
    expect(general.claims(ChargeType.mullet)).toBe(false);
  });
});

describe('the lozenge, which has a name for what was done to it', () => {
  test('writes the plain name where nothing was done', () => {
    expect(wordIn(EnglishChargeType, ChargeType.lozenge, Colours.gules).value).toBe('lozenge');
    expect(wordIn(FrenchChargeType, ChargeType.lozenge, Colours.gules).value).toBe('losange');
  });

  test('writes the name that means the modifier where one was done', () => {
    expect(
      wordIn(EnglishChargeType, ChargeType.lozenge, Colours.gules, Modifier.voided).value
    ).toBe('mascle');
    expect(
      wordIn(EnglishChargeType, ChargeType.lozenge, Colours.gules, Modifier.pierced).value
    ).toBe('rustre');
    expect(wordIn(FrenchChargeType, ChargeType.lozenge, Colours.gules, Modifier.voided).value).toBe(
      'macle'
    );
    expect(wordIn(FrenchChargeType, ChargeType.mullet, Colours.gules, Modifier.pierced).value).toBe(
      'molette'
    );
  });

  test('falls back on the plain name where the tongue named no such figure', () => {
    // English named no pierced star and neither tongue named a pierced billet,
    // so the question is dropped and the modifier written after the plain name.
    expect(
      wordIn(EnglishChargeType, ChargeType.mullet, Colours.gules, Modifier.pierced).value
    ).toBe('mullet');
    expect(wordIn(FrenchChargeType, ChargeType.billet, Colours.gules, Modifier.pierced).value).toBe(
      'billette'
    );
  });

  test('says what it means and what it will take, strictly both ways', () => {
    const [plain, mascle, rustre] = wordsOf(EnglishChargeType, ChargeType.lozenge);
    expect(plain.means(undefined)).toBe(true);
    expect(plain.means(Modifier.voided)).toBe(false);
    expect(mascle.means(Modifier.voided)).toBe(true);
    expect(mascle.means(undefined)).toBe(false);
    // A word that says nothing takes anything the charge takes; one that says a
    // modifier takes that one and refuses the rest.
    expect(plain.takes(Modifier.pierced)).toBe(true);
    expect(mascle.takes(Modifier.voided)).toBe(true);
    expect(mascle.takes(Modifier.pierced)).toBe(false);
    expect(rustre.takes(Modifier.voided)).toBe(false);
  });
});

describe('the roundel, which every tincture has a word of its own for', () => {
  test('gives French a word for the metals and another for the colours', () => {
    expect(spellingsOf(FrenchChargeType, ChargeType.roundel)).toEqual(['besant', 'tourteau']);
    const [besant, tourteau] = wordsOf(FrenchChargeType, ChargeType.roundel);
    expect(besant.allowedTinctures).toEqual([...METALS, ...PELTS]);
    expect(tourteau.allowedTinctures).toEqual([...COLOURS, ...PELTS]);
  });

  test('gives English a word apiece, and the plain roundel for what is left', () => {
    expect(spellingsOf(EnglishChargeType, ChargeType.roundel)).toEqual([
      'roundel',
      'besant',
      'bezant',
      'plate',
      'torteau',
      'hurt',
      'pellet',
      'pomme',
    ]);
  });

  test('leaves no shade of English without a name of its own', () => {
    const named = wordsOf(EnglishChargeType, ChargeType.roundel).map(
      ({ defaultTincture }) => defaultTincture
    );
    for (const shade of [...METALS, ...COLOURS]) {
      expect(named).toContain(shade);
    }
  });

  test('names them all in the plural without collision', () => {
    const plurals = wordsOf(EnglishChargeType, ChargeType.roundel).map(({ plural }) => plural);
    expect(plurals).toContain('torteaux');
    expect(new Set(plurals).size).toBe(plurals.length);
  });
});

describe('index', () => {
  const partitions = bySpelling(FrenchPartition);

  test('reads a term back from any of its synonyms', () => {
    for (const spelling of spellingsOf(FrenchPartition, Partition.mantledReversed)) {
      expect(partitions.get(spelling)?.term).toBe(Partition.mantledReversed);
    }
  });

  test('folds spellings to lower case', () => {
    const partition: Translation<Partition.mantled> = { [Partition.mantled]: new Word('Mantelé') };
    expect(bySpelling(partition).get('mantelé')?.term).toBe(Partition.mantled);
  });

  test('leads to the word a spelling was written with', () => {
    expect(partitions.get('mantelé')?.word).toBe(FrenchPartition[Partition.mantled]);
  });

  test('does not know a spelling no term claims', () => {
    expect(partitions.get('gironné')).toBeUndefined();
  });
});

describe('the French vocabulary', () => {
  test.each(TINCTURES)('reads %s back from its own name', (tincture) => {
    expect(bySpelling(FrenchTinctures).get(nameOf(FrenchTinctures, tincture))?.term).toBe(tincture);
  });

  test.each(DIVISIONS)('reads %s back from its own name', (division) => {
    expect(bySpelling(FrenchDivisionType).get(nameOf(FrenchDivisionType, division))?.term).toBe(
      division
    );
  });

  test('names every term exactly once', () => {
    const spellings = TINCTURES.flatMap((tincture) => spellingsOf(FrenchTinctures, tincture));
    expect(new Set(spellings).size).toBe(spellings.length);
  });
});

describe('a vocabulary looked up in the plural', () => {
  test('reads a term back from the spelling several of it take', () => {
    const ordinaries = bySpelling(FrenchOrdinaryType, asSeveral);
    expect(ordinaries.get('chevrons')?.term).toBe(OrdinaryType.chevron);
    expect(ordinaries.get('fasces')?.term).toBe(OrdinaryType.fess);
  });

  test('holds no singular, a blazon that counts naming what it counts in the plural', () => {
    expect(bySpelling(FrenchOrdinaryType, asSeveral).get('chevron')).toBeUndefined();
  });

  test('keeps a word whose plural is its singular', () => {
    expect(bySpelling(FrenchOrdinaryType, asSeveral).get('croix')?.term).toBe(OrdinaryType.cross);
  });

  test('names every ordinary in the plural exactly once', () => {
    const plurals = bySpelling(FrenchOrdinaryType, asSeveral);
    expect(plurals.size).toBe(Object.values(OrdinaryType).length);
  });
});

describe('a vocabulary whose words are written more than one way', () => {
  const Lilies: Translation<Partition> = {
    [Partition.mantled]: new Word('mantelé'),
    [Partition.mantledReversed]: new Word('fleur-de-lis', undefined, {
      plural: 'fleurs-de-lis',
      alternateWording: { 'fleur de lys': { plural: 'fleurs de lys' } },
    }),
  };

  test('counts the spellings a term accepts rather than the words', () => {
    expect(spellingsOf(Lilies, Partition.mantledReversed)).toEqual([
      'fleur-de-lis',
      'fleur de lys',
    ]);
  });

  test('reads the term back from an alternate as readily as from the canonical', () => {
    const index = bySpelling(Lilies);
    for (const spelling of ['fleur-de-lis', 'fleur de lys']) {
      expect(index.get(spelling)?.term).toBe(Partition.mantledReversed);
    }
  });

  test('leads from an alternate to the word itself, which is what agrees', () => {
    // The grammar agrees with the word, and the word is the same word however it
    // was written: there is no second one to disagree.
    expect(bySpelling(Lilies).get('fleur de lys')?.word).toBe(
      bySpelling(Lilies).get('fleur-de-lis')?.word
    );
  });

  test('counts an alternate in its own plural', () => {
    const several = bySpelling(Lilies, asSeveral);
    expect(several.get('fleurs de lys')?.term).toBe(Partition.mantledReversed);
    expect(several.get('fleurs-de-lis')?.term).toBe(Partition.mantledReversed);
  });

  test('names every way the vocabulary writes anything', () => {
    expect(writtenAs(...wordsOf(Lilies, Partition.mantledReversed))).toEqual([
      'fleur-de-lis',
      'fleur de lys',
    ]);
  });
});
