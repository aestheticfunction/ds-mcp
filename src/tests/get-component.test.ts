import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getComponent } from '../tools/get-component.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

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

  it('returns status when present (v0.2)', () => {
    const result = getComponent(fixtureV02, { id: 'button' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.result.status, 'stable');
  });

  it('returns accessibility when present (v0.2)', () => {
    const result = getComponent(fixtureV02, { id: 'button' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.ok(result.result.accessibility);
    assert.equal(result.result.accessibility!.role, 'button');
    assert.equal(result.result.accessibility!.labelRequirement, 'required-visible');
    assert.ok(result.result.accessibility!.keyboardInteractions);
    assert.ok(result.result.accessibility!.keyboardInteractions!.length >= 2);
  });

  it('returns composition when present (v0.2)', () => {
    const result = getComponent(fixtureV02, { id: 'alert-dialog' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.ok(result.result.composition);
    assert.ok(result.result.composition!.subComponents);
    assert.ok(result.result.composition!.subComponents!.length >= 2);
    assert.ok(result.result.composition!.requiredChildren);
  });

  it('returns constraints when present (v0.2)', () => {
    const result = getComponent(fixtureV02, { id: 'button' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.ok(result.result.constraints);
    assert.ok(result.result.constraints!.length >= 2);
    assert.equal(result.result.constraints![0].severity, 'should');
    assert.ok(result.result.constraints![0].context);
    assert.ok(result.result.constraints![0].rule);
  });

  it('returns per-platform status object (v0.2)', () => {
    const result = getComponent(fixtureV02, { id: 'alert-dialog' });
    assert.equal(result.found, true);
    if (!result.found) return;
    const status = result.result.status;
    assert.ok(typeof status === 'object' && status !== null);
  });
});
