# ds-mcp

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
- The reference implementation of the [dspack v0.1 specification](https://github.com/aestheticfunction/dspack).

## What this is not

- A code generator. Code generation is the agent's job.
- A Figma sync tool. dspack files are authored and versioned by your team.
- A runtime dependency. ds-mcp runs alongside your MCP client during
  development, not in production.

## How it works

1. **Create a dspack file** describing your design system's tokens,
   components, patterns, and anti-patterns. (Download the
   [shadcn/ui example](examples/shadcn-ui.dspack.json) from GitHub to
   try it now.)
2. **Start ds-mcp** with the dspack file. It loads the file once and
   holds it in memory.
3. **Connect your MCP client** (Claude Desktop, Claude Code, Cursor,
   GitHub Copilot). The agent can now query your design system at
   coding time.

## Quick start

```bash
# 1. Install
npm install -g @aestheticfunction/ds-mcp

# 2. Download the shadcn/ui example dspack
curl -L https://raw.githubusercontent.com/aestheticfunction/ds-mcp/v0.1.0/examples/shadcn-ui.dspack.json \
  -o shadcn-ui.dspack.json

# 3. Run with the downloaded file
ds-mcp --dspack ./shadcn-ui.dspack.json
```

Configure your MCP client to connect to ds-mcp. See
[docs/README.md](docs/README.md) for client-specific configuration examples.

## What agents can ask

| Agent question | Tool call | Returns |
|---|---|---|
| What components are available? | `list-components` | 13 components with names, descriptions, deprecation status |
| How do I use the Button component? | `get-component { id: "button" }` | Props, usage guidance, tokens, related components |
| What's the right layout for a settings form? | `get-pattern { id: "settings-form" }` | Components to use, guidance on control selection and layout |
| What color token should I use for text? | `get-token { category: "color", name: "foreground" }` | Token value, description, type |
| Which tokens relate to spacing? | `search-tokens { query: "spacing" }` | All tokens matching "spacing" across names, categories, descriptions |
| What should I avoid doing? | `list-antipatterns` | Anti-patterns with reasoning and preferred alternatives |
| How do I import Button in React? | `get-framework-mapping { framework: "react", componentId: "button" }` | Import path, install command, framework-specific guidance |

## Tools

ds-mcp exposes seven read-only tools:

| Tool | Input | Description |
|------|-------|-------------|
| `get-token` | `{ category, name }` | Retrieve a single design token by category and name |
| `search-tokens` | `{ query }` | Search tokens by name, category, description, or type |
| `get-component` | `{ id }` | Retrieve a full component definition by ID |
| `list-components` | none | List all components with ID, name, description, and deprecation status |
| `get-pattern` | `{ id }` | Retrieve a documented usage pattern by ID |
| `list-antipatterns` | none | List all anti-patterns with reasoning and preferred alternatives |
| `get-framework-mapping` | `{ framework, componentId? }` | Retrieve framework-specific information, optionally merged with a component binding |

## Requirements

- Node.js 20.0.0 or later
- A dspack v0.1 file (see the [dspack spec](https://github.com/aestheticfunction/dspack))

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
