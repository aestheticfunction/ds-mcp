import type { AntiPatternEntry, DspackDocument } from '../types.js';

export interface ListAntipatternsInput {
  severity?: string;
}

export function listAntipatterns(doc: DspackDocument, input?: ListAntipatternsInput): AntiPatternEntry[] {
  const all = doc.antiPatterns ?? [];
  if (!input?.severity) return all;
  return all.filter((ap) => ap.severity === input.severity);
}
