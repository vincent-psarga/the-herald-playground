# Working in this repository

## Git workflow

Branches, pushes and pull requests are the user's to make, not yours. This holds
in every session; `.claude/hooks/git-workflow-policy.sh` states at session start
which of the two cases below applies.

- **Never create or switch branches** unless the user explicitly asks for one.
  Work on the branch that is already checked out — usually `main`.
- **Never push** and **never open a pull request.**

On the **user's machine**: commit freely on the current branch. Leave the pushing
to the user.

On a **cloud session**: pushing and opening a PR are blocked for this repository
on purpose. Do not attempt either, and do not spend a paragraph explaining how
the user might unblock it — a refusal there is the expected outcome, not a
failure to diagnose. Commit on the current branch, then hand back a patch the
user can apply locally:

```
git format-patch <base>..HEAD --stdout
```

Put that output in the final message inside a fenced `diff` block, together with
the `git apply` command. If the patch is too large to show whole, say so, name
the files it touches, and show the parts that matter.

## Code map

Read this instead of re-surveying the tree. It names roles and seams, not every
file; `ls` gives the rest. `README.md` covers scripts and tooling, `PRODUCT.md`
the audiences, `TODO.md` what is planned.

### The pipeline

```
text ─▶ lexer ─▶ parser (shared rule + one language) ─▶ Blazon ─┬▶ writer (either language)
                                                                └▶ SVG drawer
```

The `Blazon` model is language-neutral. Nothing between the parser and the
writer knows which language it came from, and translating is just parsing in
one language and writing in the other.

### `src/` — the library (`src/index.ts` is the public surface)

- `domain/models/`: the model. `Blazon` is a `Field` plus an ordered list of
  `chargesOrOrdinaries` (the order is the layering). `Field` is plain, divided,
  varied or furred. `ChargeType`, `OrdinaryType`, `Modifier` and the tincture
  enums are the **terms**, and the `*Definitions` records hold what the model
  knows about each one (allowed modifiers, usual pieces…).
- `domain/translations/{fr,en}/`: the **words**. Each file is a
  `Translation<Enum, Word>`, a record keyed on an enum's values, so adding a
  term breaks every translation, wording and drawing that hasn't caught up.
  Follow the compiler errors. The first spelling is the one written back.
  `Word` carries the `description` and sources the vocabulary pages print, and
  `FrenchWord` adds gender and elision. `Sources.ts` builds citation URLs.
- `domain/errors/parsing/`: one `BlazonParseError` subclass per kind of
  refusal (unknown term, wrong article, wrong agreement…).
- `domain/services/`: the three interfaces, `IBlazonParser`, `IBlazonWriter`
  and `IBlazonDrawer`.
- `application/lexer/Lexer.ts`: the typescript-parsec tokens. Rule order matters.
- `application/parser/`: the **language-neutral grammar**. `BlazonGrammar.ts`
  defines the `BlazonGrammar` interface a language fills in, plus `blazonRule`.
  `Parser.ts#parseWith` runs a rule and demands a single reading. The helpers
  are `Borne` (what a field bears and its count), `Treatment` (plain/semy),
  `Variations`, `Modifiers`, `Numbers` and `Combinators`. `Failures.ts` makes
  a complaint travel as data beside the parse error and throws it only once
  every branch has failed. Never throw inside a branch; use `guard`. The
  `French/EnglishBlazonParser` classes are thin wrappers.
- `application/french/`, `application/english/`: each language's
  `*BlazonGrammar` (reading), `*BlazonWording` (writing) and `*Grammar`
  (articles, agreement, elision). French parsing tests live here, by topic.
- `application/writer/`: `BlazonWording.ts` is the shared sentence builder
  (`writeBlazon`) and the counterpart of `BlazonGrammar`. Writer classes are
  thin wrappers. Every normalisation the writer makes is a decision for
  `/writing-decision`.
- `application/drawer/svg/`: `Arms.ts` is the only place the model meets the
  drawing. `vocabulary/` holds one figure per term (charges, ordinaries,
  coverings for divisions, variations and furs, tinctures), each in a `Record`
  keyed on the enum. `shapes/` and `painting/` are pure geometry with no
  heraldry in them. `Ground.ts` holds the frame a figure measures itself
  against.
- `application/armorial/`: `readArmorial` runs a whole armorial through a
  parser and records what was read and what was refused.
- `infra/colours/`: the `ColorModel`s (Wikipedia colours, monochrome hatching).

### `demo/`: the React/Vite site (`npm run dev`)

- `App.tsx` holds the routes: `/` reads a blazon, `/doc/vocabulary/:language`,
  `/doc/conventions`, `/armorials` and `/armorial/:slug`, plus `/pr-preview`.
- `pages/ConventionsPage.tsx`: its `RULES` array documents every writing
  decision.
- `pages/VocabularyPage.tsx` with `utils/Vocabulary.ts` renders the
  translations' `Word`s, so the description text lives in `src/`.
- `armorials/`: real blazons transcribed as `Armorial`s. They are the test bed
  for what the parser can and cannot read yet.

### Elsewhere

- `scripts/`: CI helpers for coverage figures, the "newly read blazons" PR
  comment and the list of open PRs shown in the demo.
- `tooling/mcp/vocabulary/`: the `define` MCP server, built on the same entries
  as the vocabulary page.
- `.claude/`: the skills `extending-vocabulary` (adding a term end to end),
  `writing-decision` and `writing-prose`, plus the `the-archivist` agent for
  heraldic research.

### Conventions worth knowing up front

- Tests sit beside their source as `*.test.ts(x)` and run under Vitest
  (jsdom for the demo). Whole-blazon round trips live in the parser and writer
  tests.
- Comments and doc-strings explain _why_, in full sentences, often citing
  heraldic usage. New code keeps that voice.
- The pre-commit hook formats, type-checks and runs the whole suite, so a
  commit that lands is green.
