# Example Prompt: Confirmation Dialog with ds-mcp

Copy this prompt into your MCP-connected agent. It instructs the agent to query the design system before generating code.

---

## Prompt

> Build a "Delete Account" confirmation dialog using our design system.
>
> Before writing any code:
> 1. Call `get-pattern` with id `destructive-action-confirmation` to get the recommended confirmation flow.
> 2. Call `get-component` with id `alert-dialog` to get the component's props, sub-components, and usage guidance.
> 3. Call `get-component` with id `button` to get the destructive variant details.
> 4. Call `list-antipatterns` to check for patterns to avoid — pay attention to the Dialog vs AlertDialog distinction.
> 5. Call `get-framework-mapping` with framework `react` and each component's ID to get import paths and install commands.
>
> The dialog should:
> - Be triggered by a "Delete Account" button using the destructive variant
> - Clearly state what will happen ("This will permanently delete your account and all associated data")
> - Provide a cancel option and a confirm option
> - Use AlertDialog, not Dialog
> - Use the destructive variant on the confirm button

---

## Expected tool calls

| Call | Purpose |
|------|---------|
| `get-pattern { id: "destructive-action-confirmation" }` | Confirmation flow guidance |
| `get-component { id: "alert-dialog" }` | AlertDialog sub-components and usage |
| `get-component { id: "button" }` | Button variants, especially destructive |
| `list-antipatterns` | Learn why Dialog is wrong for destructive actions |
| `get-framework-mapping { framework: "react", componentId: "alert-dialog" }` | Import path and install command |
| `get-framework-mapping { framework: "react", componentId: "button" }` | Import path and install command |
