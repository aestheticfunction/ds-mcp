import type { DspackDocument } from '../types.js';

export interface GetTokenInput {
  category: string;
  name: string;
}

export function getToken(doc: DspackDocument, input: GetTokenInput): { found: true; result: unknown } | { found: false; error: string } {
  const category = doc.tokens?.[input.category];
  if (!category) {
    return {
      found: false,
      error: `get-token: category '${input.category}' not found in dspack '${doc.name}'. Use search-tokens to find available categories and token names.`,
    };
  }

  const token = category.values[input.name];
  if (!token) {
    return {
      found: false,
      error: `get-token: token '${input.name}' not found in category '${input.category}' in dspack '${doc.name}'. Use search-tokens to find available token names.`,
    };
  }

  return { found: true, result: token };
}
