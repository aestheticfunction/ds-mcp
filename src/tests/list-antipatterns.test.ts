import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listAntipatterns } from '../tools/list-antipatterns.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

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

  it('returns severity field on v0.2 anti-patterns', () => {
    const result = listAntipatterns(fixtureV02);
    const divAsButton = result.find((a) => a.id === 'div-as-button');
    assert.ok(divAsButton);
    assert.equal(divAsButton.severity, 'must-not');
  });

  it('filters by severity when parameter provided', () => {
    const result = listAntipatterns(fixtureV02, { severity: 'must-not' });
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'div-as-button');
  });

  it('returns all when severity parameter omitted', () => {
    const result = listAntipatterns(fixtureV02);
    assert.equal(result.length, 3);
  });

  it('returns empty array when no anti-patterns match severity', () => {
    const result = listAntipatterns(fixture, { severity: 'must-not' });
    assert.deepEqual(result, []);
  });
});
