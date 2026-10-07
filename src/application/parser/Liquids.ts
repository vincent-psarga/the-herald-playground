import {
  ParseResult,
  Parser,
  ParserOutput,
  Token,
  alt,
  apply,
  betterError,
  combine,
  resultOrError,
  tok,
} from 'typescript-parsec';
import { WrongTinctureArticle } from '../../domain/errors/parsing/WrongTinctureArticle';
import { ChargeType, isChargeType } from '../../domain/models/Charge';
import { Tincture } from '../../domain/models/Tinctures';
import { Liquids, pouredAs } from '../../domain/translations/Liquids';
import { FrenchWord } from '../../domain/translations/fr/FrenchWord';
import { expectedArticle, withArticle } from '../french/FrenchGrammar';
import { TokenKind } from '../lexer/Lexer';
import { BorneType } from './Borne';
import { guard, spelledTerm } from './Combinators';
import { asTincture } from './Failures';

const ARTICLE = alt(tok(TokenKind.Elision), tok(TokenKind.Article));

/**
 * A liquid, which is a tincture under the name of what a drop is a drop of:
 * "de sang", "d'eau".
 *
 * Always under its article, in either tongue, the liquids being French words
 * even in an English blazon — "gutté de sang" and never "gutté sang". The
 * article agrees with the word as a French tincture's does, so "de eau" is
 * refused by name.
 */
function liquid(words: Liquids<FrenchWord>, type: ChargeType): Parser<TokenKind, Tincture> {
  const named = spelledTerm(pouredAs(words, type), asTincture);
  // The complaint is laid on the liquid rather than on its article, which is
  // where a tincture misread there would complain too: level with it, the
  // liquid's is the one kept, being the one that knows what was meant.
  return combine(ARTICLE, (article) =>
    apply(
      guard(
        named,
        ({ word }) => article.kind === expectedArticle(word),
        ({ word }, position) => new WrongTinctureArticle(word.value, withArticle(word), position)
      ),
      ({ term }) => term
    )
  );
}

/**
 * A tincture read both ways at once, and the complaint that survives when
 * neither reading works.
 *
 * Where the liquid's article was read and what followed was wrong — "de eau",
 * "de vin" — the liquid's complaint is the one that knows what was meant. Where
 * no article stood at all, nothing was poured and the tincture's complaint is
 * kept: "gutté sang" names an unknown tincture rather than a missing article.
 */
function eitherNamed(
  liquid: Parser<TokenKind, Tincture>,
  tincture: Parser<TokenKind, Tincture>
): Parser<TokenKind, Tincture> {
  return {
    parse(token: Token<TokenKind> | undefined): ParserOutput<TokenKind, Tincture> {
      const asLiquid = liquid.parse(token);
      const asTincture = tincture.parse(token);
      const candidates: ParseResult<TokenKind, Tincture>[] = [
        ...(asLiquid.successful ? asLiquid.candidates : []),
        ...(asTincture.successful ? asTincture.candidates : []),
      ];
      if (asLiquid.successful || asTincture.successful) {
        return resultOrError(candidates, betterError(asLiquid.error, asTincture.error), true);
      }
      const poured =
        token !== undefined &&
        (asLiquid.error.pos === undefined || asLiquid.error.pos.index > token.pos.index);
      return resultOrError(
        [],
        poured ? betterError(asLiquid.error, asTincture.error) : asTincture.error,
        false
      );
    },
  };
}

/**
 * The tincture something borne or sown is named in: its tincture, or the liquid
 * the tongue pours it as, where the tongue pours it at all.
 *
 * Asked of the figure, because a liquid is said of the drop and of nothing else:
 * a bend de sang names nothing, and is refused as an unknown tincture would be.
 * Built once per figure, a blazon asking the same question of every drop it
 * bears.
 */
export function namedIn(
  tincture: Parser<TokenKind, Tincture>,
  liquids: Liquids<FrenchWord>
): (type: BorneType) => Parser<TokenKind, Tincture> {
  const built = new Map<BorneType, Parser<TokenKind, Tincture>>();
  return (type) => {
    const known = built.get(type);
    if (known !== undefined) {
      return known;
    }
    const poured =
      isChargeType(type) && Object.keys(pouredAs(liquids, type)).length !== 0
        ? eitherNamed(liquid(liquids, type), tincture)
        : tincture;
    built.set(type, poured);
    return poured;
  };
}
