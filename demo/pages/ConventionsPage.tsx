import { ReactNode } from 'react';
import { Languages } from '../../src/domain/models/Languages';
import { blasonArmoiries, laLangueDuBlason, parker } from '../../src/domain/translations/Sources';
import { Source } from '../../src/domain/models/Source';
import { BlazonShield } from '../components/BlazonShield';
import { BlazonLink } from '../components/Reference';
import { Sources } from '../components/Sources';
import { COLOURINGS, Colouring, OUTLINE } from '../utils/Colourings';
import { LANGUAGES } from '../utils/Languages';
import { readBlazon } from '../utils/Reading';
import { greaves, wikipedia } from '../utils/Sources';

/** A blazon as somebody might type it, and the tongue they typed it in. */
export interface Typed {
  readonly text: string;
  readonly language: Languages;
}

/**
 * One decision, what it settles, and who says so.
 *
 * The cases are what was typed and nothing else: what comes back is read and
 * written by the library as the page is drawn, so a rule stated here that the
 * code no longer keeps shows itself the moment anybody looks.
 */
export interface Rule {
  /** The place in the page the rule answers to, so one rule can be sent alone. */
  readonly id: string;
  readonly heading: string;
  readonly law: ReactNode;
  /**
   * What the authorities say, quoted, and what they leave to be decided here.
   *
   * Left out where nobody says anything: a rule resting on nothing states as
   * much in its law rather than dressing an opinion as a citation.
   */
  readonly authority?: ReactNode;
  /**
   * The works that prose quotes, in the order it quotes them.
   *
   * Written as addresses rather than as links inside the prose. A citation
   * naming an author, a work and the entry within it is a sentence's worth of
   * text, and three of them inside a paragraph leave the reader stepping over
   * the apparatus to get at the argument.
   */
  readonly sources?: readonly Source[];
  readonly cases: readonly Typed[];
}

const en = (text: string): Typed => ({ text, language: Languages.en });
const fr = (text: string): Typed => ({ text, language: Languages.fr });

/**
 * Exported so that the index can show a rule by the arms it turns on rather than
 * by its name alone. What it lends is the cases, which are blazons and nothing
 * more; the prose stays here, where it is read.
 */
