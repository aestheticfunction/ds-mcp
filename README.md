# ds-mcp

[![SafeSkill 94/100](https://img.shields.io/badge/SafeSkill-94%2F100_Verified%20Safe-brightgreen)](https://safeskill.dev/scan/aestheticfunction-ds-mcp)
**Stop asking AI agents to guess your design system. Give them a contract they can query.**

---

## The problem

AI coding agents generate UI by guessing: they invent component names,
fabricate props, hardcode color values, and ignore the patterns your team
has documented. Every generated file needs manual correction to match your
design system.

## The solution

ds-mcp is a read-only [MCP](https://modelcontextprotocol.io/) server that
loads a [dspack](https://github.com/aestheticfunction/dspack) file — a
portable JSON description of your design system — and exposes its contents
as tools that agents can query before generating code. The agent asks
questions; ds-mcp answers with your team's actual tokens, components,
props, patterns, and anti-patterns.

## What this is

- A read-only MCP server. It retrieves design system information. It does
  not generate code, write files, or make network calls.
- The reference implementation of the [dspack specification](https://github.com/aestheticfunction/dspack) (supports v0.1 and v0.2).

## What this is not

- A code generator. Code generation is the agent's job.
- A Figma sync tool. dspack files are authored and versioned by your team.
- A runtime dependency. ds-mcp runs alongside your MCP client during
  development, not in production.

## How it works

1. **Create a dspack file** describing your design system's tokens,
   components, patterns, and anti-patterns. (Use the included
   [shadcn/ui v0.2 example](examples/shadcn-ui-v02.dspack.json) to try
   it now, or the [v0.1 example](examples/shadcn-ui.dspack.json) for
   the minimal format.)
2. **Start ds-mcp** with the dspack file. It loads the file once and
   holds it in memory.
3. **Connect your MCP client** (Claude Desktop, Claude Code, Cursor,
   GitHub Copilot). The agent can now query your design system at
   coding time.

## Quick start

```bash
# 1. Install
npm install -g @aestheticfunction/ds-mcp

# 2. Download the shadcn/ui v0.2 example dspack
curl -L https://raw.githubusercontent.com/aestheticfunction/ds-mcp/main/examples/shadcn-ui-v02.dspack.json \
  -o shadcn-ui.dspack.json

# 3. Run with the downloaded file
ds-mcp --dspack ./shadcn-ui.dspack.json
```

Configure your MCP client to connect to ds-mcp. See
[docs/README.md](docs/README.md) for client-specific configuration examples.

## What agents can ask

| Agent question | Tool call | Returns |
|---|---|---|
| What components are available? | `list-components` | Components with names, descriptions, deprecation and lifecycle status |
| Which components are stable? | `list-components { status: "stable" }` | Only components with stable lifecycle status |
| How do I use the Button component? | `get-component { id: "button" }` | Props, usage guidance, tokens, accessibility, composition, constraints |
| What's the right layout for a settings form? | `get-pattern { id: "settings-form" }` | Components to use, guidance on control selection and layout |
| What color token should I use for text? | `get-token { category: "color", name: "foreground" }` | Token value, description, type, tier, status, aliasOf |
| Which tokens relate to spacing? | `search-tokens { query: "spacing" }` | All tokens matching "spacing" across names, categories, descriptions, tier |
| What should I avoid doing? | `list-antipatterns` | Anti-patterns with reasoning, severity, and preferred alternatives |
| What are the must-not rules? | `list-antipatterns { severity: "must-not" }` | Only anti-patterns with must-not severity |
| How do I import Button in React? | `get-framework-mapping { framework: "react", componentId: "button" }` | Import path, install command, sub-component exports, guidance |
| What overrides does the dark theme apply? | `get-theme { id: "dark" }` | Theme description and token override map |
| What breakpoints should I use? | `get-layout` | Breakpoints, grid config, container sizes, spacing scale |

## Tools

ds-mcp exposes nine read-only tools:

| Tool | Input | Description |
|------|-------|-------------|
| `get-token` | `{ category, name }` | Retrieve a single design token by category and name |
| `search-tokens` | `{ query }` | Search tokens by name, category, description, type, tier, status, or aliasOf |
| `get-component` | `{ id }` | Retrieve a full component definition including accessibility, composition, and constraints |
| `list-components` | `{ status? }` | List all components; optionally filter by lifecycle status |
| `get-pattern` | `{ id }` | Retrieve a documented usage pattern by ID |
| `list-antipatterns` | `{ severity? }` | List all anti-patterns; optionally filter by severity |
| `get-framework-mapping` | `{ framework, componentId? }` | Retrieve framework-specific information including sub-component export mappings |
| `get-theme` | `{ id }` | Retrieve a theme definition with token overrides |
| `get-layout` | none | Retrieve layout primitives: breakpoints, grid, containers, spacing scale |

## Requirements

- Node.js 20.0.0 or later
- A dspack v0.1 or v0.2 file (see the [dspack spec](https://github.com/aestheticfunction/dspack))

## Configuration

ds-mcp accepts the dspack file path via:

1. `--dspack <path>` CLI flag (first priority)
2. `DSPACK_PATH` environment variable (fallback)

Set `DSMCP_DEBUG=true` for verbose stderr logging.

## Documentation

- [Installation and MCP client setup](docs/README.md)
- [Architecture](docs/architecture.md)
- [Demo walkthrough: shadcn/ui settings form](docs/demo-shadcn.md)

## Development

```bash
npm install
npm run build
npm test
bash scripts/smoke.sh
```

## Security

ds-mcp is architecturally read-only. It does not write files, execute
commands, or make network calls. Any behavior that violates these
constraints is a defect. See [SECURITY.md](SECURITY.md) for reporting
instructions.

## License

Copyright 2026 Aesthetic Function, LLC.

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.
