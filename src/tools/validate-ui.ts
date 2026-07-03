/**
 * validate-ui (plan PR-11, ADR-10): lints a submitted dspack surface
 * against the loaded contract's governance — surface gates S1 (surface
 * schema), S2 (contract vocabulary), S3 (governance rules) — and returns
 * the findings object, the same shape dspack-gen embeds in audit reports
 * and renders into repair prompts (one findings object, two serializations;
 * ADR-7).
 *
 * Pure computation via @aestheticfunction/dspack-gen/core; no network, no
 * writes, no shell. Fail-loud discipline is preserved: an unknown rule type
 * in the contract is reported as an error result (the linter's exit-4
 * class), never silently skipped.
 */
import {
  lintSurface,
  renderText,
  UnknownRuleTypeError,
  type Contract,
  type LintReport,
} from '@aestheticfunction/dspack-gen/core';
import type { DspackDocument } from '../types.js';

export interface ValidateUiInput {
  /** A dspack surface document (dspack.surface.v0_1 shape). */
  surface: Record<string, unknown>;
  /**
   * Optional caller-declared intent; when given it must match the surface's
   * own `intent` field (the surface carries its intent — ADR-6).
   */
  intent?: string;
}

export interface ValidateUiResult {
  report: LintReport;
  /** The human rendering of the same report (derived view). */
  text: string;
}

export function validateUi(
  doc: DspackDocument,
  input: ValidateUiInput,
): { found: true; result: ValidateUiResult } | { found: false; error: string } {
  const contract = doc as unknown as Contract;
  if (doc.dspack !== '0.3' && doc.dspack !== '0.4') {
    return {
      found: false,
      error: `validate-ui: requires a dspack 0.3/0.4 contract with governance blocks (loaded document is dspack ${doc.dspack}).`,
    };
  }
  if (input.intent !== undefined && input.intent !== (input.surface as { intent?: unknown }).intent) {
    return {
      found: false,
      error: `validate-ui: declared intent '${input.intent}' does not match the surface's intent '${String((input.surface as { intent?: unknown }).intent)}' — the surface carries its intent (ADR-6).`,
    };
  }
  try {
    const report = lintSurface(input.surface, contract);
    return { found: true, result: { report, text: renderText(report) } };
  } catch (err) {
    if (err instanceof UnknownRuleTypeError) {
      return { found: false, error: `validate-ui: ${err.message} (unknown rule types fail loudly, never skip)` };
    }
    throw err;
  }
}
