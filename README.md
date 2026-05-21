# ds-mcp

ds-mcp is a [Model Context Protocol](https://modelcontextprotocol.io/) server that reads a
[dspack](https://github.com/aestheticfunction/dspack) file and exposes a design system's
contents — tokens, components, patterns, anti-patterns, and framework mappings — as MCP
tools that AI coding agents can query at inference time.

> **Status:** Pre-alpha. Awaiting dspack v0.1 spec finalization. No runtime yet.

---

## Table of Contents

- [What is ds-mcp?](#what-is-ds-mcp)
- [Relationship to dspack](#relationship-to-dspack)
- [How it will work](#how-it-will-work)
- [Tool surface (planned)](#tool-surface-planned)
- [Non-goals](#non-goals)
- [Roadmap](#roadmap)
- [Security posture](#security-posture)
- [How to follow](#how-to-follow)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## What is ds-mcp?

Design systems encode decisions. They define what a button looks like, how spacing
scales across breakpoints, when to reach for a modal versus a sheet, which patterns
have been tried and refined, and which have been deliberately ruled out. That knowledge
is real and consequential — it represents years of iteration, testing, and organizational
consensus. Most of it is effectively invisible to the AI agents now writing production
code alongside the people who built those systems.

The problem is not that the knowledge does not exist. It does — in Figma libraries,
Storybook instances, ADRs, token files, Confluence pages, and the institutional memory
of the teams involved. The problem is that none of it is in a form a coding agent can
load, query, or reason over at the moment it is making decisions. Without that context,
agents optimize for plausibility rather than local correctness. They produce something
that looks like your card component, without knowing how your card component actually
works. They reach for a token name that seems reasonable, without knowing what your
team standardized on. They infer a pattern from surrounding code, without knowing
whether that pattern is preferred, tolerated, or actively discouraged.

ds-mcp addresses that gap. It reads a dspack file — a structured artifact that captures
a design system's vocabulary — and serves that knowledge through the Model Context
Protocol. When an agent is generating code, it can call ds-mcp tools to retrieve the
correct token for a given semantic role, find the right component for a given use case,
or consult the list of anti-patterns the system has identified. The agent gets answers
grounded in the actual design system, not interpolated from general knowledge about
popular open-source systems that may or may not resemble yours.

ds-mcp is the reference implementation of
[dspack](https://github.com/aestheticfunction/dspack). It is not the only implementation,
and dspack is not defined by or dependent on it. The relationship between the two is
intentionally clear: the spec is the spec, and this is one server that reads it.

---

## Relationship to dspack

[dspack](https://github.com/aestheticfunction/dspack) is the specification. It defines a
file format for representing a design system's vocabulary — tokens, components, patterns,
anti-patterns, and framework bindings — in a structured artifact that AI tools can load
and query. The format is independent of MCP, independent of any specific AI agent or
orchestration framework, and independent of any particular runtime environment.

ds-mcp is one implementation of that spec. It reads a dspack file and exposes its
contents over the Model Context Protocol, which provides a practical integration layer
for Claude, Cursor, GitHub Copilot, and other MCP-compatible agents. MCP is not the
only consumption path for a dspack file, and this project is careful not to conflate
the two. Potential alternative implementations include readers for non-MCP agentic
frameworks, CLI tools for querying or linting dspack files, IDE plugins that surface
design system context directly in the editor, and implementations in Go, Python, Rust,
or other languages. If you want to build one, the format is open under the Apache-2.0
license.

Proposals for changes to the dspack format or schema — new top-level concepts,
structural changes, field definitions, validation rules — belong in the
[dspack repository](https://github.com/aestheticfunction/dspack), not here. Changes to
how ds-mcp reads and serves dspack content belong here. If you are unsure which
repository is the right place for a particular proposal, opening a discussion in either
one is fine; it is straightforward to redirect.

It is also worth stating the relationship in the other direction. The dspack spec will
be the authoritative source for what ds-mcp implements. When there is tension between
what would be convenient to implement and what the spec requires, the spec wins. A
reference implementation that diverges from the spec to serve its own convenience is
not a good reference.

---

## How it will work

The intended usage model is straightforward, though the specific details depend on
dspack v0.1. What follows is a description of intent, not a commitment to a particular
implementation.

**Install.** ds-mcp will be published as an npm package once a runtime exists. It can
be installed globally or as a project dependency, depending on how you prefer to manage
your AI tooling. A minimum Node.js version will be specified when the implementation is
ready.

**Configure.** Point ds-mcp at a dspack file. The dspack file is a structured document
describing your design system — its tokens, components, patterns, anti-patterns, and any
framework-specific bindings. The file might live in your repository, be published from a
CI pipeline, or be maintained by hand. ds-mcp will accept a path to that file as its
primary input, supplied via a configuration flag or environment variable.

**Connect.** Configure your AI tool to use ds-mcp as an MCP server. MCP clients —
including Claude Desktop, Cursor, and GitHub Copilot — support server configuration
through their settings. You will add ds-mcp to the server list the same way you would
any other MCP server.

**Query.** With ds-mcp running and connected, agents have access to the design system.
When generating code, an agent can call ds-mcp tools to retrieve the correct token for
a given role, find the right component for a given context, check whether a pattern
applies, or consult the anti-pattern list before making a decision. The design system
knowledge is available on demand, at inference time, without requiring changes to how
the agent is prompted at the system level.

Configuration syntax, startup options, and caching behavior will be documented in
[docs/](docs/README.md) once the implementation exists.

---

## Tool surface (planned)

The following tools are planned at a conceptual level. Final tool names, input schemas, and response shapes will be determined once dspack v0.1 is finalized and the spec has stabilized enough to make stable commitments.

- **get-token** — retrieve a single token by name, returning its value, semantic role, and any associated metadata the dspack file captures

- **search-tokens** — find tokens matching a query string or semantic category, useful when an agent knows what kind of value it needs but not the canonical name the system has standardized on

- **get-component** — retrieve a component entry by name, including its intended purpose, supported variants and states, required and optional props, and any usage guidance the dspack file provides

- **list-components** — enumerate all components in the loaded dspack file, with brief descriptions suitable for helping an agent choose the right starting point for a given task

- **get-pattern** — retrieve a documented usage pattern by name or identifier, including the problem it addresses, the components it involves, and any contextual guidance about when and how to apply it

- **list-antipatterns** — enumerate the anti-patterns the design system has identified, with the reasoning behind each; this is often the most valuable retrieval for an agent about to make a decision the system has already worked through and ruled out

- **get-framework-mapping** — retrieve framework-specific information for a component or pattern, such as the package name, import path, and any guidance that does not apply universally across frameworks

These tools are narrow by design. ds-mcp retrieves design system information. It does not generate code, evaluate agent decisions, or take action of any kind. The agent receives what it queries and decides what to do with it.

---

## Non-goals

Understanding what ds-mcp does not do is as important as understanding what it does.

**ds-mcp does not generate code.** It retrieves design system information. What an agent
does with that information — whether it writes a component, a utility, a test, or nothing
at all — is the agent's decision. Code generation is not part of ds-mcp's role and will
not be added.

**ds-mcp does not sync with Figma or any other design tool.** It reads a dspack file
from disk. It has no connection to Figma, Storybook, Zeroheight, or any other design
environment. It does not pull updates from those tools, watch for changes, or push
information back to them.

**ds-mcp does not reconcile drift.** It does not compare dspack content against a
codebase, detect divergence between design specification and implementation, or flag
components that have fallen out of sync. Drift detection is a distinct problem with
distinct requirements.

**ds-mcp does not mutate anything.** By architectural invariant, it is read-only. It
does not write files, modify tokens, update component definitions, or alter any artifact
in any environment. Any ds-mcp behavior that writes anything is a defect, not a feature.

**ds-mcp does not include authentication in v1.** The v1 release targets local
development workflows over stdio transport. Authentication and authorization are out of
scope for v1. This is a deliberate scope limitation, not a permanent design position.

**ds-mcp does not include HTTP transport in v1.** The v1 release uses stdio. HTTP
transport is a reasonable future direction, but it introduces network exposure,
authentication requirements, and multi-client coordination concerns that are out of
scope for v1.

**ds-mcp does not make outbound network calls.** Beyond reading the dspack file from
the path provided, it does not communicate with external services, phone home, or check
for updates. The only I/O is reading the dspack file and answering MCP queries.

**ds-mcp does not execute shell commands.** It is a file reader and an MCP server.

---

## Roadmap

The milestones below describe the intended direction. They are not scheduled. The foundational dependency is the dspack v0.1 spec; everything else follows from it.

| Milestone | Description |
| --- | --- |
| dspack v0.1 spec finalized | The prerequisite for everything that follows. ds-mcp cannot be implemented correctly until the spec it implements is stable. See the [dspack repository](https://github.com/aestheticfunction/dspack) for the spec-side roadmap. |
| shadcn/ui reference dspack | A reference dspack file for the shadcn/ui component library, used to validate the implementation against a real, well-documented design system with a large component surface. |
| ds-mcp v0 implementation | First working implementation of ds-mcp, validated against the v0.1 spec using the shadcn/ui reference dspack. |
| Integration testing | Testing ds-mcp against MCP-compatible agents in real development workflows, to validate that the tool surface is useful in practice and to identify gaps in the spec or implementation. |
| v1.0 release | Stable release of ds-mcp, accompanied by reference dspacks for shadcn/ui and Material Design 3. |

The spec work is the long pole. ds-mcp is waiting on the dspack spec, not the other
way around. This is deliberate: a reference implementation that gets too far ahead of
the spec tends to calcify decisions that should still be open questions. The better
outcome is a spec that is right before the implementation locks anything in.

The ds-mcp roadmap is intentionally dependent on the dspack roadmap. Significant
implementation decisions cannot be finalized until the dspack v0.1 draft is stable
enough to implement against. Follow the
[dspack repository](https://github.com/aestheticfunction/dspack) for updates on the
spec work.

---

## Security posture

ds-mcp is architecturally read-only. It loads a dspack file and answers queries about
its contents. It does not write files. It does not execute shell commands. It does not
make outbound network calls beyond reading the configured dspack file. It does not
modify any design system artifact in any environment.

That invariant is not a policy choice — it is an architectural constraint. A server
that mutates design system content would be a fundamentally different kind of tool. If
ds-mcp is found to write to disk, execute commands, or communicate with external
services under any circumstances, that behavior is a defect and should be treated as a
potential security concern regardless of whether it appears intentional.

The stdio transport used in v1 means that ds-mcp runs as a local process, in the same
environment as the agent client, without a network-exposed surface. This is a meaningful
property for a tool that reads design system files, which may contain sensitive internal
guidance, naming conventions, or organizational context that teams would not want
exposed beyond the local environment.

Security concerns — including any behavior that violates the read-only invariant —
should be reported as described in [SECURITY.md](SECURITY.md).

---

## How to follow

This repository is pre-alpha. There is no release yet, and implementation work will
not begin until the dspack spec stabilizes.

If you want to stay connected:

- **Watch this repository** to receive notifications when significant changes land.
- **Open or comment on issues** to raise specific questions or concerns about the
  planned implementation.
- **Participate in GitHub Discussions** for broader conversation about use cases,
  design tradeoffs, and how you would want to use a tool like this in practice.
- **Follow the dspack repository** at
  [github.com/aestheticfunction/dspack](https://github.com/aestheticfunction/dspack),
  where the foundational spec work is happening. That is where the most consequential
  decisions for this project are being made right now.

There is no mailing list, newsletter, or social media presence for ds-mcp. GitHub is
the right place.

---

## Acknowledgments

ds-mcp was created by Ryan Dombrowski, who also builds
[Aesthetic Function](https://github.com/aestheticfunction) — a separate project focused
on continuous reconciliation between code and design.

---

## License

Copyright 2026 Aesthetic Function, LLC.

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full
text.
