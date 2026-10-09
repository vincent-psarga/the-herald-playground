import { describe, expect, test } from 'vitest';
import { FieldType } from '../../src/domain/models/Field';
import { Languages } from '../../src/domain/models/Languages';
import { OrdinaryType } from '../../src/domain/models/Ordinary';
import { Colours, Metals } from '../../src/domain/models/Tinctures';
import { Branch, structureIn } from './Structure';
import { readBlazon } from './Reading';

/** The structure of a blazon typed as a reader would type it. */
const of = (text: string, language: Languages): readonly Branch[] => {
  const read = readBlazon(text, language);
  if (!('blazon' in read)) {
    throw new Error(`"${text}" was refused: ${read.refused}`);
  }
  return structureIn(language, read.blazon);
};

/** The shape alone, as indented lines, which is what the page draws. */
const drawn = (branches: readonly Branch[], depth = 0): string =>
  branches
    .map(
      (branch) =>
        `${'  '.repeat(depth)}${branch.word}${branch.count === undefined ? '' : ` ×${branch.count}`}\n` +
        drawn(branch.children, depth + 1)
    )
    .join('');

const ranks = (branches: readonly Branch[]): readonly string[] =>
  branches.flatMap((branch) => [branch.rank, ...ranks(branch.children)]);

describe('structureIn', () => {
  test('sets the tinctures of a divided field under the partition that took them', () => {
    expect(drawn(of("Parti d'azur et d'argent, à la bande de gueules", Languages.fr))).toBe(
      ['parti', '  azur', '  argent', 'bande', '  gueules', ''].join('\n')
    );
  });

  test('says the same of the same blazon written in the other tongue', () => {
    expect(drawn(of('Per pale azure and argent, a bend gules', Languages.en))).toBe(
      ['per pale', '  azure', '  argent', 'bend', '  gules', ''].join('\n')
    );
  });

  test('files every word under the vocabulary it belongs to', () => {
    expect(ranks(of("Parti d'azur et d'argent, à la bande de gueules", Languages.fr))).toEqual([
      'division',
      'tincture',
      'tincture',
      'ordinary',
      'tincture',
    ]);
  });

  test('makes a plain field its tincture, there being no word for the cut that was not made', () => {
    expect(drawn(of('Argent a fess gules', Languages.en))).toBe(
      ['argent', 'fess', '  gules', ''].join('\n')
    );
  });

  test('counts what is borne more than once, and says nothing of a single one', () => {
    expect(drawn(of('Argent three hurts', Languages.en))).toBe(
      ['argent', 'hurt ×3', ''].join('\n')
    );
    expect(drawn(of('Argent a hurt', Languages.en))).toBe(['argent', 'hurt', ''].join('\n'));
  });

  test('leaves the tincture off a word that has already said it', () => {
    // A hurt is azure by being a hurt, and the writer writes no tincture after
    // it: a branch the blazon does not carry is one the reader would look for in
    // the sentence and not find.
    expect(drawn(of('Argent a hurt', Languages.en))).not.toContain('azure');
    expect(drawn(of('Argent a roundel gules', Languages.en))).toBe(
      ['argent', 'torteau', ''].join('\n')
    );
  });

  test('sets what was done to a charge between the charge and its tincture', () => {
    expect(drawn(of('Argent a billet voided gules', Languages.en))).toBe(
      ['argent', 'billet', '  voided', '  gules', ''].join('\n')
    );
    expect(ranks(of('Argent a billet voided gules', Languages.en))).toEqual([
      'tincture',
      'charge',
      'modifier',
      'tincture',
    ]);
  });

  test('says nothing of a modifier the name has already said', () => {
    // A mascle is a lozenge voided, and the word says so by being written — so
    // a lozenge blazoned voided comes back under the name, with nothing under it
    // repeating what the name means.
    expect(drawn(of('Argent a lozenge voided gules', Languages.en))).toBe(
      ['argent', 'mascle', '  gules', ''].join('\n')
    );
  });

  test('sets what a field was sown with under the field, under the word for the sowing', () => {
    expect(drawn(of('Argent billetty azure', Languages.en))).toBe(
      ['argent', '  billetty', '    azure', ''].join('\n')
    );
    expect(ranks(of('Argent billetty azure', Languages.en))).toEqual([
      'tincture',
      'strewing',
      'tincture',
    ]);
  });

  test('says the sowing in as many branches where the tongue says it in as many words', () => {
    // Neither tongue names a field sown with lilies, so the blazon says semé and
    // then the figure — and the tree has to say it the same way. The figure on
    // its own would make the shape a charge borne on the field makes, and a
    // reader could not tell a field sown with lilies from one bearing a lily.
    expect(drawn(of("De gueules semé de fleurs de lys d'or", Languages.fr))).toBe(
      ['gueules', '  semé', '    fleur de lys', '      or', ''].join('\n')
    );
    expect(ranks(of("De gueules semé de fleurs de lys d'or", Languages.fr))).toEqual([
      'tincture',
      'field',
      'charge',
      'tincture',
    ]);
  });

  test('says it the same way in the other tongue, for a figure that tongue has no word for', () => {
    // English names the sown lily — semy-de-lis — and names no sown annulet, so
    // the lily takes one branch and the annulet takes two.
    expect(drawn(of('Gules semy-de-lis or', Languages.en))).toBe(
      ['gules', '  semy-de-lis', '    or', ''].join('\n')
    );
    expect(drawn(of('Gules semy of annulets or', Languages.en))).toBe(
      ['gules', '  semy', '    annulet', '      or', ''].join('\n')
    );
  });

  test('names a varied field by its own word, over the two it alternates', () => {
    expect(drawn(of("Bandé d'or et de gueules", Languages.fr))).toBe(
      ['bandé', '  or', '  gueules', ''].join('\n')
    );
    expect(ranks(of("Bandé d'or et de gueules", Languages.fr))).toEqual([
      'variation',
      'tincture',
      'tincture',
    ]);
  });

  test('names a furred field by its own word, over the two it is cut from', () => {
    expect(ranks(of('Vairy or and gules', Languages.en))).toEqual([
      'furred field',
      'tincture',
      'tincture',
    ]);
  });

  test('sets the word for laying over all under what it was said of', () => {
    expect(drawn(of("D'argent à la fasce de gueules brochant", Languages.fr))).toBe(
      ['argent', 'fasce', '  brochant sur le tout', '  gueules', ''].join('\n')
    );
    expect(ranks(of('Argent over all a fess gules', Languages.en))).toEqual([
      'tincture',
      'ordinary',
      'over all',
      'tincture',
    ]);
  });

  test('draws no arms under it, the word saying nothing a single figure can show', () => {
    const laid = of('Argent over all a fess gules', Languages.en);
    expect(laid[1].children[0].word).toBe('over all');
    expect(laid[1].children[0].arms).toBeUndefined();
  });

  test('keeps what a field bears in the order it was laid on', () => {
    // The order says which covers which, so the structure must not sort it.
    expect(drawn(of('Or a bend sable, a bordure gules', Languages.en))).toBe(
      ['or', 'bend', '  sable', 'bordure', '  gules', ''].join('\n')
    );
  });
});

