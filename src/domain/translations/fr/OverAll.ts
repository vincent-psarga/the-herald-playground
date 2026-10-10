import { blasonArmoiries } from '../Sources';
import { FrenchWord } from './FrenchWord';

/**
 * The word French says a band or a charge is laid over the rest by: "à trois
 * bandes de gueules brochant", "au chef d'azur, brochant sur le tout".
 *
 * It names no term and draws no figure — what it says is which of two things
 * already named is on top — so there is no vocabulary keyed on a term to hold
 * it, and it is kept here as the word French calls a bare field by is.
 *
 * The phrase and the participle alone are one word and not two. The armorials
 * write both, and Au blason des armoiries gives the shorter under the longer:
 * "Se dit des pièces posées sur le champ et sur d'autres meubles qu'elles
 * couvrent en partie; on les dit alors: Brochant sur le tout". So the phrase is
 * the spelling written back out and the participle is read as a spelling of it.
 *
 * It agrees with nothing. "Brochant sur le tout" is an invariable locution, and
 * the armorials write it unchanged after a plural — "à trois chevrons de
 * gueules, brochant sur le burelé" — where a participle that had become an
 * adjective would have taken an -s. So every writing is declared to be the word
 * itself, and no gender and no number is ever asked of it.
 *
 * What is not read: "brochant sur le coupé", "sur le burelé" and the rest, which
 * name the one thing covered instead of saying everything is. That is a second
 * reading — it has to say which of the things already blazoned it means — and
 * nothing here promises it.
 */
export const FrenchOverAll = new FrenchWord(
  'brochant sur le tout',
  {
    value:
      'Said of a band or a charge laid over everything else the field bears, wherever the blazon names it: d’argent semé de croissants de sable, à trois bandes de gueules brochant. What is named last is over the rest in any case, so the word earns its keep where what covers is named before what it covers. The dictionaries give it of "pièces posées sur le champ et sur d’autres meubles qu’elles couvrent en partie", and of "pièces qui passent sur d’autres, comme une fasce ou un chevron qui broche sur un lion". Invariable: it is written the same after one band and after three.',
    sources: [blasonArmoiries('Brochant')],
  },
  {
    plural: 'brochant sur le tout',
    feminine: 'brochant sur le tout',
    feminines: 'brochant sur le tout',
    alternateWording: {
      brochant: { plural: 'brochant' },
    },
  }
);
