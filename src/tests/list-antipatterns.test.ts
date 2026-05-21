import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listAntipatterns } from '../tools/list-antipatterns.js';
import { fixture } from './fixture.js';

describe('list-antipatterns', () => {
  it('returns all anti-patterns', () => {
    const result = listAntipatterns(fixture);
    assert.equal(result.length, 2);

    const divAsButton = result.find((a) => a.id === 'div-as-button');
    assert.ok(divAsButton);
    assert.equal(divAsButton.name, 'Div as Button');
    assert.ok(divAsButton.reason);
    assert.equal(divAsButton.insteadUse, 'form-layout');
    assert.ok(divAsButton.components);
    assert.ok(divAsButton.tags);
  });

  it('returns empty array when no anti-patterns defined', () => {
    const noAntiPatterns = { ...fixture, antiPatterns: undefined };
    const result = listAntipatterns(noAntiPatterns);
    assert.deepEqual(result, []);
  });
});
