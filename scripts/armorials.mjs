/**
 * The armorials, read by the parser that reads their tongue.
 *
 * The armorials are TypeScript and lean on the library's own sources, so they
 * are loaded through Vite rather than by Node alone. The project already carries
 * Vite for the demo, which spares this a build step and a second copy of the
 * armorials in some other form.
 *
 * Two scripts want this — the one that measures how much is read and the one
 * that says which blazons a branch newly reads — and a second copy of it would
 * be a second chance to disagree about which parser reads which tongue.
 *
 * Vite is reached for where it is used rather than at the head of the file, so
 * that a caller wanting only the pure pieces downstream of this — a run tidying
 * up after a pull request, which installs nothing — is not asked for the
 * dependency it never touches.
 */

/**
 * Every armorial, entry by entry, with what the parser made of each.
 *
 * `draw` comes back beside them because the drawer is loaded with them: a
 * caller that wants the arms of an entry it has in hand would otherwise have to
 * open a second server to be handed the same class. The outline is asked for
 * rather than assumed — a drawing is read against a ground, and the ground is
 * the caller's to know.
 */
export async function readArmorials() {
  const { createServer } = await import('vite');
  // Middleware mode with no config file: nothing is served and nothing of the
  // demo's own build is wanted, only Vite's reading of TypeScript.
  const vite = await createServer({
    configFile: false,
    logLevel: 'warn',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const {
      EnglishBlazonParser,
      FrenchBlazonParser,
      Languages,
      SvgBlazonDrawer,
      WikipediaColours,
      readArmorial,
    } = await vite.ssrLoadModule('/src/index.ts');
    const { ARMORIALS } = await vite.ssrLoadModule('/demo/armorials/index.ts');

    // An armorial names the tongue it is written in, and is read by the parser
    // of that tongue: read by the other, every entry would refuse. The tongues
    // are named off the enum rather than spelled again here — spelled again,
    // they were spelled wrong, and an armorial handed no parser at all scored
    // nought without a word said.
    const parsers = {
      [Languages.fr]: new FrenchBlazonParser(),
      [Languages.en]: new EnglishBlazonParser(),
    };

    const armorials = ARMORIALS.map((armorial) => {
      const parser = parsers[armorial.language];
      if (parser === undefined) {
        throw new Error(`No parser here reads ${armorial.language}, which ${armorial.name} is in.`);
      }
      const { entries } = readArmorial(armorial, parser);
      return {
        slug: armorial.slug,
        name: armorial.name,
        entries: entries.map(({ entry, blazon }) => ({
          slug: entry.slug,
          name: entry.name,
          // The source's own words, which are what was put to the parser.
          blazon: entry.blazon,
          read: blazon,
        })),
      };
    });

    return {
      armorials,
      draw: (blazon, outline) => new SvgBlazonDrawer(WikipediaColours, outline).draw(blazon),
    };
  } finally {
    await vite.close();
  }
}

/** The slugs of the entries that were read, in the order the armorial holds them. */
export function readSlugs(armorial) {
  return armorial.entries.filter(({ read }) => read !== undefined).map(({ slug }) => slug);
}
