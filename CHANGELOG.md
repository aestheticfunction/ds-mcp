# Changelog

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
