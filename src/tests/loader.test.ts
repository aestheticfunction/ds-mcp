import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadDspack } from '../loader.js';
import { fixture } from './fixture.js';
import { fixtureV02 } from './fixture-v02.js';

const tempDirs: string[] = [];

function withTempFile(content: string, ext = '.dspack.json'): string {
  const dir = mkdtempSync(join(tmpdir(), 'ds-mcp-test-'));
  tempDirs.push(dir);
  const filePath = join(dir, `test${ext}`);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

describe('loadDspack', () => {
  it('loads a valid dspack document', () => {
    const path = withTempFile(JSON.stringify(fixture));
    const doc = loadDspack(path);
    assert.equal(doc.dspack, '0.1');
    assert.equal(doc.name, 'test-design-system');
    assert.ok(doc.tokens);
    assert.ok(doc.components);
    assert.ok(doc.patterns);
    assert.ok(doc.antiPatterns);
    assert.ok(doc.frameworkBindings);
  });

  it('loads a minimal valid document (dspack + name only)', () => {
    const minimal = { dspack: '0.1', name: 'minimal' };
    const path = withTempFile(JSON.stringify(minimal));
    const doc = loadDspack(path);
    assert.equal(doc.name, 'minimal');
    assert.equal(doc.tokens, undefined);
  });

  it('throws on nonexistent file', () => {
    assert.throws(
      () => loadDspack('/tmp/nonexistent-dspack-file.json'),
      /Failed to read dspack file/,
    );
  });

  it('throws on invalid JSON', () => {
    const path = withTempFile('{ not valid json }}}');
    assert.throws(() => loadDspack(path), /Invalid JSON/);
  });

  it('throws on schema-invalid document (missing required name)', () => {
    const invalid = { dspack: '0.1' };
    const path = withTempFile(JSON.stringify(invalid));
    assert.throws(() => loadDspack(path), /schema validation failed/);
  });

  it('throws on schema-invalid document (wrong dspack type)', () => {
    const invalid = { dspack: 123, name: 'bad' };
    const path = withTempFile(JSON.stringify(invalid));
    assert.throws(() => loadDspack(path), /Unsupported dspack version/);
  });

  it('throws on wrong dspack version', () => {
    const wrongVersion = { dspack: '2.0', name: 'future' };
    const path = withTempFile(JSON.stringify(wrongVersion));
    assert.throws(() => loadDspack(path), /Unsupported dspack version/);
  });

  it('loads a valid v0.2 document', () => {
    const path = withTempFile(JSON.stringify(fixtureV02));
    const doc = loadDspack(path);
    assert.equal(doc.dspack, '0.2');
    assert.equal(doc.name, 'test-design-system-v02');
    assert.ok(doc.tokens);
    assert.ok(doc.components);
    assert.ok(doc.themes);
    assert.ok(doc.layout);
  });

  it('loads a minimal v0.2 document (dspack + name only)', () => {
    const minimal = { dspack: '0.2', name: 'minimal-v02' };
    const path = withTempFile(JSON.stringify(minimal));
    const doc = loadDspack(path);
    assert.equal(doc.dspack, '0.2');
    assert.equal(doc.name, 'minimal-v02');
    assert.equal(doc.tokens, undefined);
    assert.equal(doc.themes, undefined);
    assert.equal(doc.layout, undefined);
  });

  it('accepts a minimal version 0.3 document (validated against the v0.3 schema)', () => {
    const minimalV03 = { dspack: '0.3', name: 'minimal-v03' };
    const path = withTempFile(JSON.stringify(minimalV03));
    const doc = loadDspack(path);
    assert.equal(doc.dspack, '0.3');
  });

  it('accepts a minimal version 0.4 document (validated against the v0.4 schema)', () => {
    const minimalV04 = { dspack: '0.4', name: 'minimal-v04' };
    const path = withTempFile(JSON.stringify(minimalV04));
    const doc = loadDspack(path);
    assert.equal(doc.dspack, '0.4');
  });

  it('rejects version 0.5 (the next unsupported version)', () => {
    const futureVersion = { dspack: '0.5', name: 'future' };
    const path = withTempFile(JSON.stringify(futureVersion));
    assert.throws(() => loadDspack(path), /Unsupported dspack version '0.5'/);
  });

  it('error message lists supported versions', () => {
    const bad = { dspack: '9.9', name: 'bad' };
    const path = withTempFile(JSON.stringify(bad));
    assert.throws(() => loadDspack(path), /Supported versions: 0\.1, 0\.2, 0\.3, 0\.4/);
  });
});
