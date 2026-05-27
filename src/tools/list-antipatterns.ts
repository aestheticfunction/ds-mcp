import type { AntiPatternEntry, DspackDocument } from '../types.js';

const V02_SEVERITY_DEFAULT = 'should-not';

export interface ListAntipatternsInput {
  severity?: 'must-not' | 'should-not' | 'discouraged';
}

export function listAntipatterns(doc: DspackDocument, input?: ListAntipatternsInput): AntiPatternEntry[] {
  const all = doc.antiPatterns ?? [];
  if (!input?.severity) return all;
  const isV02 = doc.dspack === '0.2';
  return all.filter((ap) => {
    const effective = ap.severity ?? (isV02 ? V02_SEVERITY_DEFAULT : undefined);
    return effective === input.severity;
  });
}
