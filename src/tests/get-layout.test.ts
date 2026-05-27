import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLayout } from '../tools/get-layout.js';
import { fixtureV02 } from './fixture-v02.js';
import { fixture } from './fixture.js';

describe('get-layout', () => {
  it('returns layout when defined', () => {
    const result = getLayout(fixtureV02);
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.ok(result.result.breakpoints);
    assert.ok(result.result.grid);
    assert.ok(result.result.containers);
    assert.ok(result.result.spacingScale);
  });

  it('returns breakpoints with minWidth', () => {
    const result = getLayout(fixtureV02);
    assert.equal(result.found, true);
    if (!result.found) return;
    const sm = result.result.breakpoints!['sm'];
    assert.equal(sm.minWidth, '640px');
    assert.ok(sm.description);
  });

  it('returns grid config', () => {
    const result = getLayout(fixtureV02);
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.result.grid!.columns, 12);
    assert.equal(result.result.grid!.gutter, '1rem');
  });

  it('returns not-found when no layout section (v0.1 doc)', () => {
    const result = getLayout(fixture);
    assert.equal(result.found, false);
    if (result.found) return;
    assert.ok(result.error.includes('no layout section'));
    assert.ok(result.error.includes(fixture.name));
  });
});
