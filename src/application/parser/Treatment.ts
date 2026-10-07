import { Parser, apply, combine } from 'typescript-parsec';
import { ChargeType } from '../../domain/models/Charge';
import { Semy } from '../../domain/models/Field';
import { Tincture } from '../../domain/models/Tinctures';
import { TermWord } from '../../domain/translations/Translation';
import { Word } from '../../domain/translations/Word';
import { TokenKind } from '../lexer/Lexer';
import { carried } from './Borne';

/**
 * What a blazon says of a field of one tincture beyond naming the tincture.
 *
 * Bare, which French writes "plain" and which the model cannot hold: a field is
 * plain by having nothing on it, so the word adds no fact but a promise the rest
 * of the blazon has to keep. Or sown with a charge, which the model does hold,
 * there being no other way to know.
 *
 * Both follow the tincture and neither is ever both — a field somebody sowed is
 * not bare, and a field called bare has nothing sown on it — so a language
 * offers whichever of the two it has as one rule.
 */
export type Treatment = Bare | { readonly semy: Semy };

type Bare = { readonly bare: true };

/** A field the blazon called plain, which is a claim about the rest of it. */
export const BARE: Treatment = { bare: true };

export function isBare(treatment: Treatment): treatment is Bare {
  return 'bare' in treatment;
}

/**
 * A charge a field is sown with, however the language came to name it: by the
 * field's own word for the strewing — "billeté", "billetty" — or by sowing the
 * charge in as many words.
 *
 * Which word was written is what the tincture answers to, exactly as it is for
 * something borne: a besanté is gold by being a besanté, and a bezanty is never
 * argent. So the name is read first and the tincture after it, and the word that
 * was written decides what it will take and what it means when nothing follows.
 *
 * The tincture is asked for by the figure sown, a tongue being free to name a
 * tincture otherwise for some figures than for others: a field sown with drops
 * may be gutté de sang, where one sown with billets is billetty gules.
 */
export function strewing<W extends Word>(
  named: Parser<TokenKind, TermWord<ChargeType, W>>,
  tincture: (type: ChargeType) => Parser<TokenKind, Tincture>
): Parser<TokenKind, Treatment> {
  return combine(named, ({ term, word }) =>
    apply(carried(tincture(term), word), (tincture): Treatment => ({
      semy: { type: term, tincture },
    }))
  );
}
