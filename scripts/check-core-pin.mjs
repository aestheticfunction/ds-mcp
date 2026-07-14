#!/usr/bin/env node
/**
 * Vendored-core pin drift check (PHASE-NEXT WS0, report-only posture).
 *
 * ds-mcp bundles @aestheticfunction/dspack-gen/core at build time from a
 * commit-pinned devDependency. The invariant this job watches: the pinned
 * commit corresponds exactly to dspack-gen's latest published release, so
 * the schema and linter semantics ds-mcp serves are the ones consumers get
 * from `npm install @aestheticfunction/dspack-gen`. When a new dspack-gen
 * release changes anything under src/core/, this check fails loudly and the
 * fix is the documented re-pin ritual: move the pin to the new release tag,
 * rebuild, republish ds-mcp.
 *
 * The diff excludes *.test.ts — test files never ship in the esbuild vendor
 * bundle, which is the documented escape for intentional ahead-of-release
 * pins. The default posture is tag-pinned, where this check is green by
 * construction.
 *
 * Report-only discipline: a GitHub API failure logs a warning and exits 0
 * (infrastructure noise never blocks unrelated work); a real content diff
 * always exits 1.
 *
 * Boring by design: node builtins + global fetch, one retry, no deps.
 */
import { readFileSync } from "node:fs";

const REPO = "aestheticfunction/dspack-gen";
const API = `https://api.github.com/repos/${REPO}`;

async function gh(path) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(`${API}${path}`, {
        headers: { accept: "application/vnd.github+json", "user-agent": "ds-mcp-check-core-pin" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt >= 2) throw new Error(`GET ${path}: ${error.message ?? error}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const spec = pkg.devDependencies?.["@aestheticfunction/dspack-gen"] ?? "";
const pinned = spec.split("#")[1];
if (!/^[0-9a-f]{40}$/.test(pinned ?? "")) {
  console.error(`could not read a 40-char commit pin from the devDependency spec: ${spec}`);
  process.exit(1);
}

let tags;
try {
  tags = await gh("/tags?per_page=100");
} catch (error) {
  console.warn(`WARN  GitHub API unavailable (${error.message}); pin-drift check skipped this run.`);
  process.exit(0);
}

const releases = tags
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t.name))
  .sort((a, b) => {
    const va = a.name.slice(1).split(".").map(Number);
    const vb = b.name.slice(1).split(".").map(Number);
    return vb[0] - va[0] || vb[1] - va[1] || vb[2] - va[2];
  });
if (releases.length === 0) {
  console.warn("WARN  no release tags found on dspack-gen; pin-drift check skipped this run.");
  process.exit(0);
}
const latest = releases[0];
console.log(`pinned commit: ${pinned}`);
console.log(`latest dspack-gen release: ${latest.name} (${latest.commit.sha})`);

if (latest.commit.sha === pinned) {
  console.log("in sync  the pin is exactly the latest release tag.");
  process.exit(0);
}

// Compare the two src/core trees blob by blob. The compare API is NOT used:
// its file list caps at 300 entries and silently truncates larger diffs —
// the exact silent-drift class this check exists to prevent. Two recursive
// tree fetches are exact at any diff size.
async function coreTree(ref) {
  const tree = await gh(`/git/trees/${ref}?recursive=1`);
  if (tree.truncated) throw new Error(`tree listing for ${ref} was truncated by the API`);
  const files = new Map();
  for (const entry of tree.tree) {
    if (entry.type !== "blob") continue;
    if (!entry.path.startsWith("src/core/") || entry.path.endsWith(".test.ts")) continue;
    files.set(entry.path, entry.sha);
  }
  return files;
}

let pinnedCore, latestCore;
try {
  [pinnedCore, latestCore] = await Promise.all([coreTree(pinned), coreTree(latest.commit.sha)]);
} catch (error) {
  console.warn(`WARN  GitHub API unavailable (${error.message}); pin-drift check skipped this run.`);
  process.exit(0);
}

const coreDiff = [...new Set([...pinnedCore.keys(), ...latestCore.keys()])]
  .filter((path) => pinnedCore.get(path) !== latestCore.get(path))
  .sort();

if (coreDiff.length === 0) {
  console.log(
    `in sync  pin differs from ${latest.name} but no shipped src/core files differ ` +
      "(test-only or non-core drift; the vendor bundle is unaffected).",
  );
  process.exit(0);
}

console.error(`DRIFT    the vendored core pin diverges from dspack-gen ${latest.name} in shipped src/core files:`);
for (const f of coreDiff) console.error(`         ${f}`);
console.error("         fix: re-pin the devDependency to the release tag commit, npm install,");
console.error("         npm run build, verify the golden-context test, release a new ds-mcp version.");
process.exit(1);
