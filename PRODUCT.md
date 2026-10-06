# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally — neither is an afterthought.

- **Developers** deciding whether to install `the-herald-playground`, or already integrating it. They arrive
  wanting the supported vocabulary, the exact input string a term takes, and the component API.
- **Heraldry learners** who want to understand blazon itself. They arrive wanting the conventions
  taught — what a tincture is, why the ranks exist, what "in chief" means — with the library as the
  vehicle rather than the subject.

The same page must serve a developer scanning for a citable term and a learner reading to understand.

## Product Purpose

Read a coat of arms written in words, in French or English, into a language-neutral model; write that
model back out in either language; and draw it as an SVG shield.

Translating is the point: parsing in one language and writing in another is the whole mechanism, and
nothing between the two services knows a second language exists.

## Positioning

The domain is named in English heraldic terms and knows no language at all. What a term is _called_ is
a `Translation<T>` keyed on the enum's values, so adding a term breaks every language that has not
caught up. A language contributes only a `BlazonGrammar` for reading and a `BlazonWording` for writing:
its terms, its conjunction, and how it introduces a tincture. French agrees an article with the word
that follows; English names the tincture bare.

This is what a neighbouring blazon parser could not truthfully copy: most are written against one
language's grammar, so a second language means a second parser.

## Operating Context

- Published as an npm library with a single entry point. It holds no React: every component lives in
  `demo/`, which is not published, so installing the library on a backend pulls no React in.
- The demo is run locally with `npm run dev`. It is **not yet published**, and is intended to be put in
  front of other people eventually, with no deadline. Build as though it will be seen.
- The vocabulary pages (`/doc/vocabulary/fr`, `/doc/vocabulary/en`) are today the only statement of
  what the parser accepts: one page per tongue, every word it reads filed alphabetically, with what
  the word means, the arms that show it, a blazon carrying that very spelling, and what the other
  tongue says it by. What a word means is carried by the word itself in `domain/translations`, so a
  word added to the library arrives on the page of itself. `/doc/conventions` is the only statement
  of what the writer decides where heraldry decides nothing. Both pages' blazons are run through the
  parser and the writer as the page is drawn, so the documentation cannot drift from the code.

## Capabilities and Constraints

Supported vocabulary as it stands:

- **Tinctures (8)** in three ranks — metals (or, argent), colours (azure, gules, sable, vert),
  furs (ermine, vair).
