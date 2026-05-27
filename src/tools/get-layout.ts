import type { DspackDocument, LayoutPrimitives } from '../types.js';

export function getLayout(doc: DspackDocument): { found: true; result: LayoutPrimitives } | { found: false; error: string } {
  if (!doc.layout) {
    return {
      found: false,
      error: `get-layout: no layout section is defined in dspack '${doc.name}'.`,
    };
  }

  return { found: true, result: doc.layout };
}
