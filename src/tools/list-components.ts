import type { DspackDocument, LifecycleStatus } from '../types.js';
import { statusMatchesExact } from './status-helpers.js';

export interface ListComponentsInput {
  status?: string;
}

export interface ComponentSummary {
  id: string;
  name: string;
  description: string;
  deprecated: boolean;
  status?: LifecycleStatus;
}

export function listComponents(doc: DspackDocument, input?: ListComponentsInput): ComponentSummary[] {
  const components = doc.components;
  if (!components) return [];

  const entries = Object.entries(components).map(([id, entry]): ComponentSummary => {
    const summary: ComponentSummary = {
      id,
      name: entry.name,
      description: entry.description,
      deprecated: entry.deprecated ?? false,
    };
    if (entry.status !== undefined) {
      summary.status = entry.status;
    }
    return summary;
  });

  if (input?.status) {
    return entries.filter((c) => statusMatchesExact(c.status, input.status!));
  }

  return entries;
}
