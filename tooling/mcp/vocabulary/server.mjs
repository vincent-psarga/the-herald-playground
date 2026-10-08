#!/usr/bin/env node
/**
 * An MCP server answering one question: what does this word of blazon mean?
 *
 * It speaks Streamable HTTP at /mcp, statelessly: every request gets a server
 * and a transport of its own, so no session is kept between them. It binds to
 * HOST:PORT (127.0.0.1:3100 by default) and answers only requests addressed to
 * localhost, which guards against DNS rebinding even when bound to 0.0.0.0, as
 * it is in the container.
 *
 * The definitions are TypeScript and lean on the library's sources and on the
 * demo's vocabulary, so they are loaded through Vite, as the armorials are by
 * scripts/armorials.mjs, rather than through a build step.
 */
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'vite';
import { z } from 'zod';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3100);
const root = fileURLToPath(new URL('../../..', import.meta.url));

const vite = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: 'custom',
});
const { definitionsOf } = await vite.ssrLoadModule('/tooling/mcp/vocabulary/Definition.ts');

const serverOf = () => {
  const server = new McpServer({ name: 'vocabulary', version: '1.0.0' });
  server.registerTool(
    'define',
    {
      title: 'Define a word of blazon',
      description:
        'Defines a word of heraldic blazon the library reads, in English or French: what kind of term it is, ' +
        'what it means and who says so, its other spellings, its synonyms and the variations on it (rustre, a losange pierced), its counterpart in the other tongue, ' +
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
  return server;
};

const app = createMcpExpressApp({ host, allowedHosts: ['localhost', '127.0.0.1', '[::1]'] });

app.post('/mcp', async (req, res) => {
  const server = serverOf();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// Without sessions there is no stream to resume and nothing to end.
const notAllowed = (req, res) => {
  res
    .status(405)
    .set('Allow', 'POST')
    .json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
};
app.get('/mcp', notAllowed);
app.delete('/mcp', notAllowed);

const listening = app.listen(port, host, (error) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.error(`vocabulary MCP server listening on http://${host}:${port}/mcp`);
});

const closing = async () => {
  listening.close();
  await vite.close();
  process.exit(0);
};
process.on('SIGINT', closing);
process.on('SIGTERM', closing);
