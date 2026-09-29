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
- **Modifiers (2)** — voided: the charge's middle taken out, so the field shows through the outline;
  and pierced: a round hole punched through it, the rest of the charge left as it was. Two things
  and not one said twice, whatever the dictionaries' filing — a billette percée is not a billette
  vidée, and the two are drawn differently because they are different. Written between the charge
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
- **Attributes (3)** — stoned: the stone set in a ring; armed: the claws of a beast; langued: its
  tongue. An attribute is not a modifier. A modifier changes what is left of the figure and the
  whole of what is left is painted in the charge's one tincture; an attribute takes nothing away and
  names a part the figure already has, so it carries a tincture of its own and a charge bears as
  many of them at once as it has parts to name — a lion is armed and langued in the one blazon.
  Written last of all, after the tincture the charge itself carries, which is where the armorials of
  both tongues put it — "Gules, three gem-rings argent stoned azure", "au lion de sinople armé et
  lampassé de gueules" — and owed a tincture there, a word that named the part and not its colour
  saying nothing. Two parts of one colour are one run: the words are joined by the conjunction and
  the tincture is said once at the end, which is how both dictionaries write it; two of different
  colours are two runs, parted by the mark. A blazon may join them with the mark instead — "armé,
  lampassé de gueules" — and is understood. Which charges have which part is declared on the charge,
  so the answer is the same in either tongue: the ring is stoned, the lion is armed and langued, and
  a billet stoned is refused by name. French agrees every word of the run with the charge, in gender
  and in number, exactly as it agrees a modifier. Where heraldry named the figure with the part
  painted, that name is read and written in place of the plain one: a ring with a stone in it is a
  gem-ring (French anneau). Such a name says the part by being written, as a besant says gold — but
  where a besant says the whole of its tincture, a gem-ring says only that there is a stone, so the
  tincture is still written after it and a blazon that names none has the stone drawn in the hoop's
  own. Whether the plain figure draws the part at all is the figure's own affair: a beast has claws
  whatever a blazon says of them, so a lion no blazon armed is drawn with claws in its own tincture
  and armed paints over them, where a ring has no stone until something says there is one. English names stoned three ways — Parker gives stoned, gemmed and jewelled — and one of the
  three is read.
- **Charges (10)** — annulet, billet, lozenge, roundel, goutte, mullet, fleur-de-lis, cross couped,
  crescent, lion. Some are plain shapes and some are pictures of something; all are borne once or in
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
  first word with the ordinary, and which was meant is settled by what follows. The annulet is the
  one whose name carries a part of the figure: English reads the ring and the gem-ring beside it,
  French the annelet and the anneau, and the second of each pair is the ring with a stone set in
  it. The lion is the first of the beasts, and is rampant: reared on its hind paws, head in
  profile, tail turned up over the back and tufted. That is the posture a blazon naming none means
  — "le Lion dans sa position naturelle est rampant" — and it is the only one, passant and couchant
  and the rest being a vocabulary of postures this does not read. Its claws and its tongue may be
  painted apart from the rest of it. It is drawn three fifths bigger than the spot a charge is
  given, a beast spending most of its box on the air between its legs where a disc fills its own,
  and it is the one figure that is modelled: the folio it is traced from paints it in two greens
  rather than one, and without the second a lion is a blot of one colour with its limbs lost in it.
  The marks of the second are washed over it in middle grey, which tells on a light tincture and a
  dark one alike where a black wash would vanish on sable. They say nothing — heraldry knows a flat
  paint and no shades — so the hatching draws none of them, every mark on a hatched shield being a
  tincture named.
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

- The working library itself: parser, writer and drawer, with 1809 passing tests. Any claim a page makes
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
