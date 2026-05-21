import type { DspackDocument, PatternEntry } from '../types.js';

export interface GetPatternInput {
  id: string;
}

export function getPattern(doc: DspackDocument, input: GetPatternInput): { found: true; result: PatternEntry } | { found: false; error: string } {
  const pattern = doc.patterns?.find((p) => p.id === input.id);
  if (!pattern) {
    const available = doc.patterns?.map((p) => p.id) ?? [];
    const hint = available.length > 0
      ? `Available pattern IDs: ${available.join(', ')}.`
      : 'No patterns are defined in this dspack.';
    return {
      found: false,
      error: `get-pattern: pattern '${input.id}' not found in dspack '${doc.name}'. ${hint}`,
    };
  }

  return { found: true, result: pattern };
}
