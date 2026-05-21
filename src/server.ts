import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DspackDocument } from './types.js';
import { getToken } from './tools/get-token.js';
import { searchTokens } from './tools/search-tokens.js';
import { getComponent } from './tools/get-component.js';
import { listComponents } from './tools/list-components.js';
import { getPattern } from './tools/get-pattern.js';
import { listAntipatterns } from './tools/list-antipatterns.js';
import { getFrameworkMapping } from './tools/get-framework-mapping.js';

const debug = process.env.DSMCP_DEBUG === 'true' ? console.error.bind(console, '[ds-mcp]') : () => {};

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function toolResult(outcome: { found: true; result: unknown } | { found: false; error: string }) {
  return textResult(outcome.found ? outcome.result : outcome.error);
}

export function createServer(doc: DspackDocument): McpServer {
  const server = new McpServer(
    { name: 'ds-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    'get-token',
    {
      description: 'Retrieve a single design token by category and name. Returns the full token entry including value, description, type, deprecated status, and aliases.',
      inputSchema: {
        category: z.string().describe('Token category name (e.g., "color", "spacing")'),
        name: z.string().describe('Token name within the category'),
      },
    },
    (args) => {
      debug('get-token', args);
      return toolResult(getToken(doc, args));
    },
  );

  server.registerTool(
    'search-tokens',
    {
      description: 'Search for design tokens by query string. Performs case-insensitive substring matching against token names, category names, descriptions, and types. Returns matching entries with their category and name.',
      inputSchema: {
        query: z.string().describe('Search query (case-insensitive substring match)'),
      },
    },
    (args) => {
      debug('search-tokens', args);
      return textResult(searchTokens(doc, args));
    },
  );

  server.registerTool(
    'get-component',
    {
      description: 'Retrieve a component definition by ID. Returns the full entry including name, description, usage guidance, props, tokens, related components, tags, and deprecation status.',
      inputSchema: {
        id: z.string().describe('Component ID (e.g., "button", "alert-dialog")'),
      },
    },
    (args) => {
      debug('get-component', args);
      return toolResult(getComponent(doc, args));
    },
  );

  server.registerTool(
    'list-components',
    {
      description: 'List all components in the design system. Returns an array of component summaries with id, name, description, and deprecated status.',
    },
    () => {
      debug('list-components');
      return textResult(listComponents(doc));
    },
  );

  server.registerTool(
    'get-pattern',
    {
      description: 'Retrieve a documented usage pattern by ID. Returns the full entry including name, description, intent, context, involved components, guidance, related patterns, and tags.',
      inputSchema: {
        id: z.string().describe('Pattern ID (e.g., "form-layout", "destructive-action-confirmation")'),
      },
    },
    (args) => {
      debug('get-pattern', args);
      return toolResult(getPattern(doc, args));
    },
  );

  server.registerTool(
    'list-antipatterns',
    {
      description: 'List all anti-patterns the design system has identified. Returns the full array of entries including id, name, description, reason, preferred alternative, involved components, and tags.',
    },
    () => {
      debug('list-antipatterns');
      return textResult(listAntipatterns(doc));
    },
  );

  server.registerTool(
    'get-framework-mapping',
    {
      description: 'Retrieve framework-specific information. Without componentId, returns the top-level framework binding (name, package, install command, description, guidance). With componentId, merges the framework binding with the component-specific binding.',
      inputSchema: {
        framework: z.string().describe('Framework identifier (e.g., "react", "vue")'),
        componentId: z.string().optional().describe('Optional component ID to get component-specific framework details'),
      },
    },
    (args) => {
      debug('get-framework-mapping', args);
      return toolResult(getFrameworkMapping(doc, args));
    },
  );

  return server;
}
