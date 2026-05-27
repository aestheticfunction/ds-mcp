import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTheme } from '../tools/get-theme.js';
import { fixtureV02 } from './fixture-v02.js';
import { fixture } from './fixture.js';

describe('get-theme', () => {
  it('returns a theme for a valid ID', () => {
    const result = getTheme(fixtureV02, { id: 'dark' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.result.name, 'Dark');
    assert.ok(result.result.description);
    assert.ok(result.result.overrides);
    assert.equal(result.result.overrides['color.primary'], '#4da3ff');
  });

  it('returns overrides with dot-path keys', () => {
    const result = getTheme(fixtureV02, { id: 'dark' });
    assert.equal(result.found, true);
    if (!result.found) return;
    const keys = Object.keys(result.result.overrides);
    assert.ok(keys.every((k) => k.includes('.')));
  });

  it('returns not-found for nonexistent theme ID', () => {
    const result = getTheme(fixtureV02, { id: 'nonexistent' });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.ok(result.error.includes('nonexistent'));
    assert.ok(result.error.includes('Available themes:'));
    assert.ok(result.error.includes('dark'));
  });

  it('returns not-found when no themes defined (v0.1 doc)', () => {
    const result = getTheme(fixture, { id: 'dark' });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.ok(result.error.includes('No themes are defined'));
  });

  it('includes dspack name in error message', () => {
    const result = getTheme(fixtureV02, { id: 'nonexistent' });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.ok(result.error.includes(fixtureV02.name));
  });
});
