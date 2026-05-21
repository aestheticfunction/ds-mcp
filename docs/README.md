# ds-mcp Documentation

## Prerequisites

- **Node.js 20.0.0 or later.** ds-mcp uses the Node.js built-in test runner and mature ESM support, both stable in Node 20+.

## Installation

### Global install (recommended for CLI usage)

```bash
npm install -g @aestheticfunction/ds-mcp
```

### Local install (project dependency)

```bash
npm install @aestheticfunction/ds-mcp
```

## Configuration

ds-mcp requires a path to a dspack file. It accepts the path through two mechanisms, checked in order:

1. **`--dspack` CLI flag** (first priority):
   ```bash
   ds-mcp --dspack ./path/to/your-system.dspack.json
   ```

2. **`DSPACK_PATH` environment variable** (fallback):
   ```bash
   export DSPACK_PATH=./path/to/your-system.dspack.json
   ds-mcp
   ```

If neither is provided, ds-mcp prints an error and exits.

### Debug logging

Set `DSMCP_DEBUG=true` to enable verbose logging to stderr:

```bash
DSMCP_DEBUG=true ds-mcp --dspack ./system.dspack.json
```

Logging always goes to stderr. Stdout is reserved for the MCP protocol.

## MCP Client Configuration

### Claude Desktop

Add to your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ds-mcp": {
      "command": "ds-mcp",
      "args": ["--dspack", "/absolute/path/to/your-system.dspack.json"]
    }
  }
}
```

Or with an environment variable:

```json
{
  "mcpServers": {
    "ds-mcp": {
      "command": "ds-mcp",
      "env": {
        "DSPACK_PATH": "/absolute/path/to/your-system.dspack.json"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "ds-mcp": {
      "command": "ds-mcp",
      "args": ["--dspack", "/absolute/path/to/your-system.dspack.json"]
    }
  }
}
```

### Cursor

Cursor supports MCP servers through its settings. The server command and args are:

- **Command:** `ds-mcp`
- **Args:** `["--dspack", "/absolute/path/to/your-system.dspack.json"]`

See [Cursor's MCP documentation](https://docs.cursor.com/context/model-context-protocol) for setup instructions.

### GitHub Copilot

GitHub Copilot supports MCP servers in agent mode. The server command and args are:

- **Command:** `ds-mcp`
- **Args:** `["--dspack", "/absolute/path/to/your-system.dspack.json"]`

See [GitHub's MCP documentation](https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol) for setup instructions.

## Tools

ds-mcp exposes seven read-only tools:

| Tool | Input | Description |
|------|-------|-------------|
| `get-token` | `{ category, name }` | Retrieve a single design token by category and name |
| `search-tokens` | `{ query }` | Search tokens by name, category, description, or type |
| `get-component` | `{ id }` | Retrieve a full component definition by ID |
| `list-components` | none | List all components with ID, name, description, and deprecation status |
| `get-pattern` | `{ id }` | Retrieve a documented usage pattern by ID |
| `list-antipatterns` | none | List all anti-patterns the design system has identified |
| `get-framework-mapping` | `{ framework, componentId? }` | Retrieve framework-specific information, optionally merged with a component binding |

## Security Posture

ds-mcp is architecturally read-only:

- **No file writes.** It reads the dspack file once at startup and holds it in memory.
- **No outbound network calls.** The only I/O is reading the dspack file and serving MCP queries over stdio.
- **No shell command execution.** It is a file reader and an MCP server, nothing else.
- **stdio transport only.** No network-exposed surface.
- **No authentication.** Out of scope for v0.

Any behavior that violates these constraints is a defect. See [SECURITY.md](../SECURITY.md) for reporting instructions.

## Links

- [dspack specification](https://github.com/aestheticfunction/dspack) — the format ds-mcp reads
- [ds-mcp repository](https://github.com/aestheticfunction/ds-mcp) — this project
- [Model Context Protocol](https://modelcontextprotocol.io/) — the protocol ds-mcp implements
