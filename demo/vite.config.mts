import { defineConfig } from 'vite';
import { decks } from './DeckPlugin.mjs';

/**
 * Nothing in the demo needs a build step of its own except the decks, which are
 * written in MDX. So this file exists for them, and says only that.
 */
export default defineConfig({
  plugins: [decks()],
});
