import { Gloss, Word, WordOptions } from '../Word';

/** Everything a French word may be told about itself beyond how it is spelled. */
export interface FrenchWordOptions extends WordOptions {
  readonly isFeminine?: boolean;
  /** Whether the other gender is read too. */
  readonly acceptsBothGender?: boolean;
  /** How the word is written agreeing with a feminine noun, where the "-e" is wrong. */
  readonly feminine?: string;
  /** The same, several times over, where the "-es" is wrong. */
  readonly feminines?: string;
}

/**
 * A French word, which agrees with what introduces it in gender, as a bare
 * word does not.
 *
 * Gender decides the article the field bears it under — "à la fasce" but "au
 * chevron" — and cannot be derived, so it is declared where the default is
 * wrong. Elision is not kept here: whether "de" contracts before a word is asked
 * of the French words English borrows as well, so every Word carries it.
 *
 * A word may also have no settled gender at all. Heraldic French kept the
 * feminine "la losange" where the language at large went masculine, and
 * armorials are written both ways, so such a word declares the gender it is
 * written back out in and is read under either.
 *
 * A word that qualifies rather than names has no gender of its own and takes
 * the one it is put beside, so it carries the four ways it may be written out:
 * évidé, évidés, évidée, évidées. A word that names something answers those too
 * and is never asked, exactly as a tincture carries a plural nobody writes.
 */
export class FrenchWord extends Word {
  /** Whether the word is feminine: "la fasce" against "le chevron". */
  public readonly isFeminine: boolean;

  /**
   * Whether the other gender is read too. The word is still written back out in
   * the gender it declares; this only widens what is accepted.
   */
  public readonly acceptsBothGender: boolean;

  /** The word agreeing with a feminine noun: "évidée" for "évidé". */
  public readonly feminine: string;

  /** The same, several times over: "évidées". */
  public readonly feminines: string;

  constructor(value: string, description?: Gloss, options?: FrenchWordOptions) {
    super(value, description, options);
    this.isFeminine = options?.isFeminine ?? false;
    this.acceptsBothGender = options?.acceptsBothGender ?? false;
    this.feminine = options?.feminine ?? `${value}e`;
    this.feminines = options?.feminines ?? `${this.feminine}s`;
  }

  /**
   * The word written to agree with what it qualifies, in gender and in number:
   * "au tourteau évidé", "à la billette évidée", "à trois billettes évidées".
   *
   * Which gender it is asked for is the phrase's business rather than the
   * word's own — a modifier has no gender, it borrows one — so both are handed
   * in rather than read off anything here.
   */
  agreeing(feminine: boolean, several: boolean): string {
    if (feminine) {
      return several ? this.feminines : this.feminine;
    }
    return several ? this.plural : this.value;
  }
}
