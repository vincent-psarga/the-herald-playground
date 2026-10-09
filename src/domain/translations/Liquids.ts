import { ChargeType } from '../models/Charge';
import { Tincture } from '../models/Tinctures';
import { Translation } from './Translation';
import { Word } from './Word';

/**
 * What a language calls a tincture when it is the tincture of a drop.
 *
 * Heraldry names a drop after what it is a drop of rather than after its
 * colour: Parker has a field gutté "when argent, gutté d'eau ... when gules,
 * gutté de sang", and the same words stand after drops that are borne — "on a
 * lion rampant argent gouttes de sang". So a liquid is a tincture under another
 * name, and is said of the figure it is poured as and of nothing else: a bend de
 * sang is no bend at all.
 *
 * Which figures those are is declared on each word, with saidOf, rather than
 * here: the answer belongs to the word and not to the tongue's whole list.
 *
 * Not every tincture has one, and inventing the missing ones would be inventing
 * heraldry: a drop in a tincture with no liquid is named by its tincture. Being
 * keyed on Tincture all the same, a tincture added to the vocabulary breaks this
 * until it is said whether the tongue pours it.
 */
export type Liquids<W extends Word = Word> = Record<Tincture, W | W[] | undefined>;

/** Every word this tongue pours a tincture with, the canonical one first. */
function liquidWords<W extends Word>(liquids: Liquids<W>, tincture: Tincture): readonly W[] {
  const words = liquids[tincture];
  if (words === undefined) {
    return [];
  }
  return Array.isArray(words) ? words : [words];
}

/**
 * The liquids poured as this figure, as a translation of their own.
 *
 * Like the strewings, this is not exhaustive and is not meant to be: what it
 * holds is the tinctures the tongue names a liquid for, said of this figure,
 * which is exactly what a parser reading those words has to match against.
 */
export function pouredAs<W extends Word>(
  liquids: Liquids<W>,
  type: ChargeType
): Translation<Tincture, W> {
  return Object.fromEntries(
    (Object.keys(liquids) as Tincture[])
      .map((tincture) => [
        tincture,
        liquidWords(liquids, tincture).filter((word) => word.claims(type)),
      ])
      .filter(([, words]) => words.length !== 0)
  ) as Translation<Tincture, W>;
}

/**
 * The word a figure in this tincture is poured with, where the tongue has one
 * and says it of this figure.
 */
export function pouredIn<W extends Word>(
  liquids: Liquids<W>,
  type: ChargeType,
  tincture: Tincture
): W | undefined {
  return liquidWords(liquids, tincture).find((word) => word.claims(type));
}
