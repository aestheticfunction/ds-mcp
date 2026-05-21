import type { DspackDocument } from '../types.js';

export interface ComponentSummary {
  id: string;
  name: string;
  description: string;
  deprecated: boolean;
}

export function listComponents(doc: DspackDocument): ComponentSummary[] {
  const components = doc.components;
  if (!components) return [];

  return Object.entries(components).map(([id, entry]) => ({
    id,
    name: entry.name,
    description: entry.description,
    deprecated: entry.deprecated ?? false,
  }));
}
