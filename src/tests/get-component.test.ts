import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getComponent } from '../tools/get-component.js';
import { fixture } from './fixture.js';

describe('get-component', () => {
  it('returns a component entry for a valid ID', () => {
    const result = getComponent(fixture, { id: 'button' });
    assert.equal(result.found, true);
    const comp = (result as { found: true; result: unknown }).result as Record<string, unknown>;
    assert.equal(comp.name, 'Button');
    assert.equal(comp.description, 'Interactive button element');
    assert.ok(comp.whenToUse);
    assert.ok(comp.whenNotToUse);
    assert.ok(comp.props);
    assert.ok(comp.tokens);
    assert.ok(comp.relatedComponents);
    assert.ok(comp.tags);
  });

  it('returns a deprecated component with deprecatedMessage', () => {
    const result = getComponent(fixture, { id: 'legacy-widget' });
    assert.equal(result.found, true);
    const comp = (result as { found: true; result: unknown }).result as Record<string, unknown>;
    assert.equal(comp.deprecated, true);
    assert.equal(comp.deprecatedMessage, 'Use Card instead');
  });

  it('returns not-found for nonexistent component', () => {
    const result = getComponent(fixture, { id: 'nonexistent' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("component 'nonexistent' not found"));
    assert.ok(result.error.includes('list-components'));
  });

  it('includes dspack name in error message', () => {
    const result = getComponent(fixture, { id: 'nope' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("dspack 'test-design-system'"));
  });
});