export const RULES: readonly Rule[] = [
  {
    id: 'one-spelling',
    heading: 'One spelling for each term',
    law: (
      <>
        <p className="rule__law">
          Heraldry spells a good many of its terms more than one way. Every one of those spellings
          is read, and exactly one is written: a term carries its words in order, and the first is
          the word it comes back in. Nothing about the arms changes on the way, the model never
          having held the spelling — what was said is the same, and how it is said is settled.
        </p>
        <p className="rule__law">
          Which spelling leads is declared term by term rather than worked out. Where heraldry has a
          plain form and a fuller one that says no more, the plain one leads: Parker gives pily,
          paly pily and pily counter pily for the one field, and pily is written. Where the
          dictionaries are indifferent, the form the two tongues share leads — besant is written
          where bezant is read, French calling the same coin a besant, and engrailed where Parker
          heads his entry “Engrailed, or Ingrailed” and French writes engrêlé. And a word the
          armorials write under either article is written under the one the heraldic dictionaries
          give: la losange, where modern French has gone masculine. Where a tongue has two words for
          the one thing and neither is a spelling of the other, one of them still leads — though not
          always the same one, the armorials keeping some words for some charges: that is the rule
          below.
        </p>
        <p className="rule__law">
          The same settling reaches the plumbing around a word. Blazonry says “à trois tourteaux”
          where ordinary French would contract the article, so “aux trois” is read and quietly
          written back the blazon’s way.
        </p>
      </>
    ),
    authority: (
      <>
        A handbook of blazon is written to give “a single correct way to blazon a given achievement,
        not two or three alternatives, no matter how correct” — Greaves, in the preface. That is
        what a writer can do and a parser cannot. The losange is feminine: “LOSANGE, subst. fém.”
      </>
    ),
    sources: [greaves('preface'), blasonArmoiries('Losange')],
    cases: [
      en('Argent a border gules'),
      en('Azure a bezant'),
      en('Azure a fess dancetté or'),
      en('Azure a fess ingrailed or'),
      en('Pily counter pily of four or and azure'),
      fr("D'argent au losange de gueules"),
      fr("D'or aux trois tourteaux de gueules"),
    ],
  },
  {
    id: 'counting-the-pieces',
    heading: 'English counts the pieces, French counts only when it must',
    law: (
      <>
        <p className="rule__law">
          A varied field is cut into a number of pieces, and the model always knows the number: what
          a blazon leaves unsaid is its own language’s to supply, and a drawing knows no language.
          What the two tongues then do with that number is not the same thing at all.
        </p>
        <p className="rule__law">
          English states it every time, the usual count included. French states it only where it is
          not the number the term is understood to have, and says nothing where it is. So one field
          is Barry of six or and azure in one tongue and Fascé d’or et d’azur in the other, and
          neither is saying more than the other. Cut in eight, both count it.
        </p>
        <p className="rule__law">
          A term no number is understood of is counted every time in both: neither tongue settles
          one for the pily, so a blazon that names none is refused rather than guessed at.
        </p>
      </>
    ),
    authority: (
      <>
        English adapts the name of the partition-line and uses “terms like ‘barry’, ‘paly’ and
        ‘bendy’, always stating the number and the tinctures involved” — Greaves, page 7. French
        counts only what is not understood, Au blason des armoiries giving “Lorsque le Bandé a plus
        ou moins de six pièces, il faut en exprimer le nombre”.
      </>
    ),
    sources: [greaves('page 7'), blasonArmoiries('Bandé', 'bandee')],
    cases: [
      en('Barry or and azure'),
      fr("Bandé d'or et d'azur de six pièces"),
      fr("Bandé d'or et d'azur de huit pièces"),
      en('Pily of four or and azure'),
    ],
  },
  {
    id: 'a-name-that-means-a-tincture',
    heading: 'A name that means a tincture is written without one',
    law: (
      <>
        <p className="rule__law">
          Some words are a tincture as well as a shape. A besant is the gold coin of Byzantium, so a
          besant is gold by being a besant, and writing “or” after it says the one thing twice.
          Where the word written already means the tincture borne, the tincture is not written:
          “D’azur au besant d’or” comes back as “D’azur au besant”, which is what the blazon was
          trying to be.
        </p>
        <p className="rule__law">
          Said the other way round it is refused rather than quietly mended. A blazon naming a
          tincture the word cannot mean is not read at all, because there is no telling which of the
          two the writer meant. A besant is never argent.
        </p>
        <p className="rule__law">
          A word that means no single tincture keeps its own. French tells the metal disc from the
          coloured one and stops there, so a tourteau is owed its colour every time it is borne.
        </p>
      </>
    ),
    authority: (
      <>
        Roundles are “circles borne on shields, and to which specific names are given according to
        their tinctures” — Parker. French draws the line between the two names rather than among
        seven: “Les Besants … sont toujours d’or ou d’argent … il ne faut pas les confondre avec les
        tourteaux qui eux sont de couleur”.
      </>
    ),
    sources: [parker('Roundles'), blasonArmoiries('Besant')],
    cases: [
      fr("D'azur au besant d'or"),
      en('Azure a besant argent'),
      fr("D'or au tourteau de gueules"),
    ],
  },
  {
    id: 'a-tincture-that-has-a-name',
    heading: 'A tincture that has a name of its own is written by it',
    law: (
      <>
        <p className="rule__law">
          The same mechanism read from the other end. Where the vocabulary keeps a word for the very
          tincture borne, that word is the one written, and the tincture disappears into it: a
          roundel or is a besant, a roundel gules a torteau, and what comes back is shorter and says
          exactly as much. The word is chosen for the tincture first, and only then is the tincture
          written — which is why it is not written at all.
        </p>
        <p className="rule__law">
          Where no such word exists the plain one is written and the tincture named after it.
          English named a round thing for each of its colours and none for the furs, so a roundel
          ermine is what it always was; French, having only the two names, borrows the besant for
          it.
        </p>
      </>
    ),
    authority: (
      <>
        “The modern English rules … limit the several names to the several tinctures, — Or, called
        always Bezants. Argent, Plates. Gules, Torteaux. Azure, Hurts” — Parker.
      </>
    ),
    sources: [parker('Roundles')],
    cases: [
      en('Azure a roundel or'),
      en('Or three roundels gules'),
      en('Azure a roundel argent'),
      en('Azure a roundel ermine'),
    ],
  },
  {
    id: 'a-name-that-means-what-was-done',
    heading: 'A name that means what was done to the charge is written without saying it',
    law: (
      <>
        <p className="rule__law">
          The besant’s rule again, read of the modifier instead of the tincture. Heraldry named some
          of the modified figures outright — a lozenge voided is a mascle, a lozenge pierced a
          rustre, a pierced star a molette — and such a name says what was done by being the word it
          is. Where the vocabulary keeps one, that word is written and the modifier disappears into
          it: “Azure a lozenge voided or” comes back “Azure a mascle or”, which is shorter and says
          exactly as much.
        </p>
        <p className="rule__law">
          Said twice, it is read and written once. “A mascle voided” is “a besant or” over again —
          the word had already said it, and saying it a second time changes nothing about the arms,
          so it is understood and quietly dropped. Said two different ways it is refused: a mascle
          keeps nothing but its outline and a rustre keeps everything but a round hole, so “a mascle
          pierced” names no figure and there is no telling which the writer meant.
        </p>
        <p className="rule__law">
          None of this reaches the model, which holds one lozenge and what was done to it. A mascle
          is not a charge of its own any more than a besant is: it is the lozenge, drawn as the
          voiding draws it, under the name the armorials give that drawing. So a tongue that named
          no such figure loses nothing — English has no word for the pierced star, molette being
          French and the English molet an old spelling of the mullet itself, and blazons the star
          and the piercing in the ordinary way.
        </p>
      </>
    ),
    authority: (
      <>
        Parker has the mascle as “a lozenge voided” and the rustre as “a lozenge with a circular
        perforation”. French draws the same line in the same words, Au blason des armoiries giving
        “MACLE, subst. fém., meuble de l’écu fait en losange, et percé dans le même sens” against a
        rustre, “Meuble en forme de losange, percé en rond au centre, de sorte que l’on voit le
        champ de l’écu à travers” — percé dans le même sens against percé en rond, which is the
        whole difference. Of the pierced star Parker says it “is generally taken to represent the
        rowel of a spur, and in modern French heraldry is called molette d’éperon”, which is also
        why English is given no word for it here.
      </>
    ),
    sources: [
      parker('Mascle'),
      parker('Rustre'),
      blasonArmoiries('Macle'),
      blasonArmoiries('Rustre'),
      parker('Mullet'),
    ],
    cases: [
      en('Azure a lozenge voided or'),
      fr("D'azur au losange vidé d'or"),
      en('Or three lozenges pierced sable'),
      en('Azure a mascle voided or'),
      en('Azure a mascle pierced or'),
      en('Azure a mullet pierced or'),
    ],
  },
  {
    id: 'a-name-that-means-a-part',
    heading: 'A name that means a part of the figure is written, and the part keeps its tincture',
    law: (
      <>
        <p className="rule__law">
          The mascle’s rule again, read of a part of the figure instead of what was done to it.
          Heraldry named the ring with a stone set in it outright — a gem-ring, the French anneau —
          and such a name says the stone by being the word it is. So a blazon that paints the stone
          comes back under that name whichever plain word it was written with: “Azure a ring or
          stoned argent” and “Azure an annulet or stoned argent” both come back “Azure a gem-ring or
          stoned argent”. Painted on nothing, the plain name stands.
        </p>
        <p className="rule__law">
          What the name does not say is the tincture, and that is what parts a part from a modifier.
          A mascle is voided entire and nothing follows it; a gem-ring has a stone and says nothing
          of its colour, so the word for the part is still written where the blazon named one. It
          stands last of all, after the tincture the charge itself carries, which is where the
          armorials of both tongues put it. Named none, the stone is drawn in the hoop’s own
          tincture and nothing is written: “Azure a gem-ring or” is a gold ring with a gold stone.
        </p>
        <p className="rule__law">
          Which charges have such a part is declared with the charge and is the same in either
          tongue, as a modifier’s charges are. Only the ring has one here, so a billet stoned is
          refused by name rather than drawn with something the figure has not got.
        </p>
      </>
    ),
    authority: (
      <>
        Parker files the figure under Ring: “the most important bearing of this name is the
        Gem-ring, that is a finger-ring set with a jewel, and this is sometimes described as stoned,
        gemmed, or jewelled of another tincture”, and blazons “Gules, three gem-rings argent stoned
        azure”. French draws the same line at the same place, Au blason des armoiries giving
        “lorsque ce meuble est représenté avec un chaton, il se nomme anneau” against the annelet.
      </>
    ),
    sources: [parker('Ring'), blasonArmoiries('Annelet')],
    cases: [
      en('Azure a ring or stoned argent'),
      en('Azure an annulet or stoned argent'),
      en('Azure a gem-ring or'),
      fr("D'azur à l'annelet d'or chatonné d'argent"),
      fr("D'azur à trois anneaux d'or chatonnés d'argent"),
      en('Azure a billet or stoned argent'),
    ],
  },
  {
    id: 'parts-sharing-a-tincture',
    heading: 'Two parts of one colour are written once, and the colour said last',
    law: (
      <>
        <p className="rule__law">
          A beast may have more than one of its parts painted apart from the rest, and heraldry says
          the colour once where they share it: “armé et lampassé de gueules”, “armed and langued
          gules”, and never the tincture twice over. So the words are gathered into a run and the
          tincture closes it. The run is said as a list is said — the mark between all but the last
          two and the conjunction before the last, “armé, lampassé et couronné d’or” — and the
          conjunction alone where there are two of them.
        </p>
        <p className="rule__law">
          Parts of different colours are two runs and are parted by the mark, there being two
          tinctures in a row otherwise and no telling which belongs to which. The order is the
          blazon’s own and is kept: only the parts standing next to each other are gathered, so a
          blazon that said its parts in some order gets that order back.
        </p>
        <p className="rule__law">
          Read more widely than written, as everything here is. An armorial may join the words with
          the conjunction or with the mark — “au lion couronné du second, armé, lampassé de gueules”
          — and either is understood; what comes back is the conjunction. French agrees every word
          of the run with the charge, in gender and in number, so three lions are armés where one is
          armé.
        </p>
      </>
    ),
    authority: (
      <>
        Both dictionaries write the run and not the repetition. Au blason des armoiries blazons
        “D’argent, au lion de sable, armé et lampassé de gueules” under Lampassé and “De gueules, au
        lion d’hermine, armé, lampassé et couronné d’or” under Armé; Parker has the claws and the
        tongue as two words of one kind, armed being said “when any beast of prey has teeth and
        claws … of a tincture different from its body” and langued the same of the tongue.
      </>
    ),
    sources: [blasonArmoiries('Lampassé'), blasonArmoiries('Armé'), parker('Armed')],
    cases: [
      fr("D'argent au lion de sable armé et lampassé de gueules"),
      fr("D'argent au lion de sable, armé, lampassé de gueules"),
      fr("D'argent au lion de sable, armé, lampassé et couronné de gueules"),
      en('Argent a lion sable armed gules langued azure'),
      en('Argent three lions sable armed and langued gules'),
    ],
  },
  {
    id: 'naming-a-strewing',
    heading: 'A strewing is named where heraldry names it',
    law: (
      <>
        <p className="rule__law">
          A field sown with a figure can always be said the long way round — “semé de billettes”,
          “semy of billets” — and heraldry would rather not. Where the language keeps a word for the
          strewing itself, that word is what is written: billeté, billetty. The long way round is
          left to the figures no word names.
        </p>
        <p className="rule__law">
          Such a word carries its tincture exactly as a charge’s name does, and is refused on the
          same terms. A besanté is gold by being a besanté, so nothing is written after it; a
          bezanty is never argent, so a field sown with silver discs is not written bezanty at all
          but semy of plates. Where no word the language has will take the tincture, the long way
          round is written rather than a word that would be wrong about it.
        </p>
        <p className="rule__law">
          Which strewings have a word is declared language by language and never worked out. French
          names the billeté, the besanté and the tourtelé; English the billetty and the bezanty.
          Losangé and lozengy are fields cut into lozenges rather than sown with them, and are not
          borrowed for this however convenient they look.
        </p>
      </>
    ),
    authority: (
      <>
        “In the case of semé of crosslets, billets, bezants, the special term crusily, billetty, and
        bezanty, already noted in their proper places, are preferable” — Parker.
      </>
    ),
    sources: [parker('Seme')],
    cases: [
      fr("D'azur semé de billettes d'or"),
      en('Azure semy of roundels or'),
      en('Azure semy of roundels argent'),
      fr("D'azur semé d'annelets d'or"),
    ],
  },
  {
    id: 'a-word-read-and-never-written',
    heading: 'A word that says nothing is read and never written',
    law: (
      <>
        <p className="rule__law">
          French calls a bare field plain — “de gueules plain” — and the word states a fact the
          blazon has already stated by stopping: a field is plain by having nothing on it. So there
          is nothing in the model to hold it, and nothing to write back. What comes back is the
          tincture and the full stop, which says the same thing in fewer words.
        </p>
        <p className="rule__law">
          It is read all the same, and held to. Plain is a promise about the rest of the blazon, so
          a field called plain and then charged is refused rather than quietly drawn: the two words
          contradict each other and neither is wrong on its own.
        </p>
        <p className="rule__law">
          English is given no such word. Parker’s “plain” is a band drawn with a straight line
          rather than a field with nothing on it, and French “plein” is another word again — the
          undifferenced arms of the head of a family, which says nothing about the field at all.
          Neither is borrowed for this.
        </p>
      </>
    ),
    authority: (
      <>
        “Plain (&lt; lat. <i>planus</i> ‘plan’) signifie que l’écu est d’une couleur unie, sans
        aucune figure”, where “plein (&lt; lat. <i>plenus</i>) indique que l’écu correspond aux
        armoiries d’un ‘chef d’armes’ … et que ces armes ne comprennent aucune brisure, aucune
        marque de cadet” — La langue du blason.
      </>
    ),
    sources: [
      laLangueDuBlason('« plain » et « plein »', '2012/08/plain-et-plein-en-langue-du-blason.html'),
    ],
    cases: [fr('De gueules plain'), fr("D'hermine plain"), fr("D'or plain au chef de gueules")],
  },
  {
    id: 'a-word-one-tongue-never-had',
    heading: 'A tongue with no word of its own is written in the word it borrowed',
    law: (
      <>
        <p className="rule__law">
          English cut the saw-toothed line in two and named both halves — indented for the small
          teeth, dancetty for the great ones — and never named the third, where the great teeth come
          to a right angle at the point instead of a sharper one. French named it vivré. So that is
          the word English is written in: a bend vivré, where the same arms in French are à la bande
          vivrée.
        </p>
        <p className="rule__law">
          The alternative would be to answer vivré with dancetty, which is the nearest English word
          and not the same drawing — one line comes to a sharper point than the other. A reader told
          dancetty would draw the wrong band. Borrowing the word says what was meant and says, by
          being foreign, that English never settled a word for it.
        </p>
        <p className="rule__law">
          It is borrowed only where there is nothing to borrow it over. Where English has a word of
          its own the English word is written, however freely the armorials write the French one:
          vairy is written where vairé and vaire are read, all three being the one field.
        </p>
      </>
    ),
    authority: (
      <>
        Parker files Vivré as an entry of an English glossary, “a French term applied to the fesse,
        bend, &amp;c.”, and blazons English arms with it: it is “practically equivalent to dancetty,
        except that the indentations are more open, i.e. the lines forming them produce right
        angles, instead of the acute angles which are usually represented in the drawing of indented
        or dancetty”. Au blason des armoiries files the same word under its own, where the pieces
        are “sinueuses et ondées, mais avec des entailles faites d’angles saillants et rentrants”.
      </>
    ),
    sources: [parker('Vivre'), blasonArmoiries('Vivré', 'vivree'), parker('Vair')],
    cases: [
      en('Azure a fess vivré or'),
      fr("D'or à la bande vivrée d'azur"),
      en('Azure a fess dancetty or'),
      en('Vairé azure and or'),
    ],
  },
  {
    id: 'a-modifier-is-written-last',
    heading: 'A modifier stands after what it qualifies and before its tincture',
    law: (
      <>
        <p className="rule__law">
          A blazon may say what was done to a charge as well as what the charge is: a lozenge with
          its middle out is a lozenge voided, and what shows through the hole is the field. Blazon
          takes its word order from French, so the word qualifying the charge follows the charge and
          the tincture comes last of all — two bars voided gules, à la croix vidée de gueules. That
          is where it is written.
        </p>
        <p className="rule__law">
          A band is said of in the same place and by the same rule. What is done to it is done to
          the line it is named after rather than to its middle — a fess indented is a fess whose
          edges are cut into teeth — so the two take different words, and neither takes the other’s:
          a fess is never voided and a lozenge is never indented. Which band takes which line is
          declared with the band, as which charge takes which modifier is declared with the charge,
          so the answer is the same in either tongue and a band that takes none refuses one by name.
        </p>
        <p className="rule__law">
          It is read after the tincture as well. The model holds which modifier and not where the
          armorial put it, so a blazon that says it late is understood and answered in the settled
          order. Set before the charge it is not read at all: “a voided lozenge” is modern English
          describing a shield rather than blazon naming one, and reading it would teach a word order
          heraldry does not use.
        </p>
      </>
    ),
    authority: (
      <>
        Both tongues put the word between the charge and its tincture. Parker blazons “Argent, two
        bars voided gules” and “Argent, a cross voided and double cottised sable, within a bordure
        or”; Au blason des armoiries gives “d’azur, à l’étoile évidée d’argent” under Évidé and
        “D’or, à la croix vidée de gueules” under Vidé. The order is the language’s own rather than
        heraldry’s: “adjectives are normally placed after nouns rather than before”, and a charge’s
        attributes are named before its tincture.
      </>
    ),
    sources: [
      parker('Voided'),
      blasonArmoiries('Évidé'),
      blasonArmoiries('Vidé'),
      wikipedia('Blazon'),
    ],
    cases: [
      en('Azure a billet voided or'),
      en('Azure a billet or voided'),
      en('Azure a fess indented or'),
      en('Azure a voided lozenge or'),
    ],
  },
  {
    id: 'a-modifier-agrees-in-french',
    heading: 'A French modifier agrees with the charge the blazon named',
    law: (
      <>
        <p className="rule__law">
          French agrees the word with what it qualifies, and what it agrees with is what the blazon
          itself said. “À la billette” makes the charge feminine and is owed vidée, “au besant”
          makes it masculine and is owed vidé, and three billettes are owed vidées. A blazon that
          chose one gender and then said the other is refused rather than quietly mended.
        </p>
        <p className="rule__law">
          A word the armorials write under either article is owed whichever the blazon chose: “au
          losange vidé” and “à la losange vidée” are both read. What comes back agrees with the
          gender the charge is written back in, which is the word’s own rather than the blazon’s.
          English agrees with nothing, and writes the one word after one charge or three.
        </p>
        <p className="rule__law">
          A band agrees as a charge does, and carries its own gender to be agreed with: au chef
          dentelé, à la fasce dentelée, à trois bandes dentelées.
        </p>
      </>
    ),
    authority: (
      <>
        The agreement is French grammar and not a rule of heraldry; what heraldry settles is which
        gender each word carries. Au blason des armoiries gives the losange as feminine, which is
        the gender it is written back in, as the spelling rule above already has it.
      </>
    ),
    sources: [blasonArmoiries('Losange')],
    cases: [
      fr("D'azur à la billette vidée d'or"),
      fr("D'or à trois billettes de sable vidées"),
      fr("D'azur à la losange vidée d'or"),
      fr("D'azur au chef dentelé d'or"),
      fr("D'or à trois bandes dentelées de sable"),
      fr("D'azur à la billette vidé d'or"),
    ],
  },
  {
    id: 'a-modifier-said-of-what-can-show-it',
    heading: 'A modifier is said only of what can show it',
    law: (
      <>
        <p className="rule__law">
          Neither voiding nor piercing is said of a band here. Heraldry says them — Parker blazons a
          cross voided — but no voided band is drawn, and a vocabulary that read the word would
          promise a drawing it cannot make. A band told it is voided is refused by name, and a
          charge told it is indented is refused the same way, a charge having no line to cut. So is
          a charge that is already what the word says: an annulet is a roundel voided, and voiding
          it again names no figure.
        </p>
        <p className="rule__law">
          The two words are never traded for one another. A billette percée is not a billette vidée,
          however the dictionaries file them together: voiding leaves the outline and nothing else,
          piercing leaves the charge with a round hole in it. Two drawings are two things to have
          said, so each comes back in the word that said it.
        </p>
      </>
    ),
    authority: (
      <>
        The two drawings are the ones heraldry names apart: Parker has a mascle as “a lozenge
        voided” and a rustre as “a lozenge with a circular perforation”. Which charges will take
        either is settled here rather than found. The dictionaries blazon what armorials wrote and
        say nothing about what may not be written, so the line is drawn at what can be drawn.
      </>
    ),
    sources: [parker('Mascle'), parker('Rustre')],
    cases: [
      en('Azure a fess voided or'),
      en('Azure a lozenge indented or'),
      en('Azure an annulet voided or'),
      fr("D'azur à la billette percée d'or"),
    ],
  },
  {
    id: 'a-word-kept-for-one-charge',
    heading: 'A word the armorials keep for one charge is written of that charge alone',
    law: (
      <>
        <p className="rule__law">
          A tongue may say the one thing with two words and give each its own figures. French takes
          the middle out of a charge with vidé and with évidé — two verbs, so two words, neither a
          spelling of the other — and the heraldic dictionaries do not use them interchangeably:
          évidé is the word for the star, and vidé is the word for the rest. Both are read of every
          charge that will take the voiding at all, and what comes back is the word that charge is
          written with. An étoile vidée is understood and answered évidée; a losange évidée is
          understood and answered vidée.
        </p>
        <p className="rule__law">
          Which word claims which charge is declared on the word, beside the charges it names and
          the tinctures it will take — the same place the roundel’s two names settle which of them
          means gold. A word that claims nothing is the general one, and is written wherever no
          other word has claimed the charge, so a charge added to the vocabulary is spelled without
          anybody having to remember it. The model holds none of this: one voiding, one drawing, and
          two tongues that need not agree on how many words it takes to say.
        </p>
        <p className="rule__law">
          English has no such quarrel here. It voids everything with voided, and a rule about which
          word is owed which charge is a rule about French until some English term needs it.
        </p>
      </>
    ),
    authority: (
      <>
        Au blason des armoiries gives, under Vidé, “on se sert du terme percées, pour les billettes
        ; évidés, pour les triangles et étoiles”, and blazons “D’or, à la croix vidée de gueules”;
        its Évidé blazons “d’azur, à l’étoile évidée d’argent”. The billettes are the one that entry
        gets wrong: percé is another thing done to a charge and not another way of saying this one,
        as the rule above has it.
      </>
    ),
    sources: [blasonArmoiries('Vidé'), blasonArmoiries('Évidé')],
    cases: [
      fr("D'azur à la billette évidée d'or"),
      fr("D'argent à l'étoile vidée de gueules"),
      fr("D'or à trois billettes vidées de sable"),
      en('Azure a mullet voided or'),
    ],
  },
  {
    id: 'a-painted-line-moves-the-modifier',
    heading: 'A painted line puts the band’s tincture first',
    law: (
      <>
        <p className="rule__law">
          What was done to a band is written between the name and the tincture, which is where the
          armorials of both tongues put it: a fess indented or, à la fasce dentelée d’or. A blazon
          may also paint the line in a tincture of its own — the band one colour and its teeth
          another — and then there are two tinctures to write and only one place that can be read
          back. So the band’s own goes first and the modifier stands between the two, each tincture
          beside what it belongs to: à la bande de gueules engrêlée de sable.
        </p>
        <p className="rule__law">
          It is the armorials’ own order, and it is the only one. Written the usual way round the
          two tinctures would stand side by side with nothing between them to say which was the
          band’s and which the line’s — and a blazon that cannot be read back is not a blazon. A
          band whose line was given no tincture is untouched by this and comes back as it always
          did.
        </p>
        <p className="rule__law">
          The same order is written in English, which has no form of its own to follow: Parker’s
          fimbriated is “a narrow edging of some other tincture all round”, which is another figure,
          and he names nothing for a line painted apart from its band. So English is given the
          French order rather than a borrowed French word — the words are all English, and only the
          sentence is French.
        </p>
      </>
    ),
    authority: (
      <>
        The arms of Lanval du Bois, in the armorial of the Round Table: “D’or à la bande de gueules
        engrêlée de sable.” Parker’s fimbriated is “said by strict heralds to be applied only to an
        ordinary or other charge having a narrow edging of some other tincture all round it”, and
        his Edged sends the reader to it; neither is a line.
      </>
    ),
    sources: [parker('Fimbriated'), blasonArmoiries('Engrêlé')],
    cases: [
      fr("D'or à la bande de gueules engrêlée de sable"),
      en('Or a bend gules engrailed sable'),
      en('Or a bend engrailed gules'),
      fr("D'argent à trois bandes de gueules engrêlées de sable"),
    ],
  },
  {
    id: 'laid-over-all-is-written',
    heading: 'What a blazon laid over all is written again, where that tongue puts it',
    law: (
      <>
        <p className="rule__law">
          A blazon may say that a band or a charge is laid over everything else the field carries:
          brochant sur le tout, over all a bend gules. The order things are blazoned in says which
          covers which already, so said of whatever was named last the words only repeat it. What
          they buy is the other case — what covers named before what it covers — and there they
          overrule the order, which would otherwise have drawn the thing underneath.
        </p>
        <p className="rule__law">
          They are written back wherever the model holds them, redundant or not. Parker calls them
          understood over a particoloured field and almost indispensable everywhere else, which is a
          judgement about particular arms rather than a rule; a writer that dropped them wherever it
          judged them understood would be making that judgement blazon by blazon, and making it
          silently. So what was said is said again.
        </p>
        <p className="rule__law">
          Where they go is each tongue’s own. French writes its participle after the band and after
          the tincture, last of all, and English writes its words in front of the whole phrase.
          French reads the bare brochant and writes the whole brochant sur le tout, the dictionary
          filing the short form under the long. Neither tongue reads the other’s place.
        </p>
      </>
    ),
    authority: (
      <>
        Parker has “Over all, surtout, (fr. sur-le-tout): said of a charge placed over several other
        charges or over a particoloured field”, adds that “French heralds also employ the term
        brochant sur le tout”, and writes it in front: “Barry of six argent and azure, [over all] a
        bend gules”. Au blason des armoiries files the participle under the phrase — “Se dit des
        pièces posées sur le champ et sur d’autres meubles qu’elles couvrent en partie; on les dit
        alors: Brochant sur le tout” — and writes it after: “à trois grappes de raisins d’or
        brochant sur le tout”.
      </>
    ),
    sources: [parker('Over all'), blasonArmoiries('Brochant')],
    cases: [
      fr("D'argent à trois billettes de sable, à la fasce de gueules brochant"),
      fr("D'argent à la fasce de gueules brochant sur le tout, à trois billettes de sable"),
      fr("D'or au chef d'azur, brochant sur le tout"),
      en('Argent over all a fess gules'),
    ],
  },
  {
    id: 'counterchanging-is-one-word',
    heading: 'Counterchanging is one thing, whatever French calls it',
    law: (
      <>
        <p className="rule__law">
          A band laid on a divided field may take the field’s own two tinctures instead of naming
          one, reversed: where the field is metal the band is colour, and where the field is colour
          the band is metal. English says that in a word — counterchanged — and French says it in a
          phrase. The phrase written back is “de l’un à l’autre”.
        </p>
        <p className="rule__law">
          French writes it a second way, “de l’un en l’autre”, and both are read. The dictionaries
          do try to divide the two, and disagree flatly about which way round. Au blason des
          armoiries keeps “l’un à l’autre” for figures posées sur les partitions — standing on the
          line — and “l’un en l’autre” for figures au centre des divisions, standing to one side of
          it; La langue du blason has the two exactly the other way about; and the Manuel du blason
          calls telling them apart a chinoiserie and keeps only “l’un en l’autre”. Nobody is going
          to settle that here, so the two are one phrase spelled two ways, as Parker already treats
          them.
        </p>
        <p className="rule__law">
          What the dictionaries were reaching for with two phrases is said instead by the drawing.
          Parker’s rule reaches both cases at once — the parts of the figure lying on the metal are
          of the colour, and the parts lying on the colour are of the metal — and under it a band
          crossing the line comes out cut by it while a band lying wholly in one half comes out
          wholly of the other half’s tincture. Neither case is told the rule; both fall out of where
          the figure happens to lie.
        </p>
        <p className="rule__law">
          It is said of a charge as readily as of a band, and of several charges at once: each falls
          where it falls, and each comes out the opposite of what it fell on. What it needs is a
          field divided between two tinctures, a quartering among them — its two pairs of quarters
          stand for the two halves — and a varied field is cut from two tinctures as well but is
          refused by name rather than drawn wrongly, being cut into a row rather than by a line.
        </p>
        <p className="rule__law">
          What it also needs is a name that has not already said what the figure is painted with.
          The rule is the besant’s own: a besant is a gold coin, so a besant painted half out of the
          sable half of a field is not a besant, and the blazon is refused exactly as “a besant
          azure” is. English keeps a name for every colour of roundel and one for none of them, so a
          roundel counterchanges under that last name; French tells the metal disc from the coloured
          one and has no third word, so it cannot counterchange a disc at all. That is the tongue’s
          own gap, not a rule imposed on it.
        </p>
      </>
    ),
    authority: (
      <>
        Counterchanged is said where “the field consists of metal and colour separated by one of the
        lines of partition named from the ordinaries (per pale, per bend, &amp;c.), and … the
        charges, or parts of charges, placed upon the metal are of the colour, and vice versa” —
        Parker, who adds that the French “de l’un en l’autre” is “in most cases practically
        equivalent”. Au blason des armoiries divides the two French phrases: “L’UN À L’AUTRE, se dit
        des pièces ou meubles de l’écu, posés sur les partitions, les deux émaux étant changés
        alternativement”, where “L’UN EN L’AUTRE … les pièces ou meubles ne sont pas sur les
        partitions, mais au centre des divisions”.
      </>
    ),
    sources: [parker('Counter'), blasonArmoiries("L'un à l'autre", 'l-un-a-l-autre')],
    cases: [
      fr("Parti d'or et de sable à la bordure de l'un à l'autre"),
      fr("Parti d'or et de sable à la bordure de l'un en l'autre"),
      fr("Coupé d'argent et de gueules au chevron de l'un à l'autre"),
      fr("Tranché d'or et d'azur à trois bandes de l'un à l'autre"),
      en('Per pale argent and sable a fess counterchanged'),
      fr("Coupé d'or et de sable à deux losanges de l'un à l'autre"),
      en('Per pale argent and sable three lozenges voided counterchanged'),
      en('Per pale or and sable a roundel counterchanged'),
      en('Or a bordure counterchanged'),
      en('Per pale or and sable a besant counterchanged'),
    ],
  },
  {
    id: 'the-smaller-settlements',
    heading: 'The smaller settlements',
    law: (
      <>
        <p className="rule__law">
          One of a thing carries no count. The model leaves the number off rather than setting it to
          one, so a fess borne alone is written as the fess it was before a field could bear two —
          “à la fasce”, never “à une fasce”.
        </p>
        <p className="rule__law">
          What the field bears is written in the order the model holds it, which is the order it was
          laid on the field and the order it is drawn: a bordure named after three bends covers the
          bends, and writing the two round the other way would say something else.
        </p>
        <p className="rule__law">
          A blazon comes back as a sentence — opening capital, closing full stop — and a comma parts
          one charge from the next. Nothing but a space stands between the field and the first thing
          borne, which is how both tongues write it.
        </p>
      </>
    ),
    cases: [en('or a chief gules a bordure azure')],
  },
];

