# Security Policy

## Scope

ds-mcp is a runtime MCP server. Unlike the dspack specification repository,
which contains only documentation and examples, ds-mcp executes code, reads
files from disk, and handles connections from MCP-compatible AI agents.
Security concerns in this repository fall into several categories:

- **Read-only invariant violations** — any behavior where ds-mcp writes
  files, modifies the dspack file it loaded, executes shell commands, or
  makes outbound network calls beyond reading the configured dspack file.
  This is the highest-priority category.
- **Input handling defects** — malformed or adversarially crafted dspack
  files that cause unexpected behavior in ds-mcp, such as path traversal,
  resource exhaustion, or unhandled crashes that could be exploited.
- **MCP protocol concerns** — issues in how ds-mcp implements the MCP
  protocol that could expose unintended behavior or affect agent clients
  in unexpected ways.
- **Dependency vulnerabilities** — known vulnerabilities in packages
  ds-mcp depends on that apply to its use case.

---

## The read-only invariant

ds-mcp is architecturally read-only. It loads a dspack file and answers
queries about its contents. It does not write files. It does not execute
shell commands. It does not make outbound network calls beyond reading the
dspack file from the configured path.

This invariant is not a policy guideline — it is an architectural
constraint. Any deviation from it is a defect. If you discover behavior
where ds-mcp writes to disk, executes a shell command, or communicates
with an external service under any circumstances, please report it as a
security concern regardless of whether the behavior appears intentional.

The dspack 0.3 generation tools (`get-generation-context`, `validate-ui`)
preserve the invariant: they are pure computation over the loaded document
via `@aestheticfunction/dspack-gen`'s zero-network `core` subpath, and a
network-boundary test scans the compiled tool path — including that
dependency's `dist/core` — for network capability. A `generate_ui` tool is
deliberately absent: generation requires a model call, and the MCP host is
the generator.

A server that can be caused to write files or execute commands — even in
edge cases, even in error paths — is a different threat model than a server
that cannot. ds-mcp is designed to be the latter.

---

## Reporting a vulnerability

For concerns that could cause harm if disclosed publicly, please email
[security@aestheticfunction.com](mailto:security@aestheticfunction.com)
with:

- A short description of the issue
- The affected component or behavior
- Why you believe the issue has security implications
- Steps to reproduce or evaluate the concern
- Any suggested mitigation, if you have one

Please do not open a public GitHub issue for sensitive reports.

For non-sensitive issues — such as a dspack file that causes ds-mcp to
return an error instead of handling it gracefully, or documentation that
is misleading about security properties — a public GitHub issue is
appropriate.

---

## What to expect

We will acknowledge receipt of a sensitive report as soon as practical,
assess the impact, and communicate the plan for remediation. For a
read-only invariant violation, the response priority is high regardless
of whether the behavior is reachable in a typical configuration.

Remediation may involve a patch release, a configuration change, or an
architectural correction depending on the nature of the issue. The goal
is to fix the root cause, not to gate a fix behind a release cycle.

---

## Coordinated disclosure

If a vulnerability affects downstream users in a way that warrants
coordinated disclosure, we will work with you to establish a timeline
before discussing the issue publicly.
