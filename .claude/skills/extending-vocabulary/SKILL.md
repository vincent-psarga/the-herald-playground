---
name: extending-vocabulary
description: Add to what the parser reads — a charge, a modifier, an ordinary, a tincture, a division, a strewing — or grow the vocabulary just enough to carry a new grammar capability. Use whenever a word the parser does not read is to be read, whenever an existing word is to be said of something it is not said of yet, and whenever a blazon is refused because the model holds no term for what it names. Not for settling how a term comes back out, which is [writing-decision].
---

# Extending the vocabulary

The model holds terms, the two tongues hold words, and heraldry holds neither: it
holds armorials that wrote what they wrote. A term added in the wrong shape is
expensive — every translation, every strewing, every drawing is keyed on the
enum, so the shape is settled once and paid for everywhere.

Two laws govern the whole of it.

**One term per figure, however many names it has.** A besant and a tourteau are
one roundel; a mascle and a rustre are one lozenge; a croisette and a croix
alésée are one cross. If two names come back as the same drawing, they are words
of one term. If they differ only in what was done to the figure, that is a
modifier and not a second term.

**The smallest vocabulary that reads the blazon.** A charge that heraldry will
take a dozen modifiers on arrives taking none of them. A grammar capability
arrives with the fewest words that exercise it. What is left out is left out on
purpose and can be added the day an armorial asks for it; what is put in is
carried for ever, in two tongues, on two documentation pages.

## 1. Research both tongues before writing anything

Neither tongue decides the model alone, and what one keeps in a word the other
keeps in two. Ask all of this of French and of English, and write the answers
down before opening a source file:

- **Every spelling the armorials write.** Hyphens, final letters, the lot. A
  spelling that differs in nothing but a hyphen is an `alternateWording` on the
  one word, never a word of its own — but vairy and vairé are two words, and
  saying otherwise would tell a reader something false.
- **French agreement.** Gender, elision, plural: `à la billette`, `à l'annelet`,
  `à trois croix`. The article agrees with the word, so the word carries it.
- **A name per tincture.** English names the disc six ways and French twice. If
  the tongue does that, each name is a `Word` with `defaultTincture`, and the
  plain word is what is left for the tinctures it named none for.
- **A name for the combination** of this figure and something said of it — see
  step 4, which is where that is paid for.
- **A name for a field sown with it.** `billetty`, `billeté`, `semy-de-lis`. If
  the tongue has none, that is an answer: the `Strewings` record takes
  `undefined` and a comment saying why. Beware the near-misses — `lozengy` and
  `losangé` cut a field into lozenges rather than sow it with them, `crusily` is
  sown with crosslets, `fleurdelisé` says a figure ends in lilies. Borrowing one
  promises a drawing this does not draw.
- **A word kept for particular charges.** French voids the star with `évidé` and
  everything else with `vidé`. That is `saidOf` on the word, not a term.

Quote the dictionary verbatim into the comment you are about to write — Parker's
_Glossary_, blason-armoiries.org, Greaves' _A Guide to Blazonry_ — and check the
sentence says what you remember it saying. A tongue that has no word for the
thing is a finding, and is written down as one.

## 2. Name the minimum, and say what you left out

Before the first edit, state: the terms added, the modifiers each will take, the
words each tongue spells them with, and the strewings. Anything a source shows
but that is not going in — a modifier nobody asked for, a name for a figure that
cannot be drawn apart from the plain one — is named out loud as left out rather
than silently dropped. A modifier goes on a charge only when a source writes it
of that charge **and** the drawing can be told from the plain figure. A source is
any armorial, roll or dictionary — not only the armorials this project carries:
those say what to read first, not what heraldry allows.

The minimum is the minimum of _new things_: terms, modifiers, words. It is never
a reason to apply a new modifier to fewer of the existing figures than the
sources allow — that is settled by step 4, item by item, and nowhere else.

When the work is a grammar capability rather than a term, the vocabulary added is
whatever proves the rule and nothing more: one charge, one modifier, one article.
The rest of the dictionary is a separate piece of work — the README says as much.

## 3. The model first, then follow the compiler

`src/domain/models/` is where the term lives and where what may be said of it is
declared: `ChargeType` and its `ChargeDefinitions` entry, with `allowedModifiers`
and, where the figure is not itself until something has been said of it,
`onlyUnder`; `OrdinaryType` and its `OrdinaryDefinitions` entry, with
`canBeBorneInNumbers`. It is declared in the model and not in a vocabulary
because the answer is the same in every tongue: an annelet is no more voidable
than an annulet, and a third chief is no likelier in English than in French.

