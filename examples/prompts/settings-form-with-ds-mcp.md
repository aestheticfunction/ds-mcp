# Example Prompt: Settings Form with ds-mcp

Copy this prompt into your MCP-connected agent. It instructs the agent to query the design system before generating code.

---

## Prompt

> Build a settings form for a user profile page using our design system.
>
> Before writing any code:
> 1. Call `list-components` to see what components are available.
> 2. Call `get-pattern` with id `settings-form` to get the recommended layout and control selection guidance.
> 3. Call `get-component` for each component you plan to use (at minimum: card, label, input, select, switch, checkbox, textarea, separator, button) to get their props and usage guidance.
> 4. Call `get-framework-mapping` with framework `react` and each component's ID to get the correct import paths and install commands.
> 5. Call `list-antipatterns` to check for patterns to avoid.
>
> The form should include:
> - Display name (text input)
> - Email address (text input)
> - Bio (multi-line text)
> - Preferred language (select from a list)
> - Enable email notifications (on/off toggle)
> - Opt in to marketing emails (checkbox, off by default)
> - A save button
>
> Use the design system's tokens for all colors and spacing. Associate every form control with a Label. Use Card as the form container with appropriate sub-components.

---

## Expected tool calls

The agent should make these calls (order may vary):

| Call | Purpose |
|------|---------|
| `list-components` | Discover available components |
| `get-pattern { id: "settings-form" }` | Get layout and control selection guidance |
| `get-component { id: "card" }` | Card container props and structure |
| `get-component { id: "label" }` | Label association guidance |
| `get-component { id: "input" }` | Text input props |
| `get-component { id: "textarea" }` | Multi-line input props |
| `get-component { id: "select" }` | Select dropdown props and sub-components |
| `get-component { id: "switch" }` | Toggle switch props |
| `get-component { id: "checkbox" }` | Checkbox props |
| `get-component { id: "separator" }` | Section divider props |
| `get-component { id: "button" }` | Submit button props and variants |
| `get-framework-mapping { framework: "react", componentId: "card" }` | Import path and install command |
| `get-framework-mapping { framework: "react", componentId: "label" }` | Import path and install command |
| `list-antipatterns` | Patterns to avoid |
