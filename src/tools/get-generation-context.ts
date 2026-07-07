/**
 * get-generation-context (plan PR-11, ADR-10): returns the compiled
 * generation context — system prompt + per-contract generation schema +
 * few-shot exemplars — for a caller-declared intent.
 *
 * Backed by dspack-gen's zero-network, emitter-free `core` subpath,
 * consumed as the build-time bundle ../vendor/dspack-gen-core.js (see
 * src/vendor/dspack-gen-core.d.ts): this tool is pure computation over the loaded
 * document, preserving ds-mcp's read-only / no-network / no-shell posture
 * (verified by the network-boundary test). The idiomatic flow is
 * agent-driven: get context → agent generates → validate-ui → agent repairs
 * itself. A `generate_ui` tool is deliberately absent — generation requires
 * an LLM call, and the MCP host already is one.
 */
import { compileContext, type Contract } from '../vendor/dspack-gen-core.js';
import type { DspackDocument } from '../types.js';

export interface GetGenerationContextInput {
  intent: string;
}

export interface GenerationContext {
  system: string;
  schema: unknown;
  fewshot: unknown;
}

export function getGenerationContext(
  doc: DspackDocument,
  input: GetGenerationContextInput,
): { found: true; result: GenerationContext } | { found: false; error: string } {
  const contract = doc as unknown as Contract;
  if (doc.dspack !== '0.3' && doc.dspack !== '0.4') {
    return {
      found: false,
      error: `get-generation-context: requires a dspack 0.3/0.4 contract with governance blocks (loaded document is dspack ${doc.dspack}).`,
    };
  }
  try {
    const context = compileContext(contract, input.intent);
    return { found: true, result: context as GenerationContext };
  } catch (err) {
    const available = (contract.intents ?? []).map((i) => i.id);
    const hint = available.length > 0
      ? ` Registered intents: ${available.join(', ')}.`
      : ' No intents are registered in this contract.';
    return {
      found: false,
      error: `get-generation-context: ${err instanceof Error ? err.message : String(err)}${hint}`,
    };
  }
}
