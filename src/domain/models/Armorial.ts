import { Languages } from './Languages';
import { Source } from './Source';

export type ArmorialEntry = {
  name: string;
  /**
   * The name, in the shape an address can carry it: lowercased, stripped of its
   * accents, every run of anything else a hyphen. It is the anchor the entry
   * answers to within its armorial's page, so it is unique within the armorial,
   * and two entries of one name are told apart by a number on the second.
   */
  slug: string;
  blazon: string;
  image: string;
  /** Where this one entry was copied from, where it was copied from its own page. */
  source?: Source;
};

export type Armorial = {
  name: string;
  slug: string;
  /** The tongue its blazons are written in, which is the grammar that reads them. */
  language: Languages;
  /** Where the roll was copied from, where one page holds the whole of it. */
  source?: Source;
  licence?: string;
  entries: ArmorialEntry[];
};
