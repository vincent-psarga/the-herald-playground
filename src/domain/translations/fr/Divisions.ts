import { DivisionType, FieldType } from '../../models/Field';
import { blasonArmoiries } from '../Sources';
import { Translation } from '../Translation';
import { FrenchWord } from './FrenchWord';

// Each partition is named after the line that divides the field — save the last
// two, which are named after what their lines leave: écartelé is "quartered",
// not "crossed", and French has no word here for either cut itself. So the two
// share a name, and the one that crosses corner to corner says which it is by
// adding words to it.
export const FrenchDivisionType: Translation<DivisionType, FrenchWord> = {
  [FieldType.pale]: new FrenchWord('parti', {
    value:
      'The field cut straight down the middle, along the line a pal would occupy. The first tincture named takes the half at dexter, the viewer’s left.',
    sources: [blasonArmoiries('Parti')],
  }),
  [FieldType.fess]: new FrenchWord('coupé', {
    value:
      'The field cut straight across, along the line of a fasce. The first tincture named takes the chief, the upper half.',
    sources: [blasonArmoiries('Coupé', 'coupee')],
  }),
  [FieldType.bend]: new FrenchWord('tranché', {
    value:
      'Cut from dexter chief to sinister base — from the top left, as you look at it — along the line of the bande.',
    sources: [blasonArmoiries('Tranché')],
  }),
  [FieldType.bendSinister]: new FrenchWord('taillé', {
    value:
      'Cut from sinister chief to dexter base — from the top right, as you look at it — along the line of the barre. Sinister means the bearer’s left, never yours.',
    sources: [blasonArmoiries('Taillé', 'taille2')],
  }),
  // Only two tinctures are read of either cut. The blazons that write a coat to
  // each quartier ask for a field this model cannot hold.
  [FieldType.cross]: new FrenchWord('écartelé', {
    value:
      'The field cut by a parti and a coupé at once, into four quarters. The first tincture takes the one at dexter chief and the one opposite. Cut by a tranché and a taillé instead, it is écartelé en sautoir.',
    sources: [blasonArmoiries('Écartelé')],
  }),
  // Three words and one name. The parser offers every prefix of a name that
  // spells a term, so "écartelé" alone stays the cut in croix and the longer
  // phrase is taken only where the rest of the blazon follows it.
  [FieldType.saltire]: new FrenchWord('écartelé en sautoir', {
    value:
      'The field cut by a tranché and a taillé at once, into four triangles meeting at the centre. The first tincture takes the triangle in chief and the one in pointe, the second those at dextre and at senestre.',
    sources: [blasonArmoiries('Écartelé')],
  }),
};
