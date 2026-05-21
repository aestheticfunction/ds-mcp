import type { ComponentEntry, DspackDocument } from '../types.js';

export interface GetComponentInput {
  id: string;
}

export function getComponent(doc: DspackDocument, input: GetComponentInput): { found: true; result: ComponentEntry } | { found: false; error: string } {
  const component = doc.components?.[input.id];
  if (!component) {
    return {
      found: false,
      error: `get-component: component '${input.id}' not found in dspack '${doc.name}'. Use list-components to see available IDs.`,
    };
  }

  return { found: true, result: component };
}
