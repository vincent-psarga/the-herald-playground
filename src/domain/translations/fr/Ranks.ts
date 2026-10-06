import { RankWords } from '../Ranks';
import { blasonArmoiries } from '../Sources';
import { FrenchWord } from './FrenchWord';

// French names the rank of a part with an ordinal, and the armorials write it in
// words — "au premier", "au second" — or in figures, "au 1". Only the words are
// named here: a rank in figures is read by the rule that reads any number in
// figures, and a Roman numeral is a word like any other and is spelled out as
// one.
//
// Which part is which is Au blason des armoiries' to say, under Écartelé: "Le
// premier quartier de l'Écartelé est en chef, à dextre ; le second est à
// senestre". It is said there of four parts rather than two, that being where a
// dictionary has occasion to say it at all, and the order is the order.
//
// Under Quartier it is said of both quarterings at once, and the two disagree
// about where the ranks run. Of the squares: "Les Quartiers du haut sont
// blasonnés les premiers, ensuite les QUARTIERS au-dessous, puis on finit par
// ceux qui se trouvent en bas, en commençant toujours à dextre". Of the
// triangles: "alors le premier Quartier est en haut, le second à dextre, le
// troisième à senestre et le quatrième en pointe". So a rank names no place of
// its own — it names the nth part, and which place that is belongs to the line
// that cut the field.
//
// "Second" and "deuxième" say the one thing and both are read; the shorter is
// written back. Nothing here agrees with anything: the ordinal stands before a
// whole coat rather than before a noun, and the armorials write it masculine.
//
// The Roman numerals are read and are attested nowhere this vocabulary cites:
// neither Écartelé nor Parti writes one, and no armorial here does either. What
// they are glossed by is what the rank means, which is the same rank however it
// is spelled.
export const FrenchRanks: RankWords<FrenchWord> = {
  1: [
    new FrenchWord('premier', {
      value:
        'The first part of a divided field: the one in chief, or at dexter. Whatever is blazoned after it is laid in that part. Written "au premier", and in figures: "au 1".',
      sources: [blasonArmoiries('Écartelé'), blasonArmoiries('Parti')],
    }),
    new FrenchWord('I', {
      value:
        'The first part of a divided field, its rank written as a Roman numeral. It says what "au premier" says.',
      sources: [blasonArmoiries('Écartelé')],
    }),
  ],
  2: [
    new FrenchWord('second', {
      value:
        'The second part of a divided field, named after the first: at senestre where the parts stand square, at dextre where four stand on their points. Written "au second", and in figures: "au 2".',
      sources: [blasonArmoiries('Écartelé'), blasonArmoiries('Parti')],
    }),
    new FrenchWord('deuxième', {
      value:
        'The second part of a divided field, said the longer way. It says what "au second" says.',
      sources: [blasonArmoiries('Écartelé')],
    }),
    new FrenchWord('II', {
      value:
        'The second part of a divided field, its rank written as a Roman numeral. It says what "au second" says.',
      sources: [blasonArmoiries('Écartelé')],
    }),
  ],
  // The third and the fourth, which only a field cut into four ever has. A field
  // cut in two is refused them by the count its own term declares, so nothing
  // here has to say that a parti has no third part.
  3: [
    new FrenchWord('troisième', {
      value:
        'The third part of a divided field, which only a quartered field has: at dexter in base where the quarters stand square, at senestre where they stand on their points. Written "au troisième", and in figures: "au 3".',
      sources: [blasonArmoiries('Quartier')],
    }),
    new FrenchWord('III', {
      value:
        'The third part of a divided field, its rank written as a Roman numeral. It says what "au troisième" says.',
      sources: [blasonArmoiries('Quartier')],
    }),
  ],
  4: [
    new FrenchWord('quatrième', {
      value:
        'The last part of a quartered field: at senestre in base where the quarters stand square, in pointe where they stand on their points. It stands corner to corner with the first. Written "au quatrième", and in figures: "au 4".',
      sources: [blasonArmoiries('Quartier')],
    }),
    new FrenchWord('IV', {
      value:
        'The last part of a quartered field, its rank written as a Roman numeral. It says what "au quatrième" says.',
      sources: [blasonArmoiries('Quartier')],
    }),
  ],
};
