# Architecture

## dspack: the portable contract

A dspack file is a JSON document that describes a design system's tokens,
components, patterns, anti-patterns, and framework bindings. It follows the
[dspack v0.1 specification](https://github.com/aestheticfunction/dspack).
The file is authored by the design system team, versioned in the repository
alongside the codebase, and read by tooling at development time.

dspack is not a runtime format. Nothing in production loads or depends on it.

## ds-mcp: the read-only query layer

ds-mcp is an MCP server that reads a dspack file once at startup and serves
its contents through seven lookup tools. It has three architectural
properties:

- **Read-only.** It never writes files, mutates state, or modifies the
  dspack file.
- **No network.** It makes no outbound HTTP calls. The only I/O is reading
  the dspack file and serving MCP queries.
- **stdio only.** It communicates over stdin/stdout using the MCP protocol.
  There is no HTTP server, no exposed port, no network surface.

Any behavior that violates these properties is a defect.

## AI coding agent: the consumer

Any MCP-compatible agent (Claude Desktop, Claude Code, Cursor, GitHub
Copilot) connects to ds-mcp and calls its tools. The agent decides when to
query, what to query, and how to use the results. ds-mcp provides design
system facts; the agent generates code.

## Data flow

Data flows in one direction:

```
dspack file  →  ds-mcp  →  agent
  (JSON)       (MCP server)  (code generation)
```

Nothing writes back. The agent does not modify the dspack file through
ds-mcp. The dspack file is updated by the team through normal version
control.
