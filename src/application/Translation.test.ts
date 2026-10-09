import { describe, expect, test } from 'vitest';
import { TINCTURES } from '../domain/models/Tinctures';
import { DIVISIONS, FieldType, painted } from '../domain/models/Field';
import { EnglishBlazonParser } from './parser/EnglishBlazonParser';
import { FrenchBlazonParser } from './parser/FrenchBlazonParser';
import { EnglishBlazonWriter } from './writer/EnglishBlazonWriter';
import { FrenchBlazonWriter } from './writer/FrenchBlazonWriter';

const french = { parser: new FrenchBlazonParser(), writer: new FrenchBlazonWriter() };
const english = { parser: new EnglishBlazonParser(), writer: new EnglishBlazonWriter() };

// Translating is reading in one language and writing in another. Nothing between
// the two services knows that more than one language exists.
const intoEnglish = (text: string) => english.writer.write(french.parser.parse(text));
const intoFrench = (text: string) => french.writer.write(english.parser.parse(text));

describe('translating a blazon', () => {
  test.each([
    ["D'azur.", 'Azure.'],
    ['De gueules.', 'Gules.'],
    ['De sinople.', 'Vert.'],
    ["Parti d'azur et d'or.", 'Per pale azure and or.'],
    ["Coupé de gueules et d'argent.", 'Per fess gules and argent.'],
    ['Taillé de sable et de sinople.', 'Per bend sinister sable and vert.'],
    ["D'hermine.", 'Ermine.'],
    ['De vair.', 'Vair.'],
    ["Parti d'hermine et de vair.", 'Per pale ermine and vair.'],
    ["Vairé d'or et de gueules.", 'Vairy or and gules.'],
    ["Vairé d'argent et de sable à la fasce d'or.", 'Vairy argent and sable a fess or.'],
    ["Coupé de gueules et d'hermine.", 'Per fess gules and ermine.'],
    ["D'azur à la fasce d'or.", 'Azure a fess or.'],
    ["De gueules à trois chevrons d'or.", 'Gules three chevrons or.'],
    ["D'argent à deux bandes de gueules.", 'Argent two bends gules.'],
    ["D'argent à la jumelle de gueules.", 'Argent a bar gemel gules.'],
    ["D'argent à trois jumelles de gueules.", 'Argent three bars gemel gules.'],
  ])('%s becomes %s', (inFrench, inEnglish) => {
    expect(intoEnglish(inFrench)).toBe(inEnglish);
    expect(intoFrench(inEnglish)).toBe(inFrench);
  });

  test.each(TINCTURES)('a field of %s translates both ways', (tincture) => {
    expect(
      intoFrench(intoEnglish(french.writer.write({ field: { type: FieldType.plain, tincture } })))
    ).toBe(french.writer.write({ field: { type: FieldType.plain, tincture } }));
  });

  test.each(DIVISIONS)('a field divided per %s translates both ways', (type) => {
    const blazon = { field: { type, parts: painted(type, TINCTURES[0], TINCTURES[3]) } };
    expect(french.parser.parse(intoFrench(english.writer.write(blazon)))).toEqual(blazon);
  });
});
