import type { DspackDocument, TokenEntry } from '../types.js';
import { statusMatchesFuzzy } from './status-helpers.js';

export interface SearchTokensInput {
  query: string;
}

export interface SearchTokenResult {
  category: string;
  name: string;
  entry: TokenEntry;
}

function aliasOfMatches(entry: TokenEntry, query: string): boolean {
  const aliasOf = entry.aliasOf;
  if (aliasOf === undefined) return false;
  if (typeof aliasOf === 'string') return aliasOf.toLowerCase().includes(query);
  return (
    aliasOf.category.toLowerCase().includes(query) ||
    aliasOf.token.toLowerCase().includes(query)
  );
}

export function searchTokens(doc: DspackDocument, input: SearchTokensInput): SearchTokenResult[] {
  const query = input.query.toLowerCase();
  const results: SearchTokenResult[] = [];

  const tokens = doc.tokens;
  if (!tokens) return results;

  for (const [categoryName, category] of Object.entries(tokens)) {
    const categoryMatches = categoryName.toLowerCase().includes(query);

    for (const [tokenName, entry] of Object.entries(category.values)) {
      const matches =
        categoryMatches ||
        tokenName.toLowerCase().includes(query) ||
        (entry.description?.toLowerCase().includes(query) ?? false) ||
        (entry.type?.toLowerCase().includes(query) ?? false) ||
        (entry.tier?.toLowerCase().includes(query) ?? false) ||
        statusMatchesFuzzy(entry.status, query) ||
        aliasOfMatches(entry, query);

      if (matches) {
        results.push({ category: categoryName, name: tokenName, entry });
      }
    }
  }

  return results;
}
