import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getToken } from '../tools/get-token.js';
import { fixture } from './fixture.js';

describe('get-token', () => {
  it('returns a token entry for a valid category and name', () => {
    const result = getToken(fixture, { category: 'color', name: 'primary' });
    assert.equal(result.found, true);
    assert.ok('result' in result);
    const token = result.result as Record<string, unknown>;
    assert.equal(token.value, '#007bff');
    assert.equal(token.description, 'Primary brand color');
    assert.equal(token.type, 'color');
  });

  it('returns a deprecated token with aliases', () => {
    const result = getToken(fixture, { category: 'color', name: 'deprecated-red' });
    assert.equal(result.found, true);
    const token = (result as { found: true; result: unknown }).result as Record<string, unknown>;
    assert.equal(token.deprecated, true);
    assert.deepEqual(token.aliases, ['danger', 'error']);
  });

  it('returns not-found for nonexistent category', () => {
    const result = getToken(fixture, { category: 'typography', name: 'primary' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("category 'typography' not found"));
    assert.ok(result.error.includes('search-tokens'));
  });

  it('returns not-found for nonexistent token name', () => {
    const result = getToken(fixture, { category: 'color', name: 'nonexistent' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("token 'nonexistent' not found"));
    assert.ok(result.error.includes('search-tokens'));
  });

  it('includes dspack name in error message', () => {
    const result = getToken(fixture, { category: 'nope', name: 'nope' });
    assert.equal(result.found, false);
    assert.ok('error' in result);
    assert.ok(result.error.includes("dspack 'test-design-system'"));
  });
});
