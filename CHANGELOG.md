# Changelog

## Unreleased

- The v0.1 example `examples/shadcn-ui.dspack.json` is renamed to
  `examples/shadcn-ui-v01.dspack.json` (DX-1, D4): the old unversioned
  filename collided with the dspack repository's v0.4
  `examples/shadcn-ui.dspack.json`, so the same path could silently mean
  two different spec versions depending on the repository. All in-repo
  references (README, demo walkthrough, pre-merge checklist, smoke
  script) are updated; `scripts/smoke.sh` now exercises the v0.4 synced
  example. No published-package behavior changes.

## 0.3.2

The vendored `@aestheticfunction/dspack-gen/core` bundle moves from the
v0.1.1 release tag (`374e1cd`) to the v0.1.2 release tag (`c5bfd6d`),
picking up 0.1.2's compiler change: contract-declared required props
(the v0.4 `required-props` rule type) reach the generation-context
grammar. The published 0.3.1 served v0.4 contracts from a core that
predates that grammar support, and its report-only `core-pin-drift`
check had been red since dspack-gen 0.1.2 shipped.

- Re-pin: `@aestheticfunction/dspack-gen` devDependency ->
  `c5bfd6d` (the v0.1.2 tag commit), vendor bundle rebuilt.
- No other changes: golden-context byte-compare, sync checks, and the
  full test suite pass unchanged against the new bundle; the pin-drift
  check reports the pin exactly at the latest release tag.

## 0.3.1

The vendored `@aestheticfunction/dspack-gen/core` bundle moves from commit
`f651433` to the v0.1.1 release tag (`374e1cd`), picking up the 0.1.1
generation-schema fixes for grammar-constrained decoders: array-typed
contract props emit as arrays (with contract-declared `items` passthrough),
and node properties declare `component, id, props, text, children` in that
order. The published 0.3.0 served the pre-fix schema from
`get-generation-context`; a grammar-constrained decoder driven by that
schema could not emit node text after props and degraded array props to
strings.

- Re-pin: `@aestheticfunction/dspack-gen` devDependency ->
  `374e1cd` (the v0.1.1 tag commit), vendor bundle rebuilt.
- New golden-context test: `get-generation-context` output byte-compares
  against dspack-gen's own compiler golden
  (`fixtures/golden/context/shadcn.destructive-action.json`), synced as a
  tracked byte copy in `scripts/check-sync.mjs`. Byte-level on purpose:
  grammar-constrained decoders enforce property order, which deepEqual
  cannot see. The test fails on the 0.3.0 bundle with the pre-fix
  signature (`text` declared before `props`).
- New pin-drift CI check: `scripts/check-core-pin.mjs` compares the pinned
  commit's shipped `src/core` files (blob-exact, via the git trees API)
  against dspack-gen's latest release tag and fails loudly on drift.
  Test files are excluded; GitHub API failures warn and pass (report-only
  posture); real drift always fails.
- Release workflow: npm trusted publishing (OIDC) on version tags,
  mirroring dspack-gen's. Requires one-time trusted-publisher registration
  on npmjs.com.

## 0.3.0

Baseline for this changelog. Self-contained npm package: dspack-gen's
`core` subpath bundled at build time (`dist/vendor/dspack-gen-core.js`)
from a commit-pinned devDependency; generation tools
(`get-generation-context`, `validate-ui`) backed by the bundle; network
boundary enforced by test.
