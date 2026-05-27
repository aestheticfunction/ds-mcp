import type { DspackDocument } from '../types.js';

export const fixtureV02: DspackDocument = {
  dspack: '0.2',
  name: 'test-design-system-v02',
  description: 'Fixture for ds-mcp v0.2 unit tests',
  version: '2.0.0',
  metadata: {
    generatedBy: 'hand-authored',
    source: 'https://example.com/ds',
    license: 'MIT',
  },
  tokens: {
    color: {
      description: 'Color palette',
      tier: 'semantic',
      values: {
        primary: {
          value: '#007bff',
          description: 'Primary brand color',
          type: 'color',
          status: 'stable',
          tier: 'semantic',
        },
        'primary-foreground': {
          value: '#ffffff',
          type: 'color',
          status: {
            default: 'stable',
            platforms: {
              react: { stage: 'stable' },
              vue: { stage: 'experimental', note: 'Not yet tested in Vue 3' },
            },
          },
        },
        'deprecated-red': {
          value: '#ff0000',
          type: 'color',
          deprecated: true,
          aliases: ['danger', 'error'],
          status: 'deprecated',
          tier: 'primitive',
        },
        'surface-bg': {
          value: 'hsl(0 0% 100%)',
          description: 'Default surface background',
          type: 'color',
          tier: 'semantic',
          aliasOf: 'background',
        },
        background: {
          value: 'hsl(0 0% 100%)',
          description: 'Page background color',
          type: 'color',
          tier: 'primitive',
        },
      },
    },
    spacing: {
      description: 'Spacing scale',
      tier: 'primitive',
      values: {
        'sp-1': {
          value: '0.25rem',
          description: 'Smallest spacing unit',
          type: 'dimension',
          tier: 'primitive',
        },
        'sp-2': {
          value: '0.5rem',
          type: 'dimension',
          tier: 'primitive',
        },
        'component-padding': {
          value: '1rem',
          type: 'dimension',
          tier: 'component',
          aliasOf: { category: 'spacing', token: 'sp-2' },
        },
      },
    },
  },
  components: {
    button: {
      name: 'Button',
      description: 'Interactive button element',
      whenToUse: 'For primary actions and form submissions',
      whenNotToUse: 'For navigation; use Link instead',
      status: 'stable',
      props: {
        variant: {
          type: 'enum',
          values: [
            { value: 'default', description: 'Standard button style' },
            { value: 'destructive', description: 'Indicates a destructive action' },
            { value: 'outline', description: 'Outlined style for secondary actions' },
          ],
          default: 'default',
          description: 'Visual style',
          propRole: 'choice',
        },
        disabled: {
          type: 'boolean',
          default: false,
          required: false,
          propRole: 'flag',
        },
        size: {
          type: 'enum',
          values: ['sm', 'md', 'lg'],
          default: 'md',
          propRole: 'dimension',
        },
      },
      tokens: ['primary', 'primary-foreground'],
      relatedComponents: ['input'],
      tags: ['interactive', 'form'],
      accessibility: {
        role: 'button',
        labelRequirement: 'required-visible',
        requiredAttributes: [
          { attribute: 'aria-disabled', description: 'Set to true when the button is disabled', condition: 'When disabled prop is true' },
        ],
        keyboardInteractions: [
          { key: 'Enter', description: 'Activates the button' },
          { key: 'Space', description: 'Activates the button' },
        ],
        focusManagement: 'Receives focus via tab order. Focus ring visible on keyboard focus.',
      },
      constraints: [
        { context: 'Inside a form', rule: 'Use type="submit" for the primary action', severity: 'should' as const },
        { context: 'Destructive action', rule: 'Must use variant="destructive" and confirm via AlertDialog', severity: 'must' as const },
      ],
    },
    'alert-dialog': {
      name: 'Alert Dialog',
      description: 'Modal confirmation for destructive actions',
      status: {
        default: 'stable',
        platforms: {
          react: { stage: 'stable', since: '1.0.0' },
          vue: { stage: 'draft', migrateTo: 'dialog', note: 'Use Dialog with confirm pattern in Vue' },
        },
      },
      props: {
        open: {
          type: 'boolean',
          description: 'Whether the dialog is open',
          propRole: 'state',
        },
        onOpenChange: {
          type: 'function',
          description: 'Callback when open state changes',
          propRole: 'handler',
        },
      },
      tokens: ['primary'],
      relatedComponents: ['button', 'dialog'],
      tags: ['overlay', 'confirmation'],
      accessibility: {
        role: 'alertdialog',
        labelRequirement: 'required-accessible-name',
        keyboardInteractions: [
          { key: 'Escape', description: 'Closes the dialog and returns focus to trigger' },
          { key: 'Tab', description: 'Moves focus within the dialog' },
        ],
        focusManagement: 'Focus trapped inside dialog. Returns to trigger on close.',
      },
      composition: {
        subComponents: [
          { id: 'alert-dialog-trigger', name: 'AlertDialogTrigger', description: 'Button that opens the dialog', required: true },
          { id: 'alert-dialog-content', name: 'AlertDialogContent', description: 'Dialog content wrapper', required: true },
          { id: 'alert-dialog-header', name: 'AlertDialogHeader', description: 'Header section' },
          { id: 'alert-dialog-footer', name: 'AlertDialogFooter', description: 'Footer with action buttons' },
          { id: 'alert-dialog-title', name: 'AlertDialogTitle', description: 'Dialog title', required: true },
          { id: 'alert-dialog-description', name: 'AlertDialogDescription', description: 'Dialog description' },
          { id: 'alert-dialog-action', name: 'AlertDialogAction', description: 'Confirm action button', required: true },
          { id: 'alert-dialog-cancel', name: 'AlertDialogCancel', description: 'Cancel button', required: true },
        ],
        requiredChildren: ['alert-dialog-trigger', 'alert-dialog-content'],
        notes: 'AlertDialogContent must contain AlertDialogTitle for accessibility.',
      },
      constraints: [
        { context: 'Any usage', rule: 'Must include both an action and a cancel button', severity: 'must' as const },
        { context: 'Non-destructive confirmation', rule: 'Use Dialog instead of AlertDialog', severity: 'should-not' as const },
      ],
    },
    card: {
      name: 'Card',
      description: 'Container for grouped content',
      status: 'stable',
      props: {
        padding: {
          type: 'enum',
          values: ['sm', 'md', 'lg'],
          default: 'md',
          propRole: 'dimension',
        },
      },
      tokens: ['sp-1', 'sp-2'],
      tags: ['layout'],
    },
    'legacy-widget': {
      name: 'Legacy Widget',
      description: 'Old widget component',
      deprecated: true,
      deprecatedMessage: 'Use Card instead',
      status: 'deprecated',
      tags: ['deprecated'],
    },
    'draft-component': {
      name: 'Draft Component',
      description: 'Component in draft status',
      status: 'draft',
      tags: ['experimental'],
    },
  },
  patterns: [
    {
      id: 'form-layout',
      name: 'Form Layout',
      description: 'Standard form field arrangement',
      intent: 'Consistent form structure',
      context: 'Settings panels, data entry',
      components: ['card', 'button'],
      guidance: 'Wrap form in Card, place actions in footer',
      relatedPatterns: [],
      tags: ['form', 'layout'],
    },
    {
      id: 'action-confirmation',
      name: 'Action Confirmation',
      description: 'Confirm before destructive actions',
      intent: 'Prevent accidental data loss',
      components: ['button', 'alert-dialog'],
      tags: ['safety'],
    },
  ],
  antiPatterns: [
    {
      id: 'div-as-button',
      name: 'Div as Button',
      description: 'Using a div with onClick instead of Button',
      reason: 'Breaks keyboard navigation and screen reader support',
      severity: 'must-not',
      insteadUse: 'form-layout',
      components: ['button'],
      tags: ['accessibility'],
    },
    {
      id: 'inline-styles',
      name: 'Inline Styles for Tokens',
      description: 'Hardcoding token values as inline styles',
      reason: 'Bypasses the token system making updates impossible',
      severity: 'should-not',
      components: ['button', 'card'],
      tags: ['tokens', 'maintainability'],
    },
    {
      id: 'color-hardcoding',
      name: 'Hardcoded Colors',
      description: 'Using raw color values instead of design tokens',
      reason: 'Theme switching and brand updates become impossible',
      severity: 'discouraged',
      components: [],
      tags: ['tokens'],
    },
  ],
  frameworkBindings: {
    react: {
      name: 'React',
      package: '@test/ui',
      installCommand: 'npm install @test/ui',
      description: 'React component library',
      guidance: 'Use the component library for all UI elements',
      components: {
        button: {
          importPath: '@test/ui/button',
          installCommand: 'npx test-ui add button',
          exportName: 'Button',
          guidance: 'Supports ref forwarding',
        },
        card: {
          importPath: '@test/ui/card',
          exportName: 'Card',
        },
        'alert-dialog': {
          importPath: '@test/ui/alert-dialog',
          installCommand: 'npx test-ui add alert-dialog',
          exportName: 'AlertDialog',
          guidance: 'Built on Radix AlertDialog primitive',
          subComponents: {
            'alert-dialog-trigger': { exportName: 'AlertDialogTrigger' },
            'alert-dialog-content': { exportName: 'AlertDialogContent' },
            'alert-dialog-header': { exportName: 'AlertDialogHeader' },
            'alert-dialog-footer': { exportName: 'AlertDialogFooter' },
            'alert-dialog-title': { exportName: 'AlertDialogTitle' },
            'alert-dialog-description': { exportName: 'AlertDialogDescription' },
            'alert-dialog-action': { exportName: 'AlertDialogAction' },
            'alert-dialog-cancel': { exportName: 'AlertDialogCancel' },
          },
        },
      },
    },
  },
  themes: {
    dark: {
      name: 'Dark',
      description: 'Dark mode theme with inverted colors',
      overrides: {
        'color.primary': '#4da3ff',
        'color.primary-foreground': '#000000',
        'color.background': 'hsl(0 0% 10%)',
      },
    },
    'high-contrast': {
      name: 'High Contrast',
      description: 'High contrast theme for accessibility',
      overrides: {
        'color.primary': '#0000ff',
        'color.primary-foreground': '#ffffff',
      },
    },
  },
  layout: {
    breakpoints: {
      sm: { minWidth: '640px', description: 'Small devices and up' },
      md: { minWidth: '768px', description: 'Tablets and up' },
      lg: { minWidth: '1024px', description: 'Desktops and up' },
      xl: { minWidth: '1280px', description: 'Large desktops' },
    },
    grid: {
      columns: 12,
      gutter: '1rem',
      margin: '1rem',
      description: '12-column grid with 1rem gutters',
    },
    containers: {
      sm: { maxWidth: '640px', description: 'Narrow content' },
      md: { maxWidth: '768px', description: 'Standard content width' },
      lg: { maxWidth: '1024px', description: 'Wide content' },
      xl: { maxWidth: '1280px', description: 'Full width content' },
    },
    spacingScale: {
      baseUnit: '0.25rem',
      description: 'Spacing scale based on 4px (0.25rem) base unit',
    },
  },
};
