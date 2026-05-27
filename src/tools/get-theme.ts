import type { DspackDocument, ThemeEntry } from '../types.js';

export interface GetThemeInput {
  id: string;
}

export function getTheme(doc: DspackDocument, input: GetThemeInput): { found: true; result: ThemeEntry } | { found: false; error: string } {
  const theme = doc.themes?.[input.id];
  if (!theme) {
    const available = Object.keys(doc.themes ?? {});
    const hint = available.length > 0
      ? `Available themes: ${available.join(', ')}.`
      : 'No themes are defined in this dspack.';
    return {
      found: false,
      error: `get-theme: theme '${input.id}' not found in dspack '${doc.name}'. ${hint}`,
    };
  }

  return { found: true, result: theme };
}
