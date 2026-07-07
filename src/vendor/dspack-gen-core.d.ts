/**
 * Type facade for the bundled dspack-gen core.
 *
 * At build time, `npm run bundle:core` (esbuild) compiles the pinned
 * @aestheticfunction/dspack-gen devDependency's `core` subpath into
 * `dist/vendor/dspack-gen-core.js`, so the published package is
 * self-contained: dspack-gen is private on npm and must not appear as a
 * runtime dependency. This declaration file makes the relative import
 * type-check against the real dspack-gen types while runtime resolution
 * lands on the bundle.
 *
 * Updating governance semantics = re-pin the dspack-gen commit in
 * devDependencies, rebuild, republish ds-mcp.
 */
export * from '@aestheticfunction/dspack-gen/core';
