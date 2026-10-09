import { parker } from '../Sources';
import { Word } from '../Word';

/**
 * The word English cuts a band into compons by: "a bordure compony gules and
 * argent".
 *
 * Parker files it under Gobony — "Gobony, goboné, gobonated, and compony" — and
 * calls gobony "a corruption of some word (possibly even of compony)". The two
 * are the one word to every source, so both are read; compony is the form the
 * modern blazons write, and is what comes back — see the conventions page. The
 * French participle is read too, English blazons borrowing it as "componée".
 *
 * Invariable, as every English adjective is: "a bordure compony", "two bends
 * compony".
 */
export const EnglishCompony = new Word(
  'compony',
  {
    value:
      'Said in place of a tincture, of a band cut across into squares of two tinctures laid alternately: “a bordure compony gules and argent”. The first tincture named takes the first square, at the band’s upper end. Gobony is an older form.',
    sources: [parker('Gobony')],
  },
  {
    plural: 'compony',
    alternateWording: { gobony: { plural: 'gobony' }, componée: { plural: 'componée' } },
  }
);
