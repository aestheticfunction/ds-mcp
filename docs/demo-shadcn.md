# Demo: shadcn/ui Settings Form

This walkthrough shows how ds-mcp changes the way an AI coding agent
builds a settings form, using the included shadcn/ui dspack as the design
system contract.

## Setup

1. ds-mcp running with the shadcn/ui v0.2 example dspack. Download it
   first (see the [Quick start](../README.md#quick-start)), then run:
   `ds-mcp --dspack ./shadcn-ui-v02.dspack.json`
2. An MCP client connected (Claude Desktop, Claude Code, Cursor, or
   GitHub Copilot).

## The prompt

> Build a settings form for a user profile page. Include fields for display name, email address, bio, preferred language, notification preferences, and a marketing opt-in. Use our design system. Support dark mode.

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
- Generates inaccessible components (missing ARIA attributes, no keyboard handling).
- Ignores composition rules (e.g., omits required AlertDialog sub-components).
- Has no awareness of theme overrides for dark mode support.
- Guesses breakpoints and container widths rather than using the system's layout primitives.

## With ds-mcp: what the agent queries

When ds-mcp is connected, the agent can query the design system before
generating code. A typical sequence:

### 1. Discover components

**`list-components`** — The agent sees all 13 available components with
lifecycle status. It now knows the exact names: Input (not TextInput),
Select (not Dropdown), Switch (not Toggle). Every component is marked
`stable`, so nothing is experimental or draft.

**`list-components { status: "stable" }`** — If the agent wants only
production-ready components, it can filter by status.

### 2. Get the pattern

**`get-pattern { id: "settings-form" }`** — The agent gets structured
guidance: use Card as a wrapper, Label on every control, Separator
between sections, Button in CardFooter, and which control type to use
for which kind of setting (Input for free text, Select for constrained
choices, Switch for on/off, Checkbox for opt-in).

### 3. Retrieve component details with accessibility and composition

**`get-component { id: "card" }`** — Returns props, tokens, and v0.2
composition rules: the agent learns that Card is composed of CardHeader,
CardTitle, CardDescription, CardContent, and CardFooter. It also learns
the constraint: never nest a Card inside another Card.

**`get-component { id: "input" }`** — Returns props with semantic
`propRole` annotations (e.g., `type` has `propRole: "choice"`,
`disabled` has `propRole: "flag"`), plus accessibility constraints:
the agent learns that every Input must have an `id` matching a Label's
`htmlFor`, and should set `aria-invalid` on validation errors.

**`get-component { id: "alert-dialog" }`** — Returns the full
composition tree: 8 sub-components (AlertDialogTrigger,
AlertDialogContent, AlertDialogTitle, etc.) with `required` flags. The
accessibility section tells the agent about focus trapping, the
`alertdialog` role, and that Escape does NOT dismiss this dialog. The
constraints section says it MUST include both action and cancel buttons.

### 4. Get framework bindings with sub-component exports

**`get-framework-mapping { framework: "react", componentId: "alert-dialog" }`**
— Returns the import path (`@/components/ui/alert-dialog`), install
command, and a `subComponents` map with the named export for each
sub-component (e.g., `AlertDialogTrigger`, `AlertDialogContent`). The
agent knows exactly what to import.

**`get-framework-mapping { framework: "react" }`** — Without a
`componentId`, returns framework-level info for all components at once.

### 5. Check anti-patterns with severity

**`list-antipatterns`** — The agent sees all anti-patterns with severity
levels. Three are `must-not` (Dialog for destructive actions, nested
interactive elements, styled div as button), one is `should-not`
(hardcoded colors), and one is `should-not` (hidden labels).

**`list-antipatterns { severity: "must-not" }`** — Filters to only the
strictest violations the agent must avoid.

### 6. Query theme overrides for dark mode

**`get-theme { id: "dark" }`** — The agent gets the full dark theme
override map: every token that changes between light and dark mode. It
knows that `color.background` becomes `hsl(222.2, 84%, 4.9%)` and
`color.foreground` becomes `hsl(210, 40%, 98%)`. This eliminates
guesswork about dark mode values.

**`get-theme { id: "high-contrast" }`** — For accessibility, the agent
can also query the high-contrast theme overrides.

### 7. Get layout primitives for responsive design

**`get-layout`** — Returns breakpoints (sm through 2xl with min-widths),
the 12-column grid config with 1.5rem gutters, container sizes for
different content widths, and the spacing scale (4px base unit). The
agent uses the `md` container (768px max-width) for the settings form
and the `md` breakpoint (768px) for responsive layout adjustments.

### 8. Search tokens

**`search-tokens { query: "spacing" }`** — Finds all spacing tokens
with their values, descriptions, and tier (primitive). The agent uses
`sp-4` (1rem) for standard padding between form fields.

**`search-tokens { query: "semantic" }`** — Finds tokens by tier,
helping the agent choose semantic tokens over primitives.

## The difference

Without ds-mcp, the agent guesses and the developer corrects. With
ds-mcp, the agent queries and generates code that uses the right
components, the right props, the right tokens, the right patterns,
the correct accessibility attributes, the correct sub-component
composition, and the correct theme overrides from the start.

The dspack file is the single source of truth. When the design system
changes, the dspack file is updated, and every agent that queries it gets
the current answer.

## v0.1 compatibility

The v0.1 example ([shadcn-ui.dspack.json](../examples/shadcn-ui.dspack.json))
still works with ds-mcp. When loaded, the agent gets the same 13
components, 4 patterns, 3 anti-patterns, and framework bindings — but
without lifecycle status, accessibility constraints, composition rules,
themes, or layout primitives. Upgrading to v0.2 is additive: add the
new sections to your existing dspack file.

## Try it

See [examples/prompts/settings-form-with-ds-mcp.md](../examples/prompts/settings-form-with-ds-mcp.md) for a ready-to-use prompt.
