import { describe, expect, test } from 'vitest';
import { Languages } from '../../../src/domain/models/Languages';
import { definitionsOf } from './Definition';

const only = (spelling: string, language: Languages) => {
  const found = definitionsOf(spelling, language);
  expect(found).toHaveLength(1);
  return found[0];
};

describe('definitionsOf', () => {
  test('answers with a definition in each tongue the spelling is a word of', () => {
    expect(definitionsOf('besant').map(({ language }) => language)).toEqual([
      Languages.fr,
      Languages.en,
    ]);
  });

  test('keeps to the tongue it is asked about', () => {
    expect(definitionsOf('besant', Languages.en).map(({ language }) => language)).toEqual([
      Languages.en,
    ]);
  });

  test('says what the word is, what it means and who says so', () => {
    const besant = only('besant', Languages.en);
    expect(besant.rank).toBe('charge');
    expect(besant.description).not.toBe('');
    expect(besant.sources.length).toBeGreaterThan(0);
    expect(besant.url).toBe(
      'https://vincent-psarga.github.io/the-herald-playground/doc/vocabulary/en#besant'
    );
  });

  test('gives every spelling of the word, with its plural', () => {
    expect(only('besant', Languages.en).spellings).toContainEqual({
      singular: 'bezant',
      plural: 'bezants',
    });
  });

  test('names the other words of the same term, and the words of the other tongue', () => {
    const besant = only('besant', Languages.en);
    expect(besant.synonyms).toContain('roundel');
    expect(besant.translations).toContainEqual({ word: 'besant', language: Languages.fr });
  });

  test('says which tinctures a word is held to, in its own tongue', () => {
    expect(only('besant', Languages.en).tinctures).toEqual({ allowed: ['or'], understood: 'or' });
    expect(only('lozenge', Languages.en).tinctures).toBeUndefined();
  });

  test('says which charges a modifier is said of', () => {
    expect(only('voided', Languages.en).appliesTo).toContain('lozenge');
  });

  test('says which modifiers a charge takes, and which one its name already says', () => {
    expect(only('lozenge', Languages.en).takes).toContain('voided');
    expect(only('mascle', Languages.en).implies).toBe('voided');
  });

  test('carries a blazon that uses the word', () => {
    expect(only('besant', Languages.en).example.blazon).toMatch(/besant/);
  });

  test('reads a spelling whatever its case and accents', () => {
    expect(definitionsOf('VAIRE', Languages.fr).map(({ word }) => word)).toEqual(['vairé']);
  });

  test('prefers the exact spelling over one that only folds to it', () => {
    expect(definitionsOf('vairy', Languages.en).map(({ word }) => word)).toEqual(['vairy']);
  });

  test('answers nothing for a word the library does not read', () => {
    expect(definitionsOf('platypus')).toEqual([]);
  });
});
