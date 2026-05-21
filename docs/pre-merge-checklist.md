# Pre-Merge Checklist

## Build and test

- [ ] `npm run build` succeeds
- [ ] `npm test` — 38 tests pass
- [ ] `bash scripts/smoke.sh` — all smoke tests pass

## Example dspack

- [ ] `examples/shadcn-ui.dspack.json` loads without errors
- [ ] 13 components
- [ ] 4 patterns (destructive-action-confirmation, form-field-layout, contextual-actions-menu, settings-form)
- [ ] 3 anti-patterns
- [ ] 13 React framework bindings (one per component)

## Tools

- [ ] `list-components` returns 13 entries
- [ ] `get-component` works for new components (label, select, checkbox, textarea, switch, separator)
- [ ] `get-pattern { id: "settings-form" }` returns the settings form pattern
- [ ] `get-framework-mapping { framework: "react", componentId: "label" }` returns the label binding

## Documentation

- [ ] README.md renders correctly
- [ ] All internal links resolve (docs/README.md, docs/architecture.md, docs/demo-shadcn.md, SECURITY.md, LICENSE)
- [ ] docs/architecture.md is under 60 lines
- [ ] docs/demo-shadcn.md references correct component and pattern IDs
- [ ] Example prompts included in examples/prompts/
- [ ] No unsupported claims (no "will", "plans to", "coming soon")
- [ ] CONTRIBUTING.md has no stale pre-alpha language

## Security

- [ ] Read-only invariant documented in README and docs/README.md
- [ ] No new file writes, network calls, or shell execution added

## Package

- [ ] `npm pack --dry-run` shows expected files
- [ ] Version is 0.1.0
