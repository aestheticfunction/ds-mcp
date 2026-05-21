#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import minimist from 'minimist';
import { loadDspack } from './loader.js';
import { createServer } from './server.js';

const debug = process.env.DSMCP_DEBUG === 'true' ? console.error.bind(console, '[ds-mcp]') : () => {};

const argv = minimist(process.argv.slice(2));

const dspackPath = argv.dspack || process.env.DSPACK_PATH;

if (!dspackPath) {
  console.error('Error: No dspack file specified.');
  console.error('Provide a path via --dspack <path> or the DSPACK_PATH environment variable.');
  process.exit(1);
}

debug('Loading dspack file:', dspackPath);

let doc;
try {
  doc = loadDspack(dspackPath);
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

debug('Loaded dspack:', doc.name, `(${Object.keys(doc.components ?? {}).length} components)`);

const server = createServer(doc);
const transport = new StdioServerTransport();
await server.connect(transport);

debug('Server connected via stdio');
