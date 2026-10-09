import { BorneType } from '../models/Blazon';
import { Languages } from '../models/Languages';
import { Modifier } from '../models/Modifier';
import { Source } from '../models/Source';
import { TINCTURES, Tincture } from '../models/Tinctures';

/** One way a word is written, and how that writing counts more than one of it. */
export interface Spelling {
  readonly value: string;
  /** The spelling as more than one: "fleurs-de-lys" for "fleur-de-lys". */
  readonly plural: string;
}

/** What an alternate spelling needs said about it, where the default is wrong. */
export interface Wording {
  readonly plural?: string;
}

/**
 * The other ways the same word is written, each under the spelling itself.
 *
 * A spelling that differs from the canonical one in nothing but a hyphen or a
 * letter is not another word — "fleur-de-lys" is the lily, spelled as half the
 * armorials spell it — so it is declared on the word rather than beside it. All
 * of them are read; one of them is written; and a reader who looks the word up
 * is shown the lot under the one heading.
 *
 * A spelling that is genuinely another word stays a word of its own. Vairy is
 * English and vairé is the French participle English borrowed, and telling a
 * reader they are the same spelling would be telling them something false.
 */
export type AlternateWording = Readonly<Record<string, Wording>>;

/** Everything a word may be told about itself beyond how it is spelled. */
export interface WordOptions {
  readonly plural?: string;
  readonly alternateWording?: AlternateWording;
  readonly allowedTinctures?: readonly Tincture[];
  readonly defaultTincture?: Tincture;
  /** What this word alone is said of, for a word that qualifies rather than names. */
  readonly saidOf?: readonly BorneType[];
  /** What the word already says was done to the charge, for a name that says it. */
  readonly defaultModifier?: Modifier;
}

/**
 * What a word means, and who says so.
 *
 * The gloss is this library's own sentences and the sources are not: a reader
 * who wants the authority rather than the summary follows them, and a claim made
 * here that no source carries is a claim this library invented.
 */
export interface Gloss {
  readonly value: string;
  readonly sources: readonly Source[];
}

/** A gloss, under the tongue its sentences are written in. */
export interface Description<Lang extends Languages> extends Gloss {
  readonly lang: Lang;
}

/** A word with nothing of its own to say, which is a word with no sources either. */
const UNGLOSSED: Description<Languages.en> = { lang: Languages.en, value: '', sources: [] };

/**
 * One word of a language's heraldic vocabulary, with what the grammar needs to
 * put it in a sentence and what a reader needs to know what it means.
 *
 * A term is spelled by a word rather than by a bare string because agreement is
 * a property of the word itself: whether it pluralises regularly, and, in the
 * languages that ask, its gender and its elision. Naming those on the word keeps
 * the grammar from holding lists of exceptions it would have to be told about
 * every time the vocabulary grows.
 *
 * What the word means is kept here for the same reason. A term may be spelled
 * several ways and the spellings need not mean the same thing — a besant is gold
 * and a tourteau is not — so a gloss written against the term would have to
 * hedge about which of its words it was describing. Written against the word, it
 * describes the word, and a word added to the vocabulary arrives with its
 * meaning rather than waiting for a documentation page to catch up.
 *
 * A word may be written more than one way without being more than one word. The
 * spellings that differ in nothing but a hyphen or a letter are carried here, so
 * that the vocabulary holds one entry where heraldry has one word and the parser
 * still answers to every spelling of it.
 *
 * A word may also carry what it is said of, which is the same question asked of
 * a word that qualifies instead of naming. A tongue may hold two words for the
 * one thing and give each its own — French voids the star with évidé and
 * everything else with vidé — and which is which is no more the term's business
 * than the difference between a besant and a tourteau is. It is asked of a band
 * as readily as of a charge, both being things a blazon may say something of.
 *
 * A word may also carry what was done to the figure. Heraldry gives some of the
 * modified charges a name of their own — a lozenge voided is a mascle and a
 * lozenge pierced is a rustre — and such a name says the modifier by being
 * written, exactly as a besant says gold by being written. It is the same charge
 * and the same drawing either way, so it is a word of the term and not a term of
 * its own: the model holds one lozenge, voided or not.
 *
 * A word may also carry the tincture, which is the roundel's doing. Heraldry
 * names that charge after the coin, the disc or the cake it is the picture of,
 * and each of those names is a tincture as well as a shape: a bezant is gold
 * because a bezant is a gold coin, and calling one azure says nothing. So the
 * word declares which tinctures it will take and which one it means when the
 * blazon names none — both being properties of the word rather than of the term
 * behind it, since "besant" and "tourteau" are one charge and disagree about
 * exactly this.
 */
