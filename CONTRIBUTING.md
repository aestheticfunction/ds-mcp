# Contributing to ds-mcp

ds-mcp is the reference implementation of [dspack](https://github.com/aestheticfunction/dspack), an open specification for representing design system corpora in a format AI coding agents can query. Contributions to ds-mcp — bug reports, feature proposals, documentation improvements, and code — are welcome.

This repository is at v0. The server implementation is complete and tested. Contributions at this stage are welcome in the form of bug reports, feature requests, documentation improvements, and code.

---

## A note on scope

ds-mcp implements the dspack specification. The spec is the authoritative definition of what a dspack file contains and how it should be interpreted. ds-mcp is one server that reads it.

This distinction matters for contributions: if you have a proposal that involves changing the dspack file format — adding a new concept, modifying how tokens or components are structured, or changing validation rules — that proposal belongs in the [dspack repository](https://github.com/aestheticfunction/dspack), not here. Schema and format changes are out of scope for this repository.

Changes that belong here are changes to how ds-mcp reads, interprets, and serves dspack content: the MCP tool surface, the runtime behavior, the configuration model, the error handling, and the documentation of the implementation.

If you are unsure which repository is the right place, opening a discussion in either one is fine. It is easy to redirect.

---

## Who can contribute

You do not need to be a software engineer to contribute. If you work with design systems — as a designer, product manager, content strategist, accessibility specialist, or in any other role — your perspective on how a tool like this should behave is relevant. The implementation should be useful to practitioners, not just to people who understand MCP internals.

That said, the most useful contributions in a pre-alpha repository tend to be exploratory: questions about intended behavior, descriptions of use cases you would want to cover, and feedback on whether the planned tool surface would actually help you do something you are trying to do.

---

## Ways to contribute

### Bug reports

If you find a defect in the implementation once one exists, open a GitHub issue using the [bug report template](.github/ISSUE_TEMPLATE/bug-report.md). Include enough information to reproduce the problem: what you did, what you expected, and what actually happened. Environment details — Node.js version, MCP client, dspack file version — are useful.

### Feature requests

If you want ds-mcp to do something it does not currently do, open a GitHub issue using the [feature request template](.github/ISSUE_TEMPLATE/feature-request.md). Describe the problem you are trying to solve, not just the proposed solution.

Remember: if the request involves a change to the dspack format or schema, it belongs in the [dspack repository](https://github.com/aestheticfunction/dspack).

### Code contributions

Pull requests are welcome. Please include tests for new behavior, follow the existing code conventions (ESM, TypeScript strict mode, pure-function tool architecture), and ensure `npm test` passes before submitting.

### Documentation

Improvements to the documentation in [docs/](docs/README.md), [examples/](examples/README.md), or this repository's governance files are welcome as pull requests at any stage.

### Example agent configurations

Once a runtime exists, example MCP client configurations and usage patterns will live in [examples/](examples/README.md). If you have configurations that work well in practice and would benefit others, those are useful contributions.

---

## Discussions

GitHub Discussions are open for broader conversation: use cases you are trying to cover, questions about how ds-mcp is intended to work, experience reports from using MCP servers in real development workflows, or anything that does not fit neatly into an issue.

If you are unsure whether something should be an issue or a discussion, start with a discussion. There is no penalty for getting that wrong in an early-stage repository.

---

## Code of conduct

Participation in this project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

---

## License

By contributing to this repository, you agree that your contributions will be licensed under the Apache-2.0 license.
