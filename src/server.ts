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
import { getTheme } from './tools/get-theme.js';
import { getLayout } from './tools/get-layout.js';

const debug = process.env.DSMCP_DEBUG === 'true' ? console.error.bind(console, '[ds-mcp]') : () => {};

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function toolResult(outcome: { found: true; result: unknown } | { found: false; error: string }) {
  return textResult(outcome.found ? outcome.result : outcome.error);
}

export function createServer(doc: DspackDocument): McpServer {
  const server = new McpServer(
    { name: 'ds-mcp', version: '0.2.0' },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    'get-token',
    {
      description: 'Retrieve a single design token by category and name. Returns the full token entry including value, description, type, deprecated status, aliases, and v0.2 fields (status, tier, aliasOf) when present.',
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
      description: 'Search for design tokens by query string. Performs case-insensitive substring matching against token names, category names, descriptions, types, tier, status, and aliasOf. Returns matching entries with their category and name.',
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
      description: 'Retrieve a component definition by ID. Returns the full entry including name, description, usage guidance, props, tokens, related components, tags, deprecation status, and v0.2 fields (status, accessibility, composition, constraints) when present.',
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
      description: 'List all components in the design system. Returns an array of component summaries with id, name, description, deprecated status, and lifecycle status when present. Optionally filter by lifecycle status.',
      inputSchema: {
        status: z.enum(['draft', 'experimental', 'stable', 'deprecated']).optional().describe('Optional lifecycle status filter (exact match; for per-platform status, matches if any platform has this status)'),
      },
    },
    (args) => {
      debug('list-components', args);
      return textResult(listComponents(doc, args));
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
      description: 'List all anti-patterns the design system has identified. Returns the full array of entries including id, name, description, reason, severity, preferred alternative, involved components, and tags. Optionally filter by severity.',
      inputSchema: {
        severity: z.enum(['must-not', 'should-not', 'discouraged']).optional().describe('Optional severity filter (exact match)'),
      },
    },
    (args) => {
      debug('list-antipatterns', args);
      return textResult(listAntipatterns(doc, args));
    },
  );

  server.registerTool(
    'get-framework-mapping',
    {
      description: 'Retrieve framework-specific information. Without componentId, returns the top-level framework binding (name, package, install command, description, guidance). With componentId, merges the framework binding with the component-specific binding, including sub-component export mappings when present.',
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

  server.registerTool(
    'get-theme',
    {
      description: 'Retrieve a theme definition by ID. Returns the theme entry including name, description, and token overrides. Overrides use dot-path keys like "color.background" mapping to replacement values.',
      inputSchema: {
        id: z.string().describe('Theme ID (e.g., "dark", "high-contrast")'),
      },
    },
    (args) => {
      debug('get-theme', args);
      return toolResult(getTheme(doc, args));
    },
  );

  server.registerTool(
    'get-layout',
    {
      description: 'Retrieve the layout primitives section. Returns breakpoints, grid configuration, container definitions, and spacing scale when defined.',
    },
    () => {
      debug('get-layout');
      return toolResult(getLayout(doc));
    },
  );

  return server;
}
