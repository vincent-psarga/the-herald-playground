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
- **Divisions (4)** — per pale, per fess, per bend, per bend sinister.
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
- **Charges (9)** — annulet, billet, lozenge, roundel, goutte, mullet, fleur-de-lis, cross couped,
  crescent. Some are plain shapes and some are pictures of something; all are borne once or in
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
  first word with the ordinary, and which was meant is settled by what follows.
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
- **Counterchanging (1)** — a band may take the field's own two tinctures instead of naming one,
  reversed: every part of it is painted the opposite of the part of the field beneath it, so a band
  crossing the partition comes out cut by it and a band lying wholly in one half comes out wholly
  of the other half's tincture. One term for what English says in a word — counterchanged — and
  French in a phrase it spells two ways, "de l'un à l'autre" and "de l'un en l'autre". Both are
  read and the first is written: the dictionaries variously make the second the same thing or its
  opposite, so the model takes no side and lets the shape of the figure answer what the phrases
  argue over — which is what Parker already does, quoting the pair as one word. A band alone so far, and a field
  divided in two alone: a counterchanged charge and a counterchanged band over a varied field are
  both good heraldry and are both refused by name rather than drawn wrongly. It is not a tincture
  and is never one — a colouring answers for the tinctures, and what this is painted with is known
  only once the field is.
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

- The working library itself: parser, writer and drawer, with 1680 passing tests. Any claim a page makes
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
