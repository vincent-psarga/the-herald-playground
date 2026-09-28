# the-herald-playground

A parser for heraldic blazons, built on [typescript-parsec](https://github.com/microsoft/ts-parsec).
A demo is available at [vincent-psarga.github.io/the-herald-playground/](https://vincent-psarga.github.io/the-herald-playground/).

## About the project

This is more a side-project than a library really meant to be used "for real". It will not cover all heraldic language and is not meant to replace tools such as [DrawShield](https://drawshield.net/) (which does a way better job).

The main drives behind this project are:

- studying heraldry and the differences between the English and French vocabularies and grammars
- testing new ways to work with coding agents outside my real work (with no impact, a smaller codebase and a target which is well-documented, but can also be quite contradictory (and also has sources in old French and old English, which is quite rare :D ))

Adding support for new words is mainly driven by:

- Grammar before vocabulary: given the choice, I'd rather support new grammar than complete parts of the existing dictionary (that's why, for example, only 5 divisions are supported so far)
- Armorial Driven Development: the [armorials](https://vincent-psarga.github.io/the-herald-playground/armorials) provide many unsupported blazons
- supporting weird cases where French and English have mismatches

What will not be supported:

- "modern" charges (no "Azure, two platypuses or"). Note: anything past 1477 and the death of Charles the Bold is considered modern
- anything outside the shield itself (crown, supporter etc)
- a non-opiniated parser: the blazon given should respect the blazon grammar but also the French or English grammar (using correct accentueted letters, plurals etc).
- support for old English/French (eg: "d'or ung faulx crois de goules")

For the rendering of a blazon, this is not the real focus of the app (once again, the grammar is more important). This is more a way to quickly check that the parsing is done correctly (surprisingly, a visual shield is more appealing than a JSON file). It may support complex shapes in the future (like dragons and lions certainly), although they may not be amazing to look at. Once again, there are great tools that do this better (such as [DrawShield](https://drawshield.net/)).

### About sources

This project (as my understanding of heraldry in general) comes mostly from second-hand sources such as Wikipedia; I don't own many books about heraldry.

The documentation (especially the vocabularies) in the demo is not meant to become a reference about heraldry. The point of this page is to work out the best way to present the vocabulary (as complex as it can be, considering all the potential links between the items).

The documentation pages may state incorrect things, which I (or my coding agent) may have misunderstood. When decisions had to be taken about how a blazon is parsed or rewritten, the [conventions](https://vincent-psarga.github.io/the-herald-playground/doc/conventions) page should show which sources have been used to take the decision.

### About AI usage

This project relies a lot on AI (not surprising considering my second motivation is to work out new ways to work with coding agents...).

That being said, it's not "simply" a vibe-coded clone of the other attempts to write a parser.

## Setup

```bash
npm install
```

## Scripts

| Script                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `npm run build`         | Compile `src/` to `lib/` (declarations + source maps)       |
| `npm run dev`           | Serve the demo page at http://localhost:5173                |
| `npm test`              | Run the Vitest suite once                                   |
| `npm run test:watch`    | Run Vitest in watch mode                                    |
| `npm run test:coverage` | Run the suite and report how much of `src/` it reaches      |
| `npm run coverage`      | Run the suite, then measure what it and the armorials cover |
| `npm run typecheck`     | Type-check everything, tests included, without emitting     |
| `npm run format`        | Format the tree with Prettier                               |
| `npm run format:check`  | Report anything Prettier would reformat                     |
| `npm run clean`         | Remove `lib/`                                               |

A Husky pre-commit hook formats the staged files with `pretty-quick`, then runs
`npm run typecheck` and `npm test`. What lands is therefore always formatted,
type-clean and green. It is installed by `npm install`, through the `prepare`
script.

Every run of the Quality workflow keeps the figures `npm run coverage` produces —
how many tests there are, how much of `src/` they reach, and how many of the
armorials' blazons the parser can read — and its summary shows what moved since
the last run on `main`. A pull request is held against `main` rather than against
its own earlier pushes, so what it reports is what merging would change. Nothing
there fails a run: the figures are evidence of where the parser stands, not a bar
it has to clear.

Code coverage is measured over `src/` alone, by `@vitest/coverage-v8`. The demo
is a showing of the library rather than the thing under test, and the armorials
are transcriptions rather than code, so neither is counted. `npm run test:coverage`
is the same reading, locally. The line-by-line report the run produces is kept as
the `code-coverage-report` artifact, for when the figure is not enough and what
is wanted is which lines.

## Toolchain notes

- TypeScript 7 — `tsconfig.json` uses `module`/`moduleResolution: nodenext`; the `node10`
  resolution mode was removed in TS 7.
- Vitest transforms TS with esbuild and does **not** type-check. `tsconfig.json` excludes
  test files so they stay out of `lib/`; `tsconfig.test.json` adds them back, along with
  `demo/`, so `npm run typecheck` still covers them. Run it in CI alongside `npm test`.
- `tsconfig.json` builds `src/` alone and compiles no JSX, but it keeps `jsx: react-jsx`:
  Vite and Vitest read that setting from the nearest tsconfig when transforming the demo,
  and there is no `tsconfig.json` under `demo/`.

## Licence

The source is MIT; see `LICENSE`.

The demo self-hosts **Archivo Narrow** (Omnibus-Type) under the SIL Open Font
License 1.1, which is a separate licence from this project's — see
`demo/fonts/OFL.txt`. The font is used only by the demo, and `package.json` ships
`lib` alone, so the published package contains no font.
