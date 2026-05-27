import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFrameworkMapping } from '../tools/get-framework-mapping.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

describe('get-framework-mapping', () => {
  it('returns top-level binding without componentId', () => {
    const result = getFrameworkMapping(fixture, { framework: 'react' });
    assert.equal(result.found, true);
    const binding = (result as { found: true; result: Record<string, unknown> }).result;
    assert.equal(binding.name, 'React');
    assert.equal(binding.package, '@test/ui');
    assert.equal(binding.installCommand, 'npm install @test/ui');
    assert.ok(binding.description);
    assert.ok(binding.guidance);
    assert.equal(binding.components, undefined);
  });

  it('merges framework and component binding with componentId', () => {
    const result = getFrameworkMapping(fixture, { framework: 'react', componentId: 'button' });
    assert.equal(result.found, true);
    const binding = (result as { found: true; result: Record<string, unknown> }).result;
    assert.equal(binding.name, 'React');
    assert.equal(binding.package, '@test/ui');
    assert.equal(binding.importPath, '@test/ui/button');
    assert.equal(binding.exportName, 'Button');
    // Component-level installCommand overrides framework-level
    assert.equal(binding.installCommand, 'npx test-ui add button');
    // Component-level guidance overrides framework-level
    assert.equal(binding.guidance, 'Supports ref forwarding');
  });

  it('preserves framework-level fields when component binding lacks them', () => {
    const result = getFrameworkMapping(fixture, { framework: 'react', componentId: 'card' });
    assert.equal(result.found, true);
    const binding = (result as { found: true; result: Record<string, unknown> }).result;
    assert.equal(binding.name, 'React');
    assert.equal(binding.package, '@test/ui');
    assert.equal(binding.importPath, '@test/ui/card');
    assert.equal(binding.exportName, 'Card');
    // Card binding has no installCommand, so framework-level is preserved
    assert.equal(binding.installCommand, 'npm install @test/ui');
    // Card binding has no guidance, so framework-level is preserved
    assert.equal(binding.guidance, 'Use the component library for all UI elements');
  });

  it('returns not-found for nonexistent framework', () => {
    const result = getFrameworkMapping(fixture, { framework: 'vue' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("framework 'vue' not found"));
    assert.ok(result.error.includes('react'));
  });

  it('returns not-found for nonexistent componentId', () => {
    const result = getFrameworkMapping(fixture, { framework: 'react', componentId: 'nonexistent' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("component 'nonexistent' not found"));
    assert.ok(result.error.includes('button'));
    assert.ok(result.error.includes('card'));
  });

  it('includes dspack name in error messages', () => {
    const result = getFrameworkMapping(fixture, { framework: 'nope' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("dspack 'test-design-system'"));
  });

  it('returns empty frameworks hint when no bindings defined', () => {
    const noBindings = { ...fixture, frameworkBindings: undefined };
    const result = getFrameworkMapping(noBindings, { framework: 'react' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes('No framework bindings are defined'));
  });

  it('includes subComponents in merged result (v0.2)', () => {
    const result = getFrameworkMapping(fixtureV02, { framework: 'react', componentId: 'alert-dialog' });
    assert.equal(result.found, true);
    const binding = (result as { found: true; result: Record<string, unknown> }).result;
    assert.ok(binding.subComponents);
    const subs = binding.subComponents as Record<string, { exportName?: string }>;
    assert.equal(subs['alert-dialog-trigger'].exportName, 'AlertDialogTrigger');
    assert.equal(subs['alert-dialog-content'].exportName, 'AlertDialogContent');
  });
});
