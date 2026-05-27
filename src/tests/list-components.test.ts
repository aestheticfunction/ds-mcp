import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listComponents } from '../tools/list-components.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

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

  it('includes status in summary for v0.2 components', () => {
    const result = listComponents(fixtureV02);
    const button = result.find((c) => c.id === 'button');
    assert.ok(button);
    assert.equal(button.status, 'stable');
  });

  it('omits status when not present (v0.1 doc)', () => {
    const result = listComponents(fixture);
    const button = result.find((c) => c.id === 'button');
    assert.ok(button);
    assert.ok(!('status' in button));
  });

  it('filters by status when parameter provided', () => {
    const result = listComponents(fixtureV02, { status: 'stable' });
    assert.ok(result.length > 0);
    assert.ok(result.every((c) => {
      if (typeof c.status === 'string') return c.status === 'stable';
      return true;
    }));
    assert.ok(result.some((c) => c.id === 'button'));
    assert.ok(!result.some((c) => c.id === 'draft-component'));
  });

  it('returns all when status parameter omitted', () => {
    const result = listComponents(fixtureV02);
    assert.equal(result.length, 5);
  });

  it('matches per-platform status correctly', () => {
    const result = listComponents(fixtureV02, { status: 'draft' });
    assert.ok(result.some((c) => c.id === 'alert-dialog'));
    assert.ok(result.some((c) => c.id === 'draft-component'));
  });
});
