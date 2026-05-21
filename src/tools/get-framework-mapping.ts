import type { DspackDocument } from '../types.js';

export interface GetFrameworkMappingInput {
  framework: string;
  componentId?: string;
}

export function getFrameworkMapping(
  doc: DspackDocument,
  input: GetFrameworkMappingInput,
): { found: true; result: Record<string, unknown> } | { found: false; error: string } {
  const binding = doc.frameworkBindings?.[input.framework];
  if (!binding) {
    const available = Object.keys(doc.frameworkBindings ?? {});
    const hint = available.length > 0
      ? `Available frameworks: ${available.join(', ')}.`
      : 'No framework bindings are defined in this dspack.';
    return {
      found: false,
      error: `get-framework-mapping: framework '${input.framework}' not found in dspack '${doc.name}'. ${hint}`,
    };
  }

  const { components: _components, ...frameworkFields } = binding;

  if (!input.componentId) {
    return { found: true, result: frameworkFields };
  }

  const componentBinding = binding.components?.[input.componentId];
  if (!componentBinding) {
    const available = Object.keys(binding.components ?? {});
    const hint = available.length > 0
      ? `Available component bindings for '${input.framework}': ${available.join(', ')}.`
      : `No component bindings are defined for framework '${input.framework}'.`;
    return {
      found: false,
      error: `get-framework-mapping: component '${input.componentId}' not found in framework '${input.framework}' in dspack '${doc.name}'. ${hint}`,
    };
  }

  return { found: true, result: { ...frameworkFields, ...componentBinding } };
}