- **Divisions (6)** — per pale, per fess, per bend, per bend sinister, and the two whose line crosses
  itself and cuts the field into four rather than two: quarterly (French écartelé), the pale and the
  fess together, its quarters standing square; and per saltire (French écartelé en sautoir), the bend
  and the bend sinister together, its quarters standing on their points. How many parts a line leaves
  is declared with the term, so nothing counts for itself. Every part is arms of its own: a field with
  whatever a tongue says of a field — that it is plain, what it is sown with, or that it is cut into
  pieces of its own, heraldry quartering a bandé as readily as a plain coat ("écartelé : aux 1 et 4
  bandé d'or et d'azur à la bordure de gueules ; aux 2 et 3 d'azur semé de fleurs de lys d'or") — and
  whatever a shield may bear. Two fields a part may not yet be: one covered with a pelt, and one cut
  again. Two forms say it. The unranked form is what the armorials write and what the parts are
  written back out in wherever it can say them: "Parti d'azur à six macles d'argent, et d'hermine
  plain", and two tinctures for a quartered field, which fills out the parts ranked 1 and 4 from the
  first and the two between them from the second — "Écartelé d'argent et d'azur". A mark set before the
  conjunction says no more than the conjunction does and is read and dropped; what a part bears stands
  between its tincture and the conjunction; what follows the last part belongs to the shield, a bordure
  blazoned after a division surrounding the whole of it. The ranked form says what that one cannot: any
  part may bear, and one phrase may speak for several parts carrying the same coat — "Écartelé : aux 1
  et 4 d'azur au chevron d'or ; aux 2 et 3, d'azur à trois colombes d'argent". A rank is written in
  words, in figures or, in French, in Roman numerals ("au premier", "au 1", "au I"; "first", "1"), and
  the parts are named in the order the partition takes them or the blazon is refused — a rank the field
  has no part for, a part ranked twice, a phrase running backwards and a part never named are each
  refused by name. Both tongues rank: French ranks with an article, English with a bare ordinal as
  Parker ranks quarters. The rank is written back only where the unranked form could not have said it.
  A part is drawn as well as read: what it bears is drawn in the room the part gives it — the part's
  own corner and its own reaches, so three lilies in the half at dexter stand in that half and are
  drawn small enough for it — and cut off at the line. Its sowing is laid in the lattice the whole
  field is sown in and cut off there too, which keeps it in step with whatever is sown beyond the line.
  A part cut into pieces is drawn as well as read, its pieces measured against the part: a bandé of six
  in a quarter is six pieces across the quarter. What is not drawn: a part cut again, a band that
  follows an outline rather than measuring itself, and a band scaled to the part it stands in — a
  bordure borne on a part follows the part's box rather than the field's edge, and a cross borne in a
  quarter is still the width of one drawn on the whole shield.
- **Varied fields (5)** — barry, paly, bendy, pily, chevronny, cut into a counted number of pieces.
- **Furred fields (1)** — vairy: the bells of vair cut from two tinctures the blazon names, rather
  than from the argent and azure vair itself is always drawn in. Nothing about it is counted.
- **Ordinaries (10)** — chief, pale, fess, bar gemel, bend, bend sinister, chevron, cross, saltire,
  bordure. Laid on the field in the order the blazon names them, which is the order they are drawn.
  That order is the model's to keep: sorting what a field bears into separate lists would lose it.
  Seven of them may be drawn along any of the modified lines — chief, pale, fess, bend, bend
  sinister, chevron, bordure — and which those are is declared with the ordinary, as which modifier
  a charge takes is declared with the charge.
- **Modifiers (6)** — voided: the charge's middle taken out, so the field shows through the outline;
  pierced: a round hole punched through it, the rest of the charge left as it was; and the four
  modified lines — indented, dancetty, the vivré and engrailed — which cut the edges of a band
  rather than run them straight. The first two are two things and not one said twice, whatever the
  dictionaries' filing — a billette percée is not a billette vidée, and the two are drawn
  differently because they are different. Written between the charge
  and its tincture, which is where the armorials of both tongues put it — blazon takes its word
  order from French, so what qualifies the charge follows it and the tincture comes last. Read after
  the tincture as well, and never before the charge, blazon setting no adjective there. Refused
  where the charge is already what it says — an annulet is a roundel voided. Which charges take
  which modifier is declared on the charge, so the answer is the same in either tongue. French
  agrees the word with what the blazon called the charge, in gender and in number, and refuses a
  blazon that chose one gender and said the other. It also says the voiding with two words and keeps
  each for its own charges: the star is évidée where every other charge is vidée. Both are read of
  every charge, and each charge is written with its own. The billet, the lozenge and the mullet take
  both modifiers, and where heraldry gave the modified figure a name of its own that name is read
  and written in place of the two words: a lozenge voided is a mascle (French macle), a lozenge
  pierced a rustre, a pierced star the French molette. Such a name says the modifier by being
  written, exactly as a besant says gold, so nothing follows it — and a blazon that says the
  modifier anyway is understood where it agrees and refused where it does not. English names no
  pierced star, molette being French, and blazons it in the ordinary way.

  A band is said of by the same rule and in the same place, and takes modifiers of its own: what is
  done to a charge is done to its middle and what is done to a band is done to the line it is named
  after, so no band is voided and no charge is indented, and either refuses the other's word by
  name. Four of the six are modified lines. Three of those are saws and differ in the size of the
  tooth and in the shape of it and in nothing else at all: indented, the small teeth — "notched
  after the manner of dancetty, but with smaller teeth"; dancetty, the same teeth cut larger and so
  fewer, three of them across a fess where the indented fess has half a dozen; and the vivré, those
  great teeth brought to a right angle at the point instead of a sharper one — which on a band that
  runs at a slant gives "the appearance of rectangular steps", a staircase rather than a zigzag.
  French names all three — dentelé, denché, vivré — and English only two, so the third is blazoned
  in English with the French word, which is how Parker files it.

  The fourth line is no saw. Engrailed (French engrêlé) cuts the edge into "small semicircular
  indents, the teeth or points of which being outward enter the field", which is what the French
  dictionary parts it from the dentelé by: the engrêlé has "petites dents dont les intervalles sont
  creux et arrondis", where the saw's "intervalles sont à angles droits, comme des dents de scie".
  Every hollow bites the same way, so a band engrailed is widest at its points and narrowest between
  them, both its edges hollowed from the field side at once — "when a fesse chevron or bend is
  blazoned engrailed, it implies that the ordinary is to be so on both sides". The hollow is
  measured square to the line it is cut in, so it stays a circle on a band that runs at a slant and
  its points stand out of the band rather than down the field; a chevron is cut along each of its
  limbs and keeps its point where the two meet. English reads ingrailed too, which is Parker's own
  other spelling, and writes engrailed. The invected — the same hollows turned so that "the points
  are inwards" — is a second drawing and is not read.

  A line may also be painted in a tincture of its own, which no other modifier may: the band keeps
  its tincture between the notches and the cut beyond them is drawn in whatever the blazon named —
  "D'or à la bande de gueules engrêlée de sable", the bend red and its engrailing black. It is the
  line that is painted and not a second band laid underneath: the band lies where it lay and is as
  wide as it was, and what the second tincture takes is the teeth. A line a blazon says nothing of
  is drawn in the band's own tincture, as it always was. Voided and pierced take no tincture and
  are refused one by name, the reason being what each is done to: a line is an edge and an edge can
  be drawn, where a lozenge voided shows the field through it, so a tincture there would be filling
  the hole rather than colouring it — another figure, which the armorials also write ("deux
  molletts d'or, voydes vert") and which is not read yet. Where the line is painted the band's own
  tincture is written first and the modifier between the two, so that each tincture stands beside
  what it belongs to; English has no form of its own for this — Parker's fimbriated is "a narrow
  edging of some other tincture all round it", which is another figure — and is given the French
  order.

  The seven bands that take the lines are the four Parker names the indenting of, the mirror of the
  bend, the chief, and the bordure; a band that can be cut at all can be cut by any of the four, and
  the French dictionary writes the engrêlé of exactly that list — "du chef, du pal, du sautoir, du
  chevron, de la fasce, de la croix, de la bande, de la bordure". The last two are the ones with a
  single free edge: a chief's upper edge and a bordure's outer one are the shield's own outline,
  which no blazon modifies, so their teeth are all on the one side and the band is deeper where a
  tooth reaches and shallower where a notch does — "le chef ne peut être engrêlé que dans sa ligne
  basse". Every other band cut by a saw keeps its width, both its edges being cut alike. The bar
  gemel, the cross and the saltire take none of the four in any blazon here, though the armorials
  write them — "D'argent, au sautoir denché de sable", and the engrêlé is said of the croix and the
  sautoir in the same breath: teeth cannot yet be cut in a bar that narrow, nor where two limbs
  meet. Which way the teeth point is said by the armorials — "à trois fasces denchées d'or, les
  pointes en bas" — and is not read.

- **Attributes (4)** — stoned: the stone set in a ring; armed: the claws of a beast; langued: its
  tongue; crowned: the crown it wears, a ducal coronet unless a blazon names another and none can
  be named here. An attribute is not a modifier. A modifier changes what is left of the figure and the
  whole of what is left is painted in the charge's one tincture; an attribute takes nothing away and
  names a part the figure already has, so it carries a tincture of its own and a charge bears as
  many of them at once as it has parts to name — a lion is armed and langued in the one blazon.
  Written last of all, after the tincture the charge itself carries, which is where the armorials of
  both tongues put it — "Gules, three gem-rings argent stoned azure", "au lion de sinople armé et
  lampassé de gueules" — and owed a tincture there, a word that named the part and not its colour
  saying nothing. Parts of one colour are one run: the words are said as a list — the mark between all
  but the last two, the conjunction before the last, "armé, lampassé et couronné d'or" — and the
  tincture once at the end, which is how both dictionaries write it; parts of different colours are
  as many runs, parted by the mark. A blazon may join them with the mark instead — "armé,
  lampassé de gueules" — and is understood. Which charges have which part is declared on the charge,
  so the answer is the same in either tongue: the ring is stoned, the lion is armed, langued and
  crowned, and a billet stoned is refused by name. French agrees every word of the run with the charge, in gender
  and in number, exactly as it agrees a modifier. Where heraldry named the figure with the part
  painted, that name is read and written in place of the plain one: a ring with a stone in it is a
  gem-ring (French anneau). Such a name says the part by being written, as a besant says gold — but
  where a besant says the whole of its tincture, a gem-ring says only that there is a stone, so the
  tincture is still written after it and a blazon that names none has the stone drawn in the hoop's
  own. Whether the plain figure draws the part at all is the figure's own affair: a beast has claws
  whatever a blazon says of them, so a lion no blazon armed is drawn with claws in its own tincture
  and armed paints over them, where a ring has no stone until something says there is one. English names stoned three ways — Parker gives stoned, gemmed and jewelled — and one of the
  three is read.
- **Charges (11)** — annulet, billet, lozenge, roundel, goutte, mullet, fleur-de-lis, cross couped,
  crescent, larme, lion. Some are plain shapes and some are pictures of something; all are borne
  once or in number, and any of them may be sown over a plain field instead. They
  share the ordinaries' list and their order, so what is blazoned last is drawn over the rest. Where
  they stand on the field — the disposition — is not read. The roundel is the one whose name carries
  its tincture: English calls the gold one a besant and the red one a torteau, French tells the
  metal disc from the coloured one, and a name that means a tincture is written without it and
  refuses any other. The mullet is the French étoile — a star of five straight rays, which both
  tongues understand where the blazon counts none — and not the estoile, which has six and draws
  them wavy. The fleur-de-lis is spelled four ways by the armorials, hyphenated or not and ending
  in either letter, and all four are read. The cross couped is the French croisette — the ordinary's
  own figure made small — and is not the crosslet, whose arms are themselves crossed; it shares its
  first word with the ordinary, and which was meant is settled by what follows. The larme is the
  tear, which French keeps apart from the goutte on purpose — a round foot with a waving tail drawn
  out of the top of it, where the drop falls straight to the point it ends in — and it is the one
  figure here that English names no word of its own for: Parker files Larmes as nothing but a
  pointer back to his Gouttes, so the French word is read and written in either tongue. The annulet
  is the one whose name carries a part of the figure: English reads the ring and the gem-ring beside
  it, French the annelet and the anneau, and the second of each pair is the ring with a stone set in
  it. The lion is the first of the beasts, and is rampant: reared on its hind paws, head in profile,
  tail turned up over the back and tufted. That is the posture a blazon naming none means — "le Lion
  dans sa position naturelle est rampant" — and it is the only one, passant and couchant and the
  rest being a vocabulary of postures this does not read. Its claws and its tongue may be painted
  apart from the rest of it. It is drawn three fifths bigger than the spot a charge is given, a
  beast spending most of its box on the air between its legs where a disc fills its own, and it is
  the one figure that is modelled: the folio it is traced from paints it in two greens rather than
  one, and without the second a lion is a blot of one colour with its limbs lost in it. The marks of
  the second are washed over it in middle grey, which tells on a light tincture and a dark one alike
  where a black wash would vanish on sable. They say nothing — heraldry knows a flat paint and no
  shades — so the hatching draws none of them, every mark on a hatched shield being a tincture
  named.
- **Laid over all (1)** — a band or a charge may be said to lie over everything else the field
  bears: "brochant sur le tout", "over all a bend gules". The order a blazon names things in
  already says which covers which, so said of whatever was named last the words repeat it; what
  they buy is the other case, where what covers is named before what it covers and the order alone
  would have drawn it underneath. It is no modifier — nothing about the figure changes, only what
  it is drawn over — and no term, naming nothing, so the model carries it beside what is borne
  rather than among the vocabularies. The two tongues put it in different places: French writes its
  participle after the tincture and reads the bare "brochant" as readily as the whole phrase,
  English writes "over all" in front of the whole bearing. It is written back wherever the blazon
  said it, redundant or not. What is not read is the phrase that names the one thing covered —
  "brochant sur le coupé" — which needs a blazon able to point at something already named.
- **Sown fields** — any charge may be sown over a field of one tincture instead of borne on it:
  "semé de billettes d'or", "semy of billets or". It is the field's own state rather than something
  the field bears, so nothing is counted and a band blazoned after it covers the sowing. Where the
  language names the strewing it is written by that name — billeté, billetty, besanté, bezanty —
  and the name carries its tincture exactly as a charge's does. One figure only: a field sown with
  two alternately is a second list and is not read. A plain field only — which is no bar to sowing
  half of a divided field, a half being arms with a plain field of its own: both tongues say which
  half is sown and both are read. A sowing laid over a divided field entire is what no tongue says
  here, and nothing holds one.
- **Plain** — French may call a bare field plain, and the parser holds it to it: a field called
  plain that then bears something is refused. The word adds nothing to the model and is never
  written back. English is given no equivalent — Parker's "plain" is a band with a straight line —
  and "plein" is another word about another thing.
- **Counterchanging (1)** — a band may take the field's own two tinctures instead of naming one,
  reversed: every part of it is painted the opposite of the part of the field beneath it, so a band
  crossing the partition comes out cut by it and a band lying wholly in one half comes out wholly
  of the other half's tincture. One term for what English says in a word — counterchanged — and
  French in a phrase it spells two ways, "de l'un à l'autre" and "de l'un en l'autre". Both are
  read and the first is written: the dictionaries variously make the second the same thing or its
  opposite, so the model takes no side and lets the shape of the figure answer what the phrases
  argue over — which is what Parker already does, quoting the pair as one word. Said of a band or a
  charge, and of several at once: each falls where it falls and each comes out the opposite of what
  it fell on. What it needs is a field divided between two tinctures, a quartering among them — its two pairs
  of quarters stand for the two halves, so a cross counterchanged over a quarterly field comes out
  of whichever quarter each arm lies in. A varied field is cut from two tinctures as well and is
  refused, being cut into a row rather than by a line — and it needs a name that has not already
  said what the figure is painted with: a besant is a gold coin, so a counterchanged besant is
  refused by the rule that refuses an azure one, and French, naming the metal disc and the coloured
  one and nothing between, cannot counterchange a disc at all. Where the charges stand is the
  disposition and is not read, so several counterchanged charges fall where the drawer puts them.
  It is not a tincture and is never one — a colouring answers for the tinctures, and what this is
  painted with is known only once the field is.
- **Languages (2)** — French and English, both reading and writing. French agrees its article with
  the word it introduces, elision included — "à la billette", "au losange", "à l'annelet"; English
  chooses "a" or "an".
- **Colourings (2)** — a colour model and the monochrome hatching convention. A colouring answers for
  the shades only — the metals and the colours — plus the ink it draws marks in. The furs are figures
  and are drawn by the drawer, so vair is vairy of argent and azure and ermine is argent strewn with
  sable. A shade's paint is either a flat colour or a pattern.

Constraints and facts future work must preserve:

- A blazon is a field — plain, sown with a charge, or cut between two of them — with whatever bands
  are laid on it and whatever charges it bears. A half of a divided field is a blazon by the same
  reckoning, and is held in the same type: it has a field and it may bear things. Nothing may be
  charged upon a charge, no line but the straight one is drawn, and no disposition is read.
- What a band is painted with is not always a tincture. A band may take the field's, reversed, so
  the model holds that beside the tinctures rather than among them: every record keyed on a tincture
  — the colourings above all — answers for shades and must never be asked about this.
- The rule of tincture (metal may not lie on metal, nor colour on colour) is why the tinctures carry
  three ranks. The furs answer to neither rank.
- Heraldry fixes no shade. Colours are supplied to the drawer, never assumed by it. A fur's figure is
  not a shade — an ermine spot is the same spot in every armorial — so the figures belong to the
  drawer and only what they are cut from is supplied.
- French elision depends on the word, not its spelling — "d'hermine" but "de hérisson" — so mute-h
  words are named rather than inferred. Gender is declared the same way, and a word heraldry and the
  language at large disagree about — "la losange" against "le losange" — is read under either
  article and written back in the one it declares.

**Scope is explicitly undecided.** The vocabulary grows as curiosity holds; there is no committed
roadmap toward full blazon. Pages must state what is supported and must not promise what is coming.

## Evidence on Hand

- The working library itself: parser, writer and drawer, with 2184 passing tests. Any claim a page makes
  can be demonstrated live rather than asserted.
- The lion is traced from the arms of Gallegantin le Gallois in the armorial of the Knights of the
  Round Table, Bibliothèque nationale de France ms. fr. 12597 folio 62 recto
  (`https://gallica.bnf.fr/ark:/12148/btv1b71000160/f125.item`), whose text blazons them "parti d'or
  et de sable a ung lyon de sinople arme et langue de gueulles". The outline is the painter's, not
  this library's: a beast invented here would be an opinion about what a lion looks like.
- Tincture shades and hatching marks are taken from Wikipedia's own tables
  (`https://en.wikipedia.org/wiki/Tincture_(heraldry)`, `https://en.wikipedia.org/wiki/Hatching_(heraldry)`),
  recorded in `src/infra/colours/`. Cited, not invented.
- The existing page copy is written by someone who knows the subject ("The first tincture named takes
  the half in chief"). Recorded as an observed asset of the committed content; the user has not made
  this voice a binding constraint.
- **Absent, and not to be fabricated:** there are no users, no testimonials, no downloads, no
  benchmarks, no case studies, no institutional affiliation and no license claims beyond MIT.

## Product Principles

1. **Serve both readers in one artefact.** Every term shown is simultaneously a citable input string
   and an explained convention. Splitting into a developer page and a learner page would be a failure.
2. **Say what is supported; promise nothing.** With scope undecided, the pages state today's vocabulary
   plainly and never imply a roadmap.
3. **Demonstrate rather than assert.** The library can prove every claim a page makes; a page that
   states a convention without showing it is wasting what it is built on.
4. **The domain stays language-neutral.** Anything a new language needs is a translation and a grammar,
   never a change to the models or the rules.
5. **Build as though it will be published.** Not yet public is a schedule, not a licence to cut.

## Accessibility & Inclusion

The content is inherently bilingual, so language marking is payload rather than polish: a French term
in an English document must carry `lang="fr"` or a screen reader pronounces it with English phonemes.
No external standard has been set by the user; WCAG AA is the working bar.
