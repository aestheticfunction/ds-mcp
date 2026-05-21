# ds-mcp

ds-mcp is a [Model Context Protocol](https://modelcontextprotocol.io/) server that reads a
[dspack](https://github.com/aestheticfunction/dspack) file and exposes a design system's
contents — tokens, components, patterns, anti-patterns, and framework mappings — as MCP
tools that AI coding agents can query at inference time.

---

## Quick Start

```bash
# Install
npm install -g @aestheticfunction/ds-mcp

# Run with a dspack file
ds-mcp --dspack ./path/to/your-system.dspack.json
```

Configure your MCP client (Claude Desktop, Claude Code, Cursor, GitHub Copilot) to connect to
ds-mcp. See [docs/README.md](docs/README.md) for client-specific configuration examples.

## What it does

ds-mcp loads a dspack file at startup and serves its contents through seven read-only MCP tools:

- **get-token** — retrieve a single design token by category and name
- **search-tokens** — find tokens matching a query string across names, categories, descriptions, and types
- **get-component** — retrieve a component entry by ID, including props, usage guidance, and related components
- **list-components** — enumerate all components with brief summaries
- **get-pattern** — retrieve a documented usage pattern by ID
- **list-antipatterns** — list anti-patterns the design system has identified, with reasoning
- **get-framework-mapping** — retrieve framework-specific information, optionally merged with per-component bindings

## What it does not do

- **Does not generate code.** It retrieves design system information. Code generation is the agent's job.
- **Does not write files or mutate state.** Read-only by architectural invariant.
- **Does not make outbound network calls.** The only I/O is reading the dspack file and serving MCP queries.
- **Does not execute shell commands.**

## Requirements

- Node.js 20.0.0 or later
- A dspack v0.1 file (see the [dspack spec](https://github.com/aestheticfunction/dspack))

## Configuration

ds-mcp accepts the dspack file path via:

1. `--dspack <path>` CLI flag (first priority)
2. `DSPACK_PATH` environment variable (fallback)

Set `DSMCP_DEBUG=true` for verbose stderr logging.

## Documentation

See [docs/README.md](docs/README.md) for full installation, configuration, and MCP client
setup instructions.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Smoke test against shadcn-ui example
bash scripts/smoke.sh
```

## Security

ds-mcp is architecturally read-only. It does not write files, execute commands, or make network
calls. Any behavior that violates these constraints is a defect. See [SECURITY.md](SECURITY.md)
for reporting instructions.

## Relationship to dspack

[dspack](https://github.com/aestheticfunction/dspack) is the specification. ds-mcp is the
reference implementation that reads dspack files and serves them over MCP. The spec is the
authority; this server follows it.

## License

Copyright 2026 Aesthetic Function, LLC.

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.
