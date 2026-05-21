import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPattern } from '../tools/get-pattern.js';
import { fixture } from './fixture.js';

describe('get-pattern', () => {
  it('returns a pattern for a valid ID', () => {
    const result = getPattern(fixture, { id: 'form-layout' });
    assert.equal(result.found, true);
    const pattern = (result as { found: true; result: unknown }).result as Record<string, unknown>;
    assert.equal(pattern.name, 'Form Layout');
    assert.equal(pattern.id, 'form-layout');
    assert.ok(pattern.description);
    assert.ok(pattern.intent);
    assert.ok(pattern.context);
    assert.ok(pattern.components);
    assert.ok(pattern.guidance);
  });

  it('returns not-found for nonexistent pattern', () => {
    const result = getPattern(fixture, { id: 'nonexistent' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("pattern 'nonexistent' not found"));
    assert.ok(result.error.includes('form-layout'));
    assert.ok(result.error.includes('action-confirmation'));
  });

  it('returns not-found with helpful message when no patterns exist', () => {
    const noPatterns = { ...fixture, patterns: undefined };
    const result = getPattern(noPatterns, { id: 'anything' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes('No patterns are defined'));
  });
});
