import { alt, apply, kright, list_sc, seq } from 'typescript-parsec';
import { EnglishDivisionType } from '../../domain/translations/en/Divisions';
import { EnglishFurType } from '../../domain/translations/en/Furs';
import { EnglishVariationType, OF } from '../../domain/translations/en/Variations';
import { EnglishAttributes } from '../../domain/translations/en/Attributes';
import { EnglishChargeType } from '../../domain/translations/en/Charges';
import { EnglishModifiers } from '../../domain/translations/en/Modifiers';
import { EnglishOverAll } from '../../domain/translations/en/OverAll';
import { EnglishStrewings, OF as SOWN_OF, SOWN } from '../../domain/translations/en/Strewings';
import { strewnTerms } from '../../domain/translations/Strewings';
import { asSeveral, writtenAs } from '../../domain/translations/Translation';
import { EnglishOrdinaryType } from '../../domain/translations/en/Ordinaries';
import { EnglishNumbers } from '../../domain/translations/en/Numbers';
import { EnglishRanks } from '../../domain/translations/en/Ranks';
import { EnglishTinctures } from '../../domain/translations/en/Tinctures';
import { BlazonGrammar } from '../parser/BlazonGrammar';
import { anyKeyword, anyPhrase, keyword, optional, spelledTerm, term } from '../parser/Combinators';
import { asOrdinary, asDivision, asRank, asTincture } from '../parser/Failures';
import { NOT_IN_NUMBER, alone, bearings, laidOver, qualifiable, several } from '../parser/Borne';
import { anyWriting, qualifying } from '../parser/Qualifiers';
import { number } from '../parser/Numbers';
import { strewing } from '../parser/Treatment';
import { VariedField, varied } from '../parser/Variations';
import { ARTICLE, AND } from './EnglishGrammar';

// English counts the pieces of a varied field between its name and the tinctures
// it alternates — "barry of six argent and gules" — and says nothing after them.
// The count may be left out, and then the field has however many pieces the term
// is understood to have.
const VARIATION = apply(
  seq(
    varied(EnglishVariationType, asDivision),
    optional(kright(keyword(OF), number(EnglishNumbers)))
  ),
  ([named, counted]): VariedField => (counted === undefined ? named : { ...named, pieces: counted })
);

// A band and a charge are borne by the same phrase and are read from one
// vocabulary: "a fess" and "a billet" differ in nothing a grammar can see.
const BEARINGS = bearings(EnglishOrdinaryType, EnglishChargeType);

// "Azure billetty or": the field's own word for the strewing, standing bare
// between the two tinctures.
const NAMED_STREWING = spelledTerm(strewnTerms(EnglishStrewings), asOrdinary);

// "Azure semy of billets or": the figure itself, named in the plural, a field
// being sown with more of it than anybody counts.
const SOWN_CHARGE = kright(
  seq(anyKeyword(writtenAs(...SOWN)), keyword(SOWN_OF)),
  spelledTerm(EnglishChargeType, asOrdinary, asSeveral)
);

// English says nothing of a field being bare: it names the tincture and stops,
// where French writes "plain". Parker's "plain" is a band drawn with a straight
// line rather than a field with nothing on it, and borrowing it here would be
// inventing heraldry rather than reading it.
const TREATMENT = strewing(alt(NAMED_STREWING, SOWN_CHARGE), term(EnglishTinctures, asTincture));

// What a blazon may say of a charge after its tincture. English agrees with
// nothing: "voided" stands after one lozenge and after three of them unchanged,
// so the one rule serves every phrase and no writing of the word is ever wrong
// where another would have been right.
const MODIFIER = qualifying(anyWriting(EnglishModifiers));

// What a blazon may say was painted apart from the rest of the charge, which
// English agrees with no better than it agrees a modifier: "a gem-ring or stoned
// azure", "three gem-rings argent stoned azure".
const ATTRIBUTE = qualifying(anyWriting(EnglishAttributes));

/**
 * The ranks one phrase of a divided field names: "first", "second and third",
 * and the same ranks in figures.
 *
 * Nothing introduces them — English sets the ordinal bare where French writes
 * "au" — so the list of what a part bears is told that a rank may stand where it
 * is looking for a charge, and a bare ordinal is a rank rather than anything
 * borne.
 */
const RANK = list_sc(number(EnglishRanks, asRank), AND);

// "Over all a bend gules": English says it before what it is said of, where
// French says its own word after the tincture. Standing in front of the article
// and in front of the count alike, it is read once for either shape of phrase.
const OVER_ALL = anyPhrase(writtenAs(EnglishOverAll));

export const EnglishBlazonGrammar: BlazonGrammar = {
  tincture: term(EnglishTinctures, asTincture),
  division: term(EnglishDivisionType, asDivision),
  // Nothing stands between a furred field and its tinctures, and nothing is
  // counted: "Vairy or and gules" is the whole of the phrase.
  fur: term(EnglishFurType, asDivision),
  variation: VARIATION,
  treatment: TREATMENT,
  // The article is dropped once read: it says that something borne follows,
  // nothing more, and whether it was written "a" or "an" is the next word's
  // business rather than the grammar's. Where several are borne the count says
  // it instead, and English puts nothing before the count: "Or three chevrons
  // gules".
  borne: laidOver(
    OVER_ALL,
    alt(
      qualifiable(
        alone(kright(ARTICLE, spelledTerm(BEARINGS, asOrdinary))),
        () => MODIFIER,
        () => ATTRIBUTE
      ),
      qualifiable(
        several(BEARINGS, EnglishNumbers, asOrdinary, NOT_IN_NUMBER),
        () => MODIFIER,
        () => ATTRIBUTE
      )
    )
  ),
  and: AND,
  rank: RANK,
};