describe('the arms a word is shown by', () => {
  const seek = (branches: readonly Branch[], word: string): Branch | undefined => {
    for (const branch of branches) {
      const found = branch.word === word ? branch : seek(branch.children, word);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  };

  const found = (branches: readonly Branch[], word: string): Branch => {
    const branch = seek(branches, word);
    if (branch === undefined) {
      throw new Error(`No branch for "${word}"`);
    }
    return branch;
  };

  test('cuts them from this blazon and not from the vocabulary’s own showing of the word', () => {
    // The vocabulary demonstrates every term in gules and argent. Beside a
    // shield painted azure that would tell the reader the field was red, so the
    // arms come from the model the shield itself was drawn from.
    const read = of('Per pale azure and argent, a bend gules', Languages.en);
    expect(found(read, 'per pale').arms).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Colours.azure,
        secondTincture: Metals.argent,
      },
    });
  });

  test('lays a band on the field it is actually laid on', () => {
    const read = of('Per pale azure and argent, a bend gules', Languages.en);
    expect(found(read, 'bend').arms).toEqual({
      field: {
        type: FieldType.pale,
        firstTincture: Colours.azure,
        secondTincture: Metals.argent,
      },
      chargesOrOrdinaries: [{ type: OrdinaryType.bend, tincture: Colours.gules }],
    });
  });

  test('leaves the sowing off the field a band is shown on, a crowded mark being no mark', () => {
    const read = of('Argent billetty azure, a bordure sable', Languages.en);
    expect(found(read, 'bordure').arms).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [{ type: OrdinaryType.bordure, tincture: Colours.sable }],
    });
    // And the sowing keeps it, that being the whole of what the word says.
    expect(found(read, 'billetty').arms).toEqual({
      field: {
        type: FieldType.plain,
        tincture: Metals.argent,
        semy: { type: 'Charge.billet', tincture: Colours.azure },
      },
    });
  });

  test('shows a tincture as a field of it and nothing on it', () => {
    const read = of('Argent a fess gules', Languages.en);
    expect(found(read, 'gules').arms).toEqual({
      field: { type: FieldType.plain, tincture: Colours.gules },
    });
  });

  test('shows a modifier doing its work on the very charge it was said of', () => {
    // There is no picture of "voided" on its own, so what it does to that charge
    // is the whole of what can be drawn — borne once, the count being the
    // charge's own business and shown on the charge.
    const read = of('Argent three billets voided gules', Languages.en);
    expect(found(read, 'voided').arms).toEqual({
      field: { type: FieldType.plain, tincture: Metals.argent },
      chargesOrOrdinaries: [
        { type: 'Charge.billet', tincture: Colours.gules, modifier: 'Modifier.voided' },
      ],
    });
    expect(found(read, 'billet').arms?.chargesOrOrdinaries?.[0]).toMatchObject({ count: 3 });
  });
});
