import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listComponents } from '../tools/list-components.js';
import { fixture } from './fixture.js';

describe('list-components', () => {
  it('returns all components with id, name, description, deprecated', () => {
    const result = listComponents(fixture);
    assert.equal(result.length, 3);

    const button = result.find((c) => c.id === 'button');
    assert.ok(button);
    assert.equal(button.name, 'Button');
    assert.equal(button.deprecated, false);

    const legacy = result.find((c) => c.id === 'legacy-widget');
    assert.ok(legacy);
    assert.equal(legacy.deprecated, true);
  });

  it('returns empty array when no components defined', () => {
    const noComponents = { ...fixture, components: undefined };
    const result = listComponents(noComponents);
    assert.deepEqual(result, []);
  });
});