export interface ConventionsPageProps {
  readonly colourings?: readonly Colouring[];
}

/**
 * What the library decides when heraldry does not.
 *
 * Reading is generous and writing is not: a blazon may arrive spelled any way
 * the armorials spell it, and leaves spelled one way. Every such choice is a
 * decision somebody made, so each is set down here with the arms it governs and
 * the authority it was taken on — and worked, rather than quoted, so that the
 * page cannot drift from the code it describes.
 */
export function ConventionsPage({ colourings = COLOURINGS }: ConventionsPageProps) {
  const colours = colourings[0]?.colours;

  return (
    <main className="plane">
      <h1>Conventions</h1>
      <p className="plane__extent">Several blazons in · one blazon out</p>

      <p className="plane__lead">
        A blazon is read into a model and written back out of it. The model holds what the arms are
        — a field, and the bands and charges laid on it in order — and not one word of how anybody
        said it. So writing is never a copy of what was typed: it is the same arms said again, in
        whichever tongue is asked for, under whatever rule that tongue keeps.
      </p>
      <p className="plane__lead">
        Wherever heraldry allows a thing to be said two ways, both are read and one is written.
        Which one is a decision, and the decisions are here, so that a blazon that goes in and comes
        back changed has changed for a reason a reader can look up.
      </p>
      <p className="plane__lead">
        Every pair below is run through the parser and the writer as this page is drawn. What stands
        against “written” is what the library answers today, not what it was once documented as
        answering. Each is a link to itself, read at full size.
      </p>

      <div className="rules">
        {RULES.map((rule) => (
          <section key={rule.id} id={rule.id} className="rule" aria-labelledby={`rule-${rule.id}`}>
            <h2 id={`rule-${rule.id}`}>{rule.heading}</h2>
            {rule.law}
            {rule.authority !== undefined && <p className="rule__source">{rule.authority}</p>}
            <Sources sources={rule.sources ?? []} />
            <ul className="rule__cases" role="list">
              {rule.cases.map((typed) => (
                <Case key={typed.text} typed={typed} colours={colours} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

/**
 * One blazon typed, and what the library answers.
 *
 * A refused blazon draws no arms, and the space they would have stood in is
 * held rather than closed: a refusal is one of the answers the page is about,
 * not a case that failed to render.
 */
function Case({
  typed,
  colours,
}: {
  readonly typed: Typed;
  readonly colours?: Colouring['colours'];
}) {
  const read = readBlazon(typed.text, typed.language);

  return (
    <li className="case">
      {'blazon' in read ? (
        <BlazonShield blazon={read.blazon} alt="" colours={colours} outline={OUTLINE} width={56} />
      ) : (
        <span className="case__unread" />
      )}
      <dl className="case__turn">
        <div className="case__row">
          <dt>Typed</dt>
          <dd className="case__typed" lang={typed.language}>
            {typed.text}
          </dd>
        </div>
        <div className="case__row">
          <dt>{'blazon' in read ? 'Written' : 'Refused'}</dt>
          {'blazon' in read ? (
            <dd className="case__written">
              <BlazonLink blazon={LANGUAGES.fr.writer.write(read.blazon)} language={Languages.fr} />
              <BlazonLink blazon={LANGUAGES.en.writer.write(read.blazon)} language={Languages.en} />
            </dd>
          ) : (
            <dd className="case__refused">{read.refused}</dd>
          )}
        </div>
      </dl>
    </li>
  );
}
