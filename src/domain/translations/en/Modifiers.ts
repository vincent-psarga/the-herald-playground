import { Modifier } from '../../models/Modifier';
import { parker } from '../Sources';
import { Translation } from '../Translation';
import { Word } from '../Word';

// English says what was done to the charge in one word, standing after it and
// after its tincture, and agreeing with nothing: a lozenge voided and three
// lozenges voided are the same word twice. So the plural is declared to be the
// word itself rather than left to the "-s" a noun would take.
//
// One word apiece, and no word said of some figures and not of others: English
// voids and pierces whatever will take it, where French keeps a second word for
// the star. So no word here claims anything, and each is written wherever its
// term is.
//
// They do not all qualify the same thing. Voided and pierced are said of a
// charge and the three lines of a band, because what is done to a charge is done
// to its middle and what is done to a band is done to the line it is named
// after. Which is which is the model's to say, not this list's: every one of
// them stands after what it qualifies, and the words differ in nothing a grammar
// can see.
//
// One of the five is French. English cut the saw-toothed line in two and named
// both halves — indented and dancetty — but never named the third, where the
// point of the tooth is a right angle, so Parker files the French word as an
// entry of
// his English glossary and blazons English arms with it. A tongue with no word
// of its own borrows one, and the borrowing is written down here rather than
// mended: answering a bend vivré with "dancetty" would tell a reader the band is
// drawn to a point, which it is not.
export const EnglishModifiers: Translation<Modifier> = {
  [Modifier.voided]: new Word(
    'voided',
    {
      value:
        'The middle taken out, so that the field shows through where the charge was and what is left of it is the outline. What shows through is the field itself and not a tincture of its own, which is what makes a lozenge voided a lozenge still rather than two charges one upon the other.',
      sources: [parker('Voided')],
    },
    { plural: 'voided' }
  ),
  [Modifier.pierced]: new Word(
    'pierced',
    {
      value:
        'A round hole punched through the middle, the rest of the charge left as it was — which is what parts it from voided, where nothing is left but the outline. Parker asks the shape of the hole to be named where it is not round, "e.g. square-pierced, lozenge-pierced"; no blazon says so here, and the hole is round.',
      sources: [parker('Pierced')],
    },
    { plural: 'pierced' }
  ),
  [Modifier.indented]: new Word(
    'indented',
    {
      value:
        'The edges of the band cut into teeth instead of run straight — "notched after the manner of dancetty, but with smaller teeth", as Parker has it, who adds that it "is applied most frequently to the fesse, though the bend, the pale, and the chevron are sometimes thus treated". It is the smallest-toothed of the three lines, the dancetty being the same line drawn larger.',
      sources: [parker('Indented')],
    },
    { plural: 'indented' }
  ),
  [Modifier.dancetty]: new Word(
    'dancetty',
    {
      value:
        'The edges of the band cut into great teeth and few of them: "a zigzag line of partition, differing from indented only in the indentations, being larger in size, and consequently fewer in number". Parker draws three of them across a fess — "Or, a fesse dancetté sable — VAVASOUR, Yorkshire" — where the indented fess has half a dozen. The word is written dancetté as readily as dancetty, the armorials keeping the French accent on an English word.',
      // Parker's entry is headed "Dancetté, or dancetty"; the page anchors it
      // under the accent-less spelling, which is the entry this names.
      sources: [parker('Dancette')],
    },
    { plural: 'dancetty', alternateWording: { dancetté: { plural: 'dancetté' } } }
  ),
  [Modifier.vivre]: new Word(
    'vivré',
    {
      value:
        'The edges of the band cut into great teeth whose points are right angles. It is the one line English never named: Parker files it under the French word, "a French term applied to the fesse, bend, &c.", and glosses it "practically equivalent to dancetty, except that the indentations are more open, i.e. the lines forming them produce right angles, instead of the acute angles which are usually represented in the drawing of indented or dancetty". He adds that "when applied to the bend or chevron, the appearance of rectangular steps is produced" — the staircase being what a right-angled zigzag comes to on a band that runs at a slant, and not a second shape of tooth. So English blazons it with the French word, as it borrowed vairé.',
      // Anchored without its accent, as the glossary anchors every entry.
      sources: [parker('Vivre')],
    },
    { plural: 'vivré' }
  ),
};
