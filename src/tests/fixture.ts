import type { DspackDocument } from '../types.js';

export const fixture: DspackDocument = {
  dspack: '0.1',
  name: 'test-design-system',
  description: 'Minimal fixture for ds-mcp unit tests',
  version: '1.0.0',
  metadata: {
    generatedBy: 'hand-authored',
    source: 'https://example.com/ds',
    license: 'MIT',
  },
  tokens: {
    color: {
      description: 'Color palette',
      values: {
        primary: {
          value: '#007bff',
          description: 'Primary brand color',
          type: 'color',
        },
        'primary-foreground': {
          value: '#ffffff',
          type: 'color',
        },
        'deprecated-red': {
          value: '#ff0000',
          type: 'color',
          deprecated: true,
          aliases: ['danger', 'error'],
        },
      },
    },
    spacing: {
      description: 'Spacing scale',
      values: {
        'sp-1': {
          value: '0.25rem',
          description: 'Smallest spacing unit',
          type: 'dimension',
        },
        'sp-2': {
          value: '0.5rem',
          type: 'dimension',
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
      props: {
        variant: {
          type: 'enum',
          values: ['default', 'destructive', 'outline'],
          default: 'default',
          description: 'Visual style',
        },
        disabled: {
          type: 'boolean',
          default: false,
          required: false,
        },
      },
      tokens: ['primary', 'primary-foreground'],
      relatedComponents: ['input'],
      tags: ['interactive', 'form'],
    },
    card: {
      name: 'Card',
      description: 'Container for grouped content',
      props: {
        padding: {
          type: 'enum',
          values: ['sm', 'md', 'lg'],
          default: 'md',
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
      tags: ['deprecated'],
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
      components: ['button'],
      tags: ['safety'],
    },
  ],
  antiPatterns: [
    {
      id: 'div-as-button',
      name: 'Div as Button',
      description: 'Using a div with onClick instead of Button',
      reason: 'Breaks keyboard navigation and screen reader support',
      insteadUse: 'form-layout',
      components: ['button'],
      tags: ['accessibility'],
    },
    {
      id: 'inline-styles',
      name: 'Inline Styles for Tokens',
      description: 'Hardcoding token values as inline styles',
      reason: 'Bypasses the token system making updates impossible',
      components: ['button', 'card'],
      tags: ['tokens', 'maintainability'],
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
      },
    },
  },
};