Every `Record` in the codebase is keyed on the enum's values, so `npm run
typecheck` names every place that has not caught up — both `Charges.ts`, both
`Strewings.ts`, the drawer's `CHARGES`. That list is the compiler's to give and
is not repeated here; work it to zero.

## 4. Cross the new term with the old — both ways

This is the step that gets skipped, and the reviewer's first question.

- **A new modifier** — or anything said of a figure in its place, as compony is
  said of a band where its tincture would be: walk **every** existing figure it
  could be said of — every charge, every ordinary — and decide each one. The
  default is yes: a figure takes it unless there is a reason it does not.
  - A **yes** cites its source — an attested blazon, or a dictionary naming that
    figure — and gets a drawing. A yes the drawing cannot show yet is not a no:
    draw it.
  - A **no** writes its reason in the comment at the figure's definition, where
    the next reader looks: the annulet is a roundel voided already, and voiding
    one again names no figure. "No armorial in the demo writes it" is not a
    reason.
  - Where the sources **disagree**, decide, say which way and why at the same
    place, and quote both.
  - Where a yes needs a number or a placement no source gives, choose one, and
    say at the definition that it was chosen here.

  List every figure and its answer before writing code, as a table: nothing is
  left out by not being looked at.

- **A new charge**: walk every existing modifier and ask the same of it.
- **A new word of an existing term**: ask which charges it is written of, and
  whether it takes one off the word that had it.

Then take each pair you allowed and ask step 1's combination question of it again,
now with a definite list in hand.

## 5. Combination words are words, not terms

Where a tongue names the pair, the tongue gets a `Word` carrying what the name
already says — `defaultModifier` for `mascle`, `macle`, `rustre`, `molette`,
`croisette`; `defaultTincture` for `besant`, `plate`, `torteau`. The canonical
word goes first in the list, and `wordIn` picks the one meaning what was said.
Where a tongue names no such pair, say so in the comment and let the modifier be
written after the name in the ordinary way — English has no word for the pierced
star, and that is how a tongue with no name for a figure blazons it.

Every such name must read as well as write: the word is read of the charge, and a
blazon that writes the modifier after a name already meaning it is understood
rather than refused.

## 6. Draw it, and draw what may be said of it

`src/application/drawer/svg/shapes/` holds the geometry and
`vocabulary/charges/<term>.ts` builds the figure with `charge(at, modified)` — one
drawing for the plain figure and one per modifier it takes. A modifier allowed in
the model with no drawing here is a promise the drawer breaks. If the difference
cannot be drawn, the modifier does not belong on the charge.

## 7. Touch the grammar only where the words cannot be read without it

The lexer already reads a hyphenated name as one word and the term combinator
already steps through the `de` inside `fleur de lys`; French articles and
agreements come off `FrenchWord`. Read the new word with what is there first, and
where it genuinely cannot be read, add the least that reads it and say in the
comment which word asked for it.

## 8. Test both tongues, and test across them

Follow `NewCharges.test.ts` and `Modifiers.test.ts`. A term is not read until all
of these say so:

- borne alone and borne in number, in each tongue;
- the French article and agreement — gender, elision, plural — and a wrong
  agreement refused by name;
- parsed in one tongue and written in the other, which is what the library is for;
- sown, or both tongues saying the sowing in as many words;
- every combination word read and written, with and without the modifier after it;
- the refusals: a pair the model does not allow is refused, and a test says so.

## 9. The documentation follows the word

What a word means is carried on the `Word`, so the vocabulary pages and their
counts build themselves — which makes the description part of the code and not an
afterthought. Then:

- **PRODUCT.md** — the capability list holds counts and a paragraph per rank.
- **TODO.md** — strike what is now done.
- **`/doc/conventions`** — if the writer now chooses among forms heraldry leaves
  open, that is a writing decision: use the `writing-decision` skill.
- **`src/index.ts`** — if the work added a helper a consumer needs.
- A whole new **rank** of word costs more than a word: `Rank`, the page's
  `SEVERAL`, and how such an entry shows its arms in `demo/utils/Vocabulary.ts`.

## 10. Run it, and look at it

`npm test`, `npm run typecheck`, `npx prettier --check .`. Then `npm run dev` and
read the word on `/doc/vocabulary/fr` and `/doc/vocabulary/en`: the arms are drawn
from the parser and the writer as the page renders, so a word that reads wrong
shows itself there and nowhere else.
