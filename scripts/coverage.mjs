/**
 * What the project covers, in a shape a later run can be compared against: how
 * many tests it holds, how much of its own sources those tests reach, and how
 * much of the armorials its parsers can read.
 *
 * The armorials are TypeScript and lean on the library's own sources, so they
 * are loaded through Vite rather than by Node alone. The project already carries
 * Vite for the demo, which spares this a build step and a second copy of the
 * armorials in some other form.
 *
 * The test count is read from the report Vitest leaves behind rather than
 * counted here: the tests are run by the workflow anyway, and counting them
 * twice would let the two answers disagree.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createServer } from 'vite';

const TEST_REPORT = process.argv[2] ?? 'coverage/tests.json';
const OUTPUT = process.argv[3] ?? 'coverage/coverage.json';
const CODE_SUMMARY = process.argv[4] ?? 'coverage/code/coverage-summary.json';

const coverage = {
  tests: testsIn(TEST_REPORT),
  code: codeCoverage(CODE_SUMMARY),
  armorials: await armorialCoverage(),
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(coverage, null, 2)}\n`);
console.log(`Coverage written to ${OUTPUT}:`);
console.log(
  `  ${coverage.tests} tests · ${coverage.armorials.read} of ${coverage.armorials.total} blazons read (${coverage.armorials.percentage}%)`
);
if (coverage.code === undefined) {
  console.log('  No code coverage to read: the suite was run without --coverage.');
} else {
  console.log(
    `  ${coverage.code.statements.percentage}% of statements and ${coverage.code.branches.percentage}% of branches reached`
  );
}

function testsIn(path) {
  let report;
  try {
    report = JSON.parse(readFileSync(path, 'utf8'));
  } catch (cause) {
    throw new Error(
      `No test report at ${path}. Run: npm test -- --reporter=default --reporter=json --outputFile.json=${path}`,
      { cause }
    );
  }
  return report.numTotalTests;
}

/**
 * How much of the library the suite reaches, taken from the summary Vitest
 * leaves behind. Measuring it here is not on offer: it is a reading of the run
 * itself, and there is no run to read once the suite has finished.
 *
 * A suite run without `--coverage` leaves no summary, and that is not a failure
 * worth stopping for: the armorial figures are wanted either way, and a reading
 * that is missing says so rather than passing nought off as a measurement.
 */
function codeCoverage(path) {
  let summary;
  try {
    summary = JSON.parse(readFileSync(path, 'utf8')).total;
  } catch {
    return undefined;
  }
  // The order the summary table prints them in, which is the order a reader of
  // these figures elsewhere will already have met them in.
  const metrics = ['statements', 'branches', 'functions', 'lines'];
  return Object.fromEntries(
    metrics.map((metric) => {
      const { covered, total } = summary[metric];
      return [metric, { covered, total, percentage: percentage(covered, total) }];
    })
  );
}

async function armorialCoverage() {
  // Middleware mode with no config file: nothing is served and nothing of the
  // demo's own build is wanted, only Vite's reading of TypeScript.
  const vite = await createServer({
    configFile: false,
    logLevel: 'warn',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const { EnglishBlazonParser, FrenchBlazonParser, Languages, readArmorial } =
      await vite.ssrLoadModule('/src/index.ts');
    const { ARMORIALS } = await vite.ssrLoadModule('/demo/armorials/index.ts');

    // An armorial names the tongue it is written in, and is read by the parser
    // of that tongue: read by the other, every entry would refuse. Keyed on the
    // model's own names for the tongues rather than on names of this script's
    // own, which once drifted from them and had every armorial read as nought.
    const parsers = {
      [Languages.fr]: new FrenchBlazonParser(),
      [Languages.en]: new EnglishBlazonParser(),
    };
    const armorials = ARMORIALS.map((armorial) => {
      const { read, total } = readArmorial(armorial, parsers[armorial.language]);
      return {
        slug: armorial.slug,
        name: armorial.name,
        read,
        total,
        percentage: percentage(read, total),
      };
    });

    const read = sum(armorials.map((armorial) => armorial.read));
    const total = sum(armorials.map((armorial) => armorial.total));
    return { read, total, percentage: percentage(read, total), each: armorials };
  } finally {
    await vite.close();
  }
}

/**
 * A share, to one decimal. The demo rounds to a whole percent, which reads
 * better on a page; a tenth is kept here so that a handful of entries won over
 * a large armorial still shows as a change rather than as standing still.
 */
function percentage(read, total) {
  return total === 0 ? 0 : Math.round((read / total) * 1000) / 10;
}

function sum(numbers) {
  return numbers.reduce((running, one) => running + one, 0);
}
