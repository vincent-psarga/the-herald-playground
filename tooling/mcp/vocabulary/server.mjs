#!/usr/bin/env node
/**
 * An MCP server answering one question: what does this word of blazon mean?
 *
 * It speaks over stdio, so stdout belongs to the protocol and nothing else may
 * write there; whatever needs saying goes to stderr.
 *
 * The definitions are TypeScript and lean on the library's sources and on the
 * demo's vocabulary, so they are loaded through Vite, as the armorials are by
 * scripts/armorials.mjs, rather than through a build step.
 */
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from 'vite';
import { z } from 'zod';

const root = fileURLToPath(new URL('../../..', import.meta.url));

const vite = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
});
const { definitionsOf } = await vite.ssrLoadModule('/tooling/mcp/vocabulary/Definition.ts');

const server = new McpServer({ name: 'vocabulary', version: '1.0.0' });

server.registerTool(
  'define',
  {
    title: 'Define a word of blazon',
    description:
      'Defines a word of heraldic blazon the library reads, in English or French: what kind of term it is, ' +
      'what it means and who says so, its other spellings and synonyms, its counterpart in the other tongue, ' +
      'the charges it applies to or the modifiers it takes, the tinctures it is held to, and an example blazon. ' +
      'A spelling that is a word of both tongues (besant) returns one definition for each.',
    inputSchema: {
      word: z
        .string()
        .min(1)
        .describe('The word as written in a blazon, e.g. "besant", "fasce", "voided".'),
      language: z
        .enum(['en', 'fr'])
        .optional()
        .describe('The tongue the word belongs to. Both are searched when left out.'),
    },
  },
  async ({ word, language }) => {
    const definitions = definitionsOf(word, language);
    if (definitions.length === 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `No word of the library is written "${word}"${language === undefined ? '' : ` in ${language}`}.`,
          },
        ],
      };
    }
    return {
      content: [{ type: 'text', text: JSON.stringify({ definitions }, null, 2) }],
      structuredContent: { definitions },
    };
  }
);

const closing = async () => {
  await server.close();
  await vite.close();
  process.exit(0);
};
process.on('SIGINT', closing);
process.on('SIGTERM', closing);

await server.connect(new StdioServerTransport());
console.error('vocabulary MCP server listening on stdio');
