/**
 * Golden generation-context honesty check (PHASE-NEXT WS0, task 0.1).
 *
 * What ds-mcp serves from get-generation-context MUST be what dspack-gen's
 * compiler computes for the same contract and intent — byte for byte after
 * JSON serialization (the wire shape an MCP client receives). The golden is
 * a byte-synced copy of dspack-gen's own compiler golden
 * (fixtures/golden/context/shadcn.destructive-action.json, tracked in
 * scripts/check-sync.mjs), compiled from the same shadcn v0.4 contract this
 * repo carries as examples/shadcn-ui-v04.dspack.json.
 *
 * This is deliberate pinned-semantics coupling, the same posture as the F1
 * lint goldens: if the vendored core's generation schema drifts from the
 * published dspack-gen's, this fails loudly and the fix is a re-pin (see
 * README, "dspack-gen is a build-time dependency"). It exists because the
 * pre-0.1.1 pin served a schema that degraded array-typed contract props to
 * strings and declared node `text` before `props` — divergence a prompt
 * consumer cannot detect on its own.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadDspack } from '../loader.js';
import { getGenerationContext } from '../tools/get-generation-context.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const doc = loadDspack(join(root, 'examples', 'shadcn-ui-v04.dspack.json'));
const golden = JSON.parse(
  readFileSync(join(root, 'src', 'tests', 'fixtures', 'shadcn.destructive-action.context.json'), 'utf-8'),
) as { system: string; schema: unknown; fewshot: unknown };

/**
 * The comparison is BYTE equality of the canonical serialization, not
 * deepEqual: grammar-constrained decoders enforce declared property ORDER,
 * so two schemas that deepEqual can still constrain a model differently.
 * The pre-0.1.1 divergence is exactly that class (node `text` declared
 * before `props`), which deepEqual cannot see.
 */
const bytes = (value: unknown): string => JSON.stringify(value, null, 2);

test('get-generation-context serves exactly dspack-gen\'s golden context (schema semantics pinned, byte-level)', () => {
  const outcome = getGenerationContext(doc, { intent: 'destructive-action' });
  assert.ok(outcome.found, 'expected found');
  const served = JSON.parse(JSON.stringify(outcome.result)) as {
    system: string;
    schema: unknown;
    fewshot: unknown;
  };
  assert.equal(served.system, golden.system, 'system prompt drifted from the dspack-gen golden');
  const servedSchema = bytes(served.schema);
  const goldenSchema = bytes(golden.schema);
  if (servedSchema !== goldenSchema) {
    const s = servedSchema.split('\n');
    const g = goldenSchema.split('\n');
    const at = s.findIndex((line, i) => line !== g[i]);
    assert.fail(
      `generation schema drifted from the dspack-gen golden — the vendored core pin should move.\n` +
        `first divergence at schema line ${at}:\n  served: ${s[at]}\n  golden: ${g[at]}`,
    );
  }
  assert.equal(bytes(served.fewshot), bytes(golden.fewshot), 'few-shot exemplars drifted from the dspack-gen golden');
});
