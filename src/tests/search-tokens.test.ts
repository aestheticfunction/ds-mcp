import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchTokens } from '../tools/search-tokens.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

describe('search-tokens', () => {
  it('finds tokens by name', () => {
    const results = searchTokens(fixture, { query: 'primary' });
    assert.ok(results.length >= 2);
    assert.ok(results.some((r) => r.name === 'primary'));
    assert.ok(results.some((r) => r.name === 'primary-foreground'));
  });

  it('finds tokens by category name', () => {
    const results = searchTokens(fixture, { query: 'spacing' });
    assert.ok(results.length >= 2);
    assert.ok(results.every((r) => r.category === 'spacing'));
  });

  it('finds tokens by description', () => {
    const results = searchTokens(fixture, { query: 'brand' });
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'primary');
  });

  it('finds tokens by type', () => {
    const results = searchTokens(fixture, { query: 'dimension' });
    assert.ok(results.length >= 2);
    assert.ok(results.every((r) => r.entry.type === 'dimension'));
  });

  it('is case-insensitive', () => {
    const lower = searchTokens(fixture, { query: 'color' });
    const upper = searchTokens(fixture, { query: 'COLOR' });
    const mixed = searchTokens(fixture, { query: 'CoLoR' });
    assert.equal(lower.length, upper.length);
    assert.equal(lower.length, mixed.length);
    assert.ok(lower.length > 0);
  });

  it('returns empty array for no match', () => {
    const results = searchTokens(fixture, { query: 'zzz-nonexistent-zzz' });
    assert.deepEqual(results, []);
  });

  it('includes category and name in results', () => {
    const results = searchTokens(fixture, { query: 'sp-1' });
    assert.equal(results.length, 1);
    assert.equal(results[0].category, 'spacing');
    assert.equal(results[0].name, 'sp-1');
    assert.equal(results[0].entry.value, '0.25rem');
  });

  it('returns empty array when document has no tokens', () => {
    const noTokens = { ...fixture, tokens: undefined };
    const results = searchTokens(noTokens, { query: 'anything' });
    assert.deepEqual(results, []);
  });

  it('finds tokens by tier (v0.2)', () => {
    const results = searchTokens(fixtureV02, { query: 'component' });
    assert.ok(results.some((r) => r.name === 'component-padding'));
    assert.ok(results.some((r) => r.entry.tier === 'component'));
  });

  it('finds tokens by status string (v0.2)', () => {
    const results = searchTokens(fixtureV02, { query: 'deprecated' });
    assert.ok(results.some((r) => r.name === 'deprecated-red'));
  });

  it('finds tokens by status object platform value (v0.2)', () => {
    const results = searchTokens(fixtureV02, { query: 'experimental' });
    assert.ok(results.some((r) => r.name === 'primary-foreground'));
  });

  it('finds tokens by aliasOf string (v0.2)', () => {
    const results = searchTokens(fixtureV02, { query: 'background' });
    assert.ok(results.some((r) => r.name === 'surface-bg'));
  });

  it('finds tokens by aliasOf structured reference (v0.2)', () => {
    const results = searchTokens(fixtureV02, { query: 'sp-2' });
    assert.ok(results.some((r) => r.name === 'component-padding'));
  });
});
