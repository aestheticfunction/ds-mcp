/**
 * PR-11 acceptance gates: get-generation-context + validate-ui.
 *
 * Fixture provenance (byte copies, drift tracked in dspack-gen#7):
 * - examples/shadcn-ui-v03.dspack.json    == dspack-gen fixtures/shadcn.v0_3.dspack.json
 *                                         == dspack examples/shadcn-ui.dspack.json
 * - src/tests/fixtures/F1-*.dsurface.json == dspack-gen fixtures/golden/violating/F1-*
 * - src/tests/fixtures/F1-*.expected.json == dspack-gen's golden lint report for F1
 *
 * The golden equality below is deliberate validator-semantics coupling:
 * validate-ui MUST return exactly what dspack-gen's linter returns — if the
 * pinned dependency's semantics drift from the golden, this fails loudly.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadDspack } from '../loader.js';
import { getGenerationContext } from '../tools/get-generation-context.js';
import { validateUi } from '../tools/validate-ui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const fixturesDir = join(root, 'src', 'tests', 'fixtures');

const doc = loadDspack(join(root, 'examples', 'shadcn-ui-v03.dspack.json'));
const f1 = JSON.parse(readFileSync(join(fixturesDir, 'F1-dialog-for-delete.dsurface.json'), 'utf-8')) as Record<string, unknown>;
const f1Expected = JSON.parse(readFileSync(join(fixturesDir, 'F1-dialog-for-delete.expected.json'), 'utf-8')) as unknown;

test('loader accepts a dspack 0.3 document (governance blocks validated)', () => {
  assert.equal(doc.dspack, '0.3');
});

test('get-generation-context returns the compiled { system, schema, fewshot } for a registered intent', () => {
  const outcome = getGenerationContext(doc, { intent: 'destructive-action' });
  assert.ok(outcome.found, 'expected found');
  const context = outcome.result;
  assert.match(context.system, /Governance rules in effect/);
  assert.match(context.system, /rule\.destructive-requires-alertdialog/);
  assert.ok(context.schema && typeof context.schema === 'object');
  assert.ok(Array.isArray(context.fewshot) && (context.fewshot as unknown[]).length > 0);
});

test('get-generation-context on an unknown intent returns a helpful error, not a crash', () => {
  const outcome = getGenerationContext(doc, { intent: 'nonexistent' });
  assert.ok(!outcome.found);
  assert.match(outcome.error, /Registered intents: destructive-action/);
});

test('validate-ui on golden F1 returns findings equal to the dspack-gen golden (validator semantics pinned)', () => {
  const outcome = validateUi(doc, { surface: f1 });
  assert.ok(outcome.found, 'expected found');
  // Compare the JSON serialization: that is what the MCP client receives
  // (undefined-valued optional fields are not part of the wire contract).
  assert.deepEqual(JSON.parse(JSON.stringify(outcome.result.report)), f1Expected);
  assert.match(outcome.result.text, /rule\.destructive-requires-alertdialog/);
});

test('validate-ui on the contract worked example is clean (S1/S2/S3 pass)', () => {
  const example = (doc as unknown as { examples: Array<{ id: string; surface: Record<string, unknown> }> })
    .examples.find((e) => e.id === 'ex.delete-account-confirmation');
  assert.ok(example, 'worked example present in contract');
  const outcome = validateUi(doc, { surface: example.surface });
  assert.ok(outcome.found);
  assert.equal(outcome.result.report.pass, true);
});

test('validate-ui rejects a mismatched declared intent (the surface carries its intent, ADR-6)', () => {
  const outcome = validateUi(doc, { surface: f1, intent: 'something-else' });
  assert.ok(!outcome.found);
  assert.match(outcome.error, /does not match/);
});

test('both tools refuse pre-0.3 documents with a clear error', () => {
  const v02 = loadDspack(join(root, 'examples', 'shadcn-ui-v02.dspack.json'));
  const ctx = getGenerationContext(v02, { intent: 'destructive-action' });
  assert.ok(!ctx.found && /dspack 0\.3/.test(ctx.error));
  const val = validateUi(v02, { surface: f1 });
  assert.ok(!val.found && /dspack 0\.3/.test(val.error));
});

// ---------------------------------------------------------------------------
// Network boundary: the tool path must import no network capability. ds-mcp's
// posture (read-only, no network, no shell) is architectural; the dspack-gen
// dependency is consumed ONLY through its zero-network `core` subpath. This
// scans the compiled tool modules and the entire dist/core of the dependency.
// ---------------------------------------------------------------------------

const NETWORK_TOKENS = ['node:http', 'node:https', 'node:net', 'node:tls', 'node:dgram', 'undici', '@anthropic-ai/sdk', 'fetch('];

function scanDir(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) scanDir(path, files);
    else if (path.endsWith('.js')) files.push(path);
  }
  return files;
}

test('network boundary: dist/tools/* and the dependency dist/core import no network modules', () => {
  const targets = [
    ...scanDir(join(root, 'dist', 'tools')),
    ...scanDir(join(root, 'node_modules', '@aestheticfunction', 'dspack-gen', 'dist', 'core')),
  ];
  assert.ok(targets.length > 10, `expected a real scan surface, got ${targets.length} files`);
  for (const file of targets) {
    const source = readFileSync(file, 'utf-8');
    for (const token of NETWORK_TOKENS) {
      assert.ok(!source.includes(token), `${file} references '${token}'`);
    }
  }
});
