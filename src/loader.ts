import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- ajv/dist/2020 has broken ESM types
import { createRequire } from 'node:module';
import type { DspackDocument } from './types.js';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, '..', 'src', 'schema', 'dspack.v0.1.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

const ajv = new Ajv2020({ allErrors: true, validateFormats: false });
const validate = ajv.compile(schema);

export function loadDspack(filePath: string): DspackDocument {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read dspack file: ${msg}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON in dspack file: ${msg}`);
  }

  if (!validate(parsed)) {
    const errors = (validate.errors as Array<{ instancePath?: string; message?: string }>)
      .map((e) => `  ${e.instancePath || '/'}: ${e.message}`)
      .join('\n');
    throw new Error(`dspack schema validation failed:\n${errors}`);
  }

  const doc = parsed as DspackDocument;

  if (doc.dspack !== '0.1') {
    throw new Error(
      `Unsupported dspack version '${doc.dspack}'. This server supports version '0.1' only.`,
    );
  }

  return doc;
}
