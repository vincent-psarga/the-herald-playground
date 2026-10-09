import { Parser, alt, apply, kleft, kright, seq, tok } from 'typescript-parsec';
import { FrenchDivisionType } from '../../domain/translations/fr/Divisions';
import { FrenchFurType } from '../../domain/translations/fr/Furs';
import { FrenchVariationType, PIECES } from '../../domain/translations/fr/Variations';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { FrenchStrewings, SOWN } from '../../domain/translations/fr/Strewings';
import { strewnTerms } from '../../domain/translations/Strewings';
import { FrenchOrdinaryType } from '../../domain/translations/fr/Ordinaries';
import { FrenchWord } from '../../domain/translations/fr/FrenchWord';
import { BlazonParseError } from '../../domain/errors/parsing/BlazonParseError';
import { WrongOrdinaryArticle } from '../../domain/errors/parsing/WrongOrdinaryArticle';
import { WrongTinctureArticle } from '../../domain/errors/parsing/WrongTinctureArticle';
import { FrenchAttributes } from '../../domain/translations/fr/Attributes';
import { FrenchModifiers } from '../../domain/translations/fr/Modifiers';
import { FrenchNumbers } from '../../domain/translations/fr/Numbers';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { Translation, asSeveral, wordsOf, writtenAs } from '../../domain/translations/Translation';
import { TokenKind } from '../lexer/Lexer';
import { BlazonGrammar } from '../parser/BlazonGrammar';
import { anyKeyword, guard, keyword, optional, spelledTerm, term } from '../parser/Combinators';
import { asOrdinary, asDivision, asTincture } from '../parser/Failures';
import { NOT_IN_NUMBER, alone, bearings, qualifiable, several } from '../parser/Borne';
import { QualifierForm, qualifying } from '../parser/Qualifiers';
import { number } from '../parser/Numbers';
import { BARE, strewing } from '../parser/Treatment';
import { varied } from '../parser/Variations';
import {
  AND,
  AU,
  A_L,
  A_LA,
  Agreement,
  BEFORE_SEVERAL,
  PLAIN,
  agreementsOf,
  bearing,
  everyBearing,
  expectedArticle,
  sownIn,
  withArticle,
} from './FrenchGrammar';

// A tincture may be named bare ("or") or introduced by an article ("d'or"), so
// the article is part of the grammar rather than part of the vocabulary.
const ARTICLE = alt(tok(TokenKind.Elision), tok(TokenKind.Article));

const ARTICLED_TINCTURE = apply(
  seq(optional(ARTICLE), spelledTerm(FrenchTinctures, asTincture)),
  ([article, match]) => ({ ...match, article: article?.kind })
);

// The article agrees with the word it introduces, not with the term behind it,
// so the check is made against the spelling the writer actually used.
const TINCTURE = apply(
  guard(
    ARTICLED_TINCTURE,
    ({ word, article }) => article === undefined || article === expectedArticle(word),
    ({ word }, position) => new WrongTinctureArticle(word.value, withArticle(word), position)
  ),
  ({ term }) => term
);

// A band and a charge are borne by the same phrase and are read from one
// vocabulary: "à la fasce" and "à la billette" differ in nothing a grammar can
// see.
const BEARINGS = bearings(FrenchOrdinaryType, FrenchChargeType);

/**
 * Something borne, introduced by one known article.
 *
 * The article agrees with the name in gender, as a tincture's agrees in elision,
 * so what was written is rebuilt and looked for among the phrases the name
 * accepts. Reading each article in its own branch keeps the check on the name
 * itself, which is where the mistake is and where it should be reported — and
 * the complaint names the one phrase the word is written back out in, whatever
 * others it would have answered to.
 */
const borneAs = (article: Parser<TokenKind, unknown>, written: (word: FrenchWord) => string) =>
  kright(
    article,
    guard(
      spelledTerm(BEARINGS, asOrdinary),
      ({ word }) => everyBearing(word).includes(written(word)),
      ({ word }, position) => new WrongOrdinaryArticle(word.value, bearing(word), position)
    )
  );

/**
 * Every writing of every word of one vocabulary that qualifies a charge, and
 * which of them a phrase agreeing so many ways will take.
 *
 * All four writings of a word are held, the ones that agree and the ones that do
 * not, because a blazon that wrote the wrong one wrote this vocabulary's word
 * all the same: "au losange évidée" is a mistake to be named, not a word to be
 * passed over. The first agreement given is the one a refusal asks for.
 *
 * The modifiers and the attributes are two vocabularies and one reading: both
 * are participles, both stand after the charge, and both agree with it in gender
 * and in number — "à la billette vidée", "à l'anneau chatonné".
 */
function agreeingForms<T extends string>(
  terms: Translation<T, FrenchWord>,
  accepted: readonly Agreement[]
): ReadonlyMap<string, QualifierForm<T, FrenchWord>> {
  const forms = new Map<string, QualifierForm<T, FrenchWord>>();
  for (const term of Object.keys(terms) as T[]) {
    for (const word of wordsOf(terms, term)) {
      const agreed = new Set(
        accepted.map(({ feminine, several }) => word.agreeing(feminine, several).toLowerCase())
      );
      const expected = word.agreeing(accepted[0].feminine, accepted[0].several);
      for (const feminine of [false, true]) {
        for (const several of [false, true]) {
          const written = word.agreeing(feminine, several).toLowerCase();
          const agrees = agreed.has(written);
          if (agrees || !forms.has(written)) {
            forms.set(written, { term, word, agrees, expected });
          }
        }
      }
    }
  }
  return forms;
}

