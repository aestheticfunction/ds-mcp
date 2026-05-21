import type { AntiPatternEntry, DspackDocument } from '../types.js';

export function listAntipatterns(doc: DspackDocument): AntiPatternEntry[] {
  return doc.antiPatterns ?? [];
}
