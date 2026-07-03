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

const schemaV01 = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'schema', 'dspack.v0.1.schema.json'), 'utf-8'));
const schemaV02 = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'schema', 'dspack.v0.2.schema.json'), 'utf-8'));
const schemaV03 = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'schema', 'dspack.v0.3.schema.json'), 'utf-8'));
const schemaV04 = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'schema', 'dspack.v0.4.schema.json'), 'utf-8'));

const ajv = new Ajv2020({ allErrors: true, validateFormats: false });
const validateV01 = ajv.compile(schemaV01);
const validateV02 = ajv.compile(schemaV02);
const validateV03 = ajv.compile(schemaV03);
const validateV04 = ajv.compile(schemaV04);

const SUPPORTED_VERSIONS = new Set(['0.1', '0.2', '0.3', '0.4']);

const VALIDATORS: Record<string, ReturnType<typeof ajv.compile>> = {
  '0.1': validateV01,
  '0.2': validateV02,
  '0.3': validateV03,
  '0.4': validateV04,
};

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

  const peeked = parsed as { dspack?: unknown };
  const version = typeof peeked.dspack === 'string' ? peeked.dspack : null;

  if (!version || !SUPPORTED_VERSIONS.has(version)) {
    throw new Error(
      `Unsupported dspack version '${peeked.dspack ?? '(missing)'}'. Supported versions: ${[...SUPPORTED_VERSIONS].join(', ')}.`,
    );
  }

  const validate = VALIDATORS[version];

  if (!validate(parsed)) {
    const errors = (validate.errors as Array<{ instancePath?: string; message?: string }>)
      .map((e) => `  ${e.instancePath || '/'}: ${e.message}`)
      .join('\n');
    throw new Error(`dspack schema validation failed:\n${errors}`);
  }

  return parsed as DspackDocument;
}
