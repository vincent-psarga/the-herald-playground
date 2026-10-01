import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'demo/**/*.test.ts',
      'demo/**/*.test.tsx',
      'scripts/**/*.test.ts',
    ],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      // Its own directory under coverage/: Vitest empties the one it reports
      // into, and the armorial figures alongside it are not its to throw away.
      reportsDirectory: 'coverage/code',
      // text for whoever ran it, html for the report a run keeps, and
      // json-summary for the one figure the comparison needs.
      reporter: ['text', 'html', 'json-summary'],
      // The library is what the suite is measured against. The demo is a
      // showing of it, and the armorials are transcriptions rather than code,
      // so neither belongs in a figure meant to say how well the parser is
      // tested.
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
