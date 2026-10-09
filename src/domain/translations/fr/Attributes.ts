import { Attribute } from '../../models/Attributes';
import { blasonArmoiries } from '../Sources';
import { Translation } from '../Translation';
import { FrenchWord } from './FrenchWord';

// A participle, as a modifier is, so it has no gender of its own and takes the
// one of whatever it is said of: "à l'anneau chatonné", "à trois anneaux
// chatonnés". The part's own tincture follows it under the same "de" a charge's
// tincture is introduced by — "chatonné d'argent" — which is what parts an
// attribute from a modifier in the reading as well as in the model.
//
// One word, where the dictionaries write the stone itself as readily: "chatonné
// d'un rubis ou d'une autre pierre précieuse". A vocabulary of rubies and
// diamonds is a second list and is not read, so the tincture is named.
export const FrenchAttributes: Translation<Attribute, FrenchWord> = {
  [Attribute.stoned]: new FrenchWord('chatonné', {
    value:
      'Set with a stone. The chaton is the claw setting a ring holds its stone in, and the tincture named after the word is the stone’s.',
    sources: [blasonArmoiries('Bague')],
  }),
  [Attribute.armed]: new FrenchWord('armé', {
    value:
      'The griffes of a beast, painted apart from the rest of it. It is not onglé, which the dictionary keeps for the cloven-footed.',
    sources: [blasonArmoiries('Armé')],
  }),
  [Attribute.langued]: new FrenchWord('lampassé', {
    value:
      'The tongue of a four-footed beast, painted apart from the rest of it. A bird’s tongue is langué instead — "s’il s’agit d’un oiseau il est préférable de le dire langué".',
    sources: [blasonArmoiries('Lampassé')],
  }),
  [Attribute.crowned]: new FrenchWord('couronné', {
    value:
      'The crown a beast wears on its head, painted apart from the rest of it. A couronne à l’antique unless a blazon names another, and none can be named here.',
    sources: [blasonArmoiries('Lion'), blasonArmoiries('Couronne')],
  }),
};
