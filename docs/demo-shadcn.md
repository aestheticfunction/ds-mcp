# Demo: shadcn/ui Settings Form

This walkthrough shows how ds-mcp changes the way an AI coding agent
builds a settings form, using the included shadcn/ui dspack as the design
system contract.

## Setup

1. ds-mcp running with the shadcn/ui example dspack. Download it first
   (see the [Quick start](../README.md#quick-start)), then run:
   `ds-mcp --dspack ./shadcn-ui.dspack.json`
2. An MCP client connected (Claude Desktop, Claude Code, Cursor, or
   GitHub Copilot).

## The prompt

> Build a settings form for a user profile page. Include fields for display name, email address, bio, preferred language, notification preferences, and a marketing opt-in. Use our design system.

## Common problems when an agent does not query a design-system contract

- Guesses component names that don't exist in the system (e.g., `TextInput` instead of `Input`).
- Invents props that the components don't support (e.g., `variant="filled"` on Input).
- Uses a plain `<input type="checkbox">` instead of the system's Checkbox component.
- Uses a generic toggle instead of the system's Switch component.
- Hardcodes color values instead of using design tokens.
- Wraps the form in a `<div>` instead of using Card with CardHeader,
  CardContent, and CardFooter.
- Skips Label associations, creating accessibility gaps.
- Uses Dialog instead of AlertDialog for destructive confirmations (if
  the form has a delete action).
- Doesn't know the correct import paths or install commands for the framework.

## With ds-mcp: what the agent queries

When ds-mcp is connected, the agent can query the design system before
generating code. A typical sequence:

1. **`list-components`** — The agent sees all 13 available components. It
   now knows the exact names: Input (not TextInput), Select (not Dropdown),
   Switch (not Toggle).

2. **`get-pattern { id: "settings-form" }`** — The agent gets structured
   guidance: use Card as a wrapper, Label on every control, Separator
   between sections, Button in CardFooter, and which control type to use
   for which kind of setting (Input for free text, Select for constrained
   choices, Switch for on/off, Checkbox for opt-in).

3. **`get-component`** for each control — The agent retrieves props, usage
   guidance, and tokens for `input`, `select`, `switch`, `checkbox`,
   `textarea`, `label`, `card`, `separator`, and `button`.

4. **`get-framework-mapping { framework: "react" }`** for each component —
   The agent gets the correct import paths (`@/components/ui/input`),
   install commands (`npx shadcn@latest add input`), and
   framework-specific guidance.

5. **`list-antipatterns`** — The agent learns to avoid: using Dialog
   instead of AlertDialog for destructive actions, nesting interactive
   elements, using styled divs as buttons.

## The difference

Without ds-mcp, the agent guesses and the developer corrects. With
ds-mcp, the agent queries and generates code that uses the right
components, the right props, the right tokens, and the right patterns
from the start.

The dspack file is the single source of truth. When the design system
changes, the dspack file is updated, and every agent that queries it gets
the current answer.

## Try it

See [examples/prompts/settings-form-with-ds-mcp.md](../examples/prompts/settings-form-with-ds-mcp.md) for a ready-to-use prompt.