/**
 * The reading one vocabulary is given, under each shape of phrase that asks for
 * it.
 *
 * Built once per shape rather than once per blazon: which writings agree is
 * settled by the article and the number, and neither depends on what was written
 * after them. Each vocabulary keeps its own, the two holding different words.
 */
function agreeingWith<T extends string>(terms: Translation<T, FrenchWord>) {
  const known = new Map<string, ReadonlyMap<string, QualifierForm<T, FrenchWord>>>();
  return (accepted: readonly Agreement[]) => {
    const shape = accepted.map(({ feminine, several }) => `${feminine}/${several}`).join(' ');
    const forms = known.get(shape) ?? agreeingForms(terms, accepted);
    known.set(shape, forms);
    return qualifying(forms);
  };
}

const modifierAgreeing = agreeingWith(FrenchModifiers);
const attributeAgreeing = agreeingWith(FrenchAttributes);

// What the two gendered articles say of whatever follows the charge. The article
// is the blazon's own word for the gender, so a blazon that has chosen one is
// held to it: "au tourteau de gueules évidé", and never "évidée".
const MASCULINE = modifierAgreeing([{ feminine: false, several: false }]);
const FEMININE = modifierAgreeing([{ feminine: true, several: false }]);
const MASCULINE_PART = attributeAgreeing([{ feminine: false, several: false }]);
const FEMININE_PART = attributeAgreeing([{ feminine: true, several: false }]);

// Where the phrase said nothing about gender — the article elided, or the count
// having taken the article's place — the word's own gender governs, and a word
// written under either gender is agreed with either way.
const asTheWordStands = (several: boolean) => (word: FrenchWord) =>
  modifierAgreeing(agreementsOf(word, several));

const partAsTheWordStands = (several: boolean) => (word: FrenchWord) =>
  attributeAgreeing(agreementsOf(word, several));

// Nothing borne is ever named bare: the article is what says the field bears it
// rather than is divided by it. Three articles, the third being the two others
// elided before a vowel — "à l'annelet", which says nothing about gender and is
// therefore accepted for either.
const ONE = alt(
  qualifiable(
    alone(borneAs(A_LA, (word) => `à la ${word.value}`)),
    () => FEMININE,
    () => FEMININE_PART
  ),
  qualifiable(
    alone(borneAs(AU, (word) => `au ${word.value}`)),
    () => MASCULINE,
    () => MASCULINE_PART
  ),
  qualifiable(
    alone(borneAs(A_L, (word) => `à l'${word.value}`)),
    asTheWordStands(false),
    partAsTheWordStands(false)
  )
);

// Several of one, named in the plural after the count: "à trois chevrons", "à
// trois billettes". No gender is agreed with here, so unlike the singular there
// is but one shape of the phrase to read — and what is said of the charge after
// it agrees with the word rather than with anything the phrase supplied.
const SEVERAL_BORNE = qualifiable(
  kright(BEFORE_SEVERAL, several(BEARINGS, FrenchNumbers, asOrdinary, NOT_IN_NUMBER)),
  asTheWordStands(true),
  partAsTheWordStands(true)
);

const BORNE = alt(ONE, SEVERAL_BORNE);

// French counts the pieces of a varied field after naming the tinctures it
// alternates — "bandé de gueules et d'argent de six pièces" — and an armorial
// writes "en six pièces" as readily as "de", so both are read. The article is
// the same "de" a tincture is introduced by, and is told apart by the number
// that has to follow it.
const IN_PIECES = alt(tok(TokenKind.Article), keyword('en'));

const HOW_MANY_PIECES = kleft(kright(IN_PIECES, number(FrenchNumbers)), keyword(PIECES));

// "D'azur billeté d'or": the field's own word for the strewing, which stands
// bare between the two tinctures and agrees with nothing.
const NAMED_STREWING = spelledTerm(strewnTerms(FrenchStrewings), asOrdinary);

// "D'azur semé de billettes d'or": the figure itself, named in the plural under
// the same "de" a tincture is introduced by, which elides before it as readily.
const SOWN_CHARGE = kright(
  anyKeyword(writtenAs(SOWN)),
  apply(
    guard(
      seq(ARTICLE, spelledTerm(FrenchChargeType, asOrdinary, asSeveral)),
      ([article, { word }]) => article.kind === expectedArticle(word),
      ([, { word }], position) =>
        new BlazonParseError(`Wrong elision: expected "${sownIn(word)}"`, position)
    ),
    ([, match]) => match
  )
);

// A field of one tincture may be called bare, or be said to have been sown, and
// is never both: what "plain" promises is that nothing was sown on it either.
const TREATMENT = alt(
  apply(PLAIN, () => BARE),
  strewing(alt(NAMED_STREWING, SOWN_CHARGE), TINCTURE)
);

export const FrenchBlazonGrammar: BlazonGrammar = {
  tincture: TINCTURE,
  division: term(FrenchDivisionType, asDivision),
  // A furred field is named bare too, and nothing is counted after it: "Vairé
  // d'or et de gueules" is the whole of the phrase.
  fur: term(FrenchFurType, asDivision),
  // A varied field is named bare: nothing introduces it, the name being the
  // first word of the blazon, and nothing agrees with it either.
  variation: varied(FrenchVariationType, asDivision),
  pieces: HOW_MANY_PIECES,
  treatment: TREATMENT,
  borne: BORNE,
  and: AND,
};
