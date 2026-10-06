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
- **Divisions (6)** — per pale, per fess, per bend, per bend sinister, and the two that cut the
  field by a line crossing itself: quarterly (French écartelé), the pale and the fess together, its
  quarters standing square; and per saltire (French écartelé en sautoir), the bend and the bend
  sinister together, its quarters standing on their points. Either way the field is cut into four
  and painted in two, the first tincture taking the pair in chief and in base — which for quarterly
  is the quarters numbered 1 and 4. Only that simplest quartering is read. A shield whose quarters
  each carry a coat of their own is a different blazon and needs a field able to hold a coat.
  English names one of the pair after the quarters and the other after its line; French calls both
  écartelé and says which by adding words, so the longer name has to win over the shorter one it
  begins with.
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

- **Charges (10)** — annulet, billet, lozenge, roundel, goutte, mullet, fleur-de-lis, cross couped,
  crescent, larme. Some are plain shapes and some are pictures of something; all are borne once or in
  number, and any of them may be sown over a plain field instead. They
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
  pointer back to his Gouttes, so the French word is read and written in either tongue.
- **Sown fields** — any charge may be sown over a field of one tincture instead of borne on it:
  "semé de billettes d'or", "semy of billets or". It is the field's own state rather than something
  the field bears, so nothing is counted and a band blazoned after it covers the sowing. Where the
  language names the strewing it is written by that name — billeté, billetty, besanté, bezanty —
  and the name carries its tincture exactly as a charge's does. One figure only: a field sown with
  two alternately is a second list and is not read. A plain field only: which half of a divided one
  was sown is said in words this does not read.
- **Plain** — French may call a bare field plain, and the parser holds it to it: a field called
  plain that then bears something is refused. The word adds nothing to the model and is never
  written back. English is given no equivalent — Parker's "plain" is a band with a straight line —
  and "plein" is another word about another thing.
- **Languages (2)** — French and English, both reading and writing. French agrees its article with
  the word it introduces, elision included — "à la billette", "au losange", "à l'annelet"; English
  chooses "a" or "an".
- **Colourings (2)** — a colour model and the monochrome hatching convention. A colouring answers for
  the shades only — the metals and the colours — plus the ink it draws marks in. The furs are figures
  and are drawn by the drawer, so vair is vairy of argent and azure and ermine is argent strewn with
  sable. A shade's paint is either a flat colour or a pattern.

Constraints and facts future work must preserve:

- A blazon is a field, plain or divided between two tinctures or sown with a charge, with whatever
  bands are laid on it and whatever charges it bears. Nothing may be charged upon a charge, no line
  but the straight one is drawn, and no disposition is read.
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

- The working library itself: parser, writer and drawer, with 1828 passing tests. Any claim a page makes
  can be demonstrated live rather than asserted.
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