export class Word {
  /**
   * What the word means, under each tongue it has been glossed in.
   *
   * English alone for now, on both vocabulary pages: what a French word means is
   * told to whoever is learning French heraldry, and telling them in French
   * would be answering a question they did not ask. The tongue is named all the
   * same, so that a French gloss written later stands beside this one rather
   * than replacing it.
   */
  public readonly descriptions: { readonly en: Description<Languages.en> };

  /** The word as more than one: "fasces" for "fasce". */
  public readonly plural: string;

  /** Every spelling this word answers to, its own first and the one it is written in. */
  public readonly spellings: readonly Spelling[];

  /**
   * The tinctures the word may be borne in. Every one of them, for the words
   * that are a shape and nothing more; a word that names a tincture of its own
   * takes that one alone unless it says otherwise.
   */
  public readonly allowedTinctures: readonly Tincture[];

  /** The tincture the word is understood to be when the blazon names none. */
  public readonly defaultTincture?: Tincture;

  /**
   * What this word alone is said of, where the armorials keep it for some of the
   * things a field bears and not for others.
   *
   * Left unsaid by every word that is said of whatever will take it, which is
   * every word that names something and most of the words that qualify one: the
   * list is a claim on particular terms and not a licence, so a word making no
   * claim is the general one and is written wherever no other word has claimed
   * what it is said of. Every word is read of everything either way — this
   * settles which comes back, and never what may be said.
   */
  public readonly saidOf?: readonly BorneType[];

  /**
   * What the word already says was done to the charge, where the word says it.
   *
   * Left unsaid by every word that names the figure and nothing more, which is
   * most of them: a lozenge is a lozenge whatever has been done to it, and what
   * was done is written after it. A mascle is a lozenge voided and says so by
   * being the word it is, so a blazon writing the modifier after it would be
   * saying the same thing twice — which is read and not written, as a besant
   * borne or is.
   */
  public readonly defaultModifier?: Modifier;

  /**
   * What the word means, in as many sentences as it takes, and who says so.
   *
   * Left out where there is nothing of the word's own to say: a number is not a
   * heraldic term, and glossing "trois" would be glossing French. Everything
   * else carries both halves — a gloss nobody stands behind is this library's
   * opinion about heraldry, which is not a thing it is entitled to have.
   */
  constructor(
    public readonly value: string,
    description?: Gloss,
    options?: WordOptions
  ) {
    this.descriptions = {
      en: description === undefined ? UNGLOSSED : { lang: Languages.en, ...description },
    };
    this.plural = options?.plural ?? `${value}s`;
    this.spellings = [
      { value, plural: this.plural },
      ...Object.entries(options?.alternateWording ?? {}).map(([spelling, wording]) => ({
        value: spelling,
        plural: wording.plural ?? `${spelling}s`,
      })),
    ];
    this.defaultTincture = options?.defaultTincture;
    this.saidOf = options?.saidOf;
    this.defaultModifier = options?.defaultModifier;
    this.allowedTinctures =
      options?.allowedTinctures ??
      (this.defaultTincture === undefined ? TINCTURES : [this.defaultTincture]);
  }

  /** Whether the word may be borne in a tincture. */
  accepts(tincture: Tincture): boolean {
    return this.allowedTinctures.includes(tincture);
  }

  /** Whether the word claims a band or a charge as one of its own. */
  claims(type: BorneType): boolean {
    return this.saidOf?.includes(type) ?? false;
  }

  /**
   * Whether the word is the one that means exactly this much: a modifier, or
   * none at all.
   *
   * Asked when a blazon is written rather than read, and answered strictly both
   * ways — a mascle is not the word for a plain lozenge, and a lozenge is not
   * the word for a voided one where a word for that exists.
   */
  means(modifier: Modifier | undefined): boolean {
    return this.defaultModifier === modifier;
  }

  /**
   * Whether a blazon may write a modifier after the word.
   *
   * Anything the charge itself will take, for a word that says nothing about it;
   * and for a word that already says one, that one alone. "A mascle voided" says
   * the voiding twice and is understood; "a mascle pierced" says two different
   * things and is refused, exactly as "a besant argent" is.
   */
  takes(modifier: Modifier): boolean {
    return this.defaultModifier === undefined || this.defaultModifier === modifier;
  }
}
