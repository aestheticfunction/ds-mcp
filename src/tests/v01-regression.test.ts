import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchTokens } from '../tools/search-tokens.js';
import { listComponents } from '../tools/list-components.js';
import { listAntipatterns } from '../tools/list-antipatterns.js';
import { getComponent } from '../tools/get-component.js';
import { getToken } from '../tools/get-token.js';
import { getFrameworkMapping } from '../tools/get-framework-mapping.js';
import { fixture } from './fixture.js';

describe('v0.1 regression: exact output shapes', () => {
  it('list-components returns exactly {id, name, description, deprecated}', () => {
    const result = listComponents(fixture);
    const button = result.find((c) => c.id === 'button')!;
    const keys = Object.keys(button).sort();
    assert.deepEqual(keys, ['deprecated', 'description', 'id', 'name']);
    assert.equal(typeof button.deprecated, 'boolean');
    assert.equal(button.deprecated, false);
    assert.ok(!('status' in button));
  });

  it('list-components marks deprecated correctly for v0.1', () => {
    const result = listComponents(fixture);
    const legacy = result.find((c) => c.id === 'legacy-widget')!;
    assert.equal(legacy.deprecated, true);
    assert.ok(!('status' in legacy));
  });

  it('search-tokens returns {category, name, entry} with v0.1 fields only', () => {
    const results = searchTokens(fixture, { query: 'primary' });
    const primary = results.find((r) => r.name === 'primary')!;
    const keys = Object.keys(primary).sort();
    assert.deepEqual(keys, ['category', 'entry', 'name']);
    assert.equal(primary.category, 'color');
    const entryKeys = Object.keys(primary.entry).sort();
    assert.deepEqual(entryKeys, ['description', 'type', 'value']);
  });

  it('list-antipatterns returns full entries without severity for v0.1', () => {
    const result = listAntipatterns(fixture);
    const divAsButton = result.find((a) => a.id === 'div-as-button')!;
    assert.ok(!('severity' in divAsButton));
    assert.equal(divAsButton.reason, 'Breaks keyboard navigation and screen reader support');
  });

  it('get-component returns v0.1 fields without v0.2 additions', () => {
    const result = getComponent(fixture, { id: 'button' });
    assert.equal(result.found, true);
    if (!result.found) return;
    const comp = result.result;
    assert.ok(!('status' in comp));
    assert.ok(!('accessibility' in comp));
    assert.ok(!('composition' in comp));
    assert.ok(!('constraints' in comp));
    assert.equal(comp.name, 'Button');
    assert.ok(comp.props);
    assert.ok(comp.tokens);
  });

  it('get-token returns v0.1 token fields', () => {
    const result = getToken(fixture, { category: 'color', name: 'primary' });
    assert.equal(result.found, true);
    if (!result.found) return;
    const token = result.result as Record<string, unknown>;
    assert.ok(!('status' in token));
    assert.ok(!('tier' in token));
    assert.ok(!('aliasOf' in token));
    assert.equal(token.value, '#007bff');
    assert.equal(token.type, 'color');
  });

  it('get-framework-mapping merge does not include subComponents for v0.1', () => {
    const result = getFrameworkMapping(fixture, { framework: 'react', componentId: 'button' });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.ok(!('subComponents' in result.result));
    assert.equal(result.result.exportName, 'Button');
    assert.equal(result.result.importPath, '@test/ui/button');
  });
});
