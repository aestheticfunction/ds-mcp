#!/usr/bin/env node
/**
 * Copy drift check (dspack-gen#7, ecosystem-wide).
 *
 * ds-mcp deliberately carries byte copies of shared artifacts: the shadcn
 * v0.3 contract (source of truth: the dspack spec repo) and the F1 lint
 * goldens (source of truth: dspack-gen — the goldens pin validate-ui's
 * semantics to the pinned dependency's linter, on purpose). The price of
 * copies is silent drift; this script makes drift loud: every entry must
 * match its source BYTE-FOR-BYTE. CI runs it on every push/PR; on a red
 * check, run with --write to re-sync and commit (for the F1 goldens, a
 * changed golden means the pinned dspack-gen dependency should move too).
 *
 * Boring by design: node builtins + global fetch, one retry, no deps.
 */
import { readFileSync, writeFileSync } from "node:fs";

const MANIFEST = [
  {
    local: "examples/shadcn-ui-v03.dspack.json",
    source:
      "https://raw.githubusercontent.com/aestheticfunction/dspack/main/examples/shadcn-ui.dspack.json",
    note: "the v0.3 example contract — copy of the spec repo's source of truth",
  },
  {
    local: "src/tests/fixtures/F1-dialog-for-delete.dsurface.json",
    source:
      "https://raw.githubusercontent.com/aestheticfunction/dspack-gen/main/fixtures/golden/violating/F1-dialog-for-delete.dsurface.json",
    note: "F1 violating surface — copy of dspack-gen's golden fixture",
  },
  {
    local: "src/tests/fixtures/F1-dialog-for-delete.expected.json",
    source:
      "https://raw.githubusercontent.com/aestheticfunction/dspack-gen/main/fixtures/golden/violating/F1-dialog-for-delete.expected.json",
    note: "F1 expected findings — the deliberate validator-semantics coupling to dspack-gen",
  },
];

const write = process.argv.includes("--write");

async function fetchSource(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt >= 2) throw new Error(`fetching ${url}: ${error.message ?? error}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

let drifted = 0;
for (const entry of MANIFEST) {
  const source = await fetchSource(entry.source);
  let local;
  try {
    local = readFileSync(entry.local);
  } catch {
    local = null;
  }
  if (local && source.equals(local)) {
    console.log(`in sync  ${entry.local}`);
    continue;
  }
  if (write) {
    writeFileSync(entry.local, source);
    console.log(`SYNCED   ${entry.local}  <-  ${entry.source}`);
  } else {
    drifted++;
    console.error(`DRIFT    ${entry.local}  (${entry.note})`);
    console.error(`         differs from ${entry.source}`);
    console.error(`         fix: node scripts/check-sync.mjs --write, re-run npm test, commit together.`);
  }
}
if (drifted > 0) process.exit(1);
