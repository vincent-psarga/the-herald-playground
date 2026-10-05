import { ChargeType } from '../../models/Charge';
import { Modifier } from '../../models/Modifier';
import { blasonArmoiries } from '../Sources';
import { Translation } from '../Translation';
import { FrenchWord } from './FrenchWord';

// A modifier is a participle rather than a noun, so it has no gender of its own
// and takes the one of whatever it is said of: "au tourteau vidé", "à la
// billette vidée", "à trois billettes vidées". All four writings are the one
// word, and which of them a blazon must use is decided by the phrase it stands
// in rather than by anything here.
//
// French says the voiding with two participles and not one. Évider and vider are
// two verbs, so évidé and vidé are two words rather than two spellings of one,
// and each stands on its own in the vocabulary — as vairy and vairé do, and for
// the same reason: telling a reader they were the one word would be telling them
// something false.
//
// Which figure takes which is a distinction the armorials keep, and it is kept
// here: évidé claims the star, which is what the dictionaries say it of, and
// vidé claims nothing and is therefore what every other charge is written with.
// Either word is still read of any charge that will take the modifier at all — a
// blazon that voids a losange with évidé is understood, and answered with vidée.
//
// Percé is not a third word for the same thing, whatever the dictionaries'
// filing suggests. It is the word for the other modifier, and the other drawing:
// see Modifier.pierced.
//
// The modified lines are a word apiece and not one word several times over.
// Parker glosses indented "(fr. denché)" and glosses the dancetty with it too,
// which would leave French a word short; the dictionary French writes by keeps
// them apart by the size of the tooth. Denché is said of the pieces "dont les bords
// sont formés en dents de scie", and "on se sert du mot dentelé quand les dents
// de la bordure sont de petites dimensions" — so dentelé is the small-toothed
// line and denché the great-toothed one, which is the pair English spells
// indented and dancetty. Vivré is the third: the same great teeth brought to a
// right angle at the point, which Parker files under the French word itself
// because English has none. Engrêlé is the fourth and is no saw at all, the
// dictionary parting it from the dentelé by the hollow between the teeth.
//
// None of the four is a spelling of another. A blazon that writes one and is
// answered with another has been told its band is drawn a way it is not, which
// is the one thing a vocabulary must not do.
//
// Engrêlé is written with its circumflex and read with nothing else. The
// dictionaries' own headings carry it, and the accent-less ENGRELÉ of a
// capitalised entry — or Parker's "fr. engrélé" — is typography rather than a
// second spelling. It could not be offered as one in any case: a French modifier
// is read through its four agreements and not through its spellings, so a
// spelling declared beside it would be a word the parser never answers to.
export const FrenchModifiers: Translation<Modifier, FrenchWord> = {
  [Modifier.voided]: [
    new FrenchWord('vidé', {
      value:
        'The middle taken out, so that the field shows through where the charge was and what is left of it is the outline. What shows through is the field itself and not a tincture of its own, which is what makes a losange vidée a losange still rather than two charges one upon the other. The heraldic dictionaries say it of the croix and the sautoir — "d’or, à la croix vidée de gueules" — and it is the word this vocabulary writes of every charge the star has not taken.',
      sources: [blasonArmoiries('Vidé')],
    }),
    new FrenchWord(
      'évidé',
      {
        value:
          'The middle taken out: the same thing vidé says, from the other of the two verbs French has for saying it. The dictionaries keep it for the star and the triangle — "évidés, pour les triangles et étoiles", and "d’azur, à l’étoile évidée d’argent" — so it is the word written of the étoile, and vidé is written of the rest.',
        sources: [blasonArmoiries('Évidé')],
      },
      { saidOf: [ChargeType.mullet] }
    ),
  ],
  [Modifier.pierced]: [
    new FrenchWord('percé', {
      value:
        'A round hole punched through the middle, the rest of the charge left as it was. The dictionaries file it under Vidé — "on se sert du terme percées, pour les billettes" — but a billette percée is not a billette vidée: voiding leaves the outline of the charge and nothing else, and piercing leaves the charge with a hole in it. Two figures, so two words, and this one is not a way of writing the other.',
      sources: [blasonArmoiries('Percé')],
    }),
  ],
  [Modifier.indented]: [
    new FrenchWord('dentelé', {
      value:
        'The edges of the band cut into small teeth instead of run straight: the word the dictionary keeps for the saw-toothed line "quand les dents de la bordure sont de petites dimensions". The same teeth cut large are denché, and a fasce dentelée is the band English blazons a fess indented.',
      // Under Denché, which is where the dictionary's Dentelé sends a reader and
      // where the two are told apart.
      sources: [blasonArmoiries('Denché', 'denche')],
    }),
  ],
  [Modifier.dancetty]: [
    new FrenchWord('denché', {
      value:
        'The edges of the band cut into great teeth: "se dit de toutes les pièces dont les bords sont formés en dents de scie", the dictionary adding that the small-toothed line is the one called dentelé. Duhoux d’Argicourt writes it of the chef, the fasce, the bande, the croix, the sautoir, the chevron and the bordure, "dont les bords ont des petites dents pointues, les intervalles étant creusés obliquement, à la manière des scies". A bande denchée is the band English blazons a bend dancetty. The armorials say which way the teeth point — "à trois fasces denchées d’or, les pointes en bas" — and this reads no such thing yet: the teeth are cut in both edges alike.',
      sources: [blasonArmoiries('Denché', 'denche')],
    }),
  ],
  [Modifier.vivre]: [
    new FrenchWord('vivré', {
      value:
        'The edges of the band cut into great teeth whose points are right angles: "se dit des pièces paraissant sinueuses et ondées, mais avec des entailles faites d’angles saillants et rentrants". Duhoux d’Argicourt says it "du pal, de la fasce, du chevron, de la bande et de quelques autres pièces à sinuosités angulaires", and parts those from the vivre — a narrow angular fillet borne as a charge — "en ce qu’elles ont leur largeur ordinaire, qui est de deux parties des sept de la largeur de l’écu". That fillet is another word about another thing and is not read here. English has no word of its own for the line and borrows this one.',
      // The dictionary files the participle under its feminine, as it files
      // bandé under bandee: the entry is Vivré and the page is vivree, the bare
      // vivre being the fillet instead.
      sources: [blasonArmoiries('Vivré', 'vivree')],
    }),
  ],
  [Modifier.engrailed]: [
    new FrenchWord('engrêlé', {
      value:
        'The edges of the band cut into small round hollows, the points between them standing out into the field: "se dit du pal, de la croix, de la bande, du sautoir, etc., dont les deux côtés sont bordés de petites dents dont les intervalles sont creux et arrondis". What parts it from the saw-toothed line is the hollow itself — "c’est en cela que l’Engrêlé diffère du dentelé dont les intervalles sont à angles droits, comme des dents de scie" — and the dictionary adds, of the one band with a single free edge, that "le chef ne peut être Engrêlé que dans sa ligne basse". A bande engrêlée is the band English blazons a bend engrailed: "Montigny (de) : Échiqueté d’argent et d’azur, à la bande engrêlée de gueules, brochante sur le tout."',
      sources: [blasonArmoiries('Engrêlé')],
    }),
  ],
};
