export interface Metadata {
  generatedBy?: string;
  generatedAt?: string;
  source?: string;
  license?: string;
  [key: string]: unknown;
}

export interface TokenEntry {
  value: string;
  description?: string;
  type?: string;
  deprecated?: boolean;
  aliases?: string[];
  [key: string]: unknown;
}

export interface TokenCategory {
  description?: string;
  values: Record<string, TokenEntry>;
  [key: string]: unknown;
}

export interface PropDescriptor {
  type: string;
  description?: string;
  values?: unknown[];
  default?: unknown;
  required?: boolean;
  [key: string]: unknown;
}

export interface ComponentEntry {
  name: string;
  description: string;
  whenToUse?: string;
  whenNotToUse?: string;
  props?: Record<string, PropDescriptor>;
  tokens?: string[];
  relatedComponents?: string[];
  tags?: string[];
  deprecated?: boolean;
  deprecatedMessage?: string;
  [key: string]: unknown;
}

export interface PatternEntry {
  id: string;
  name: string;
  description: string;
  intent?: string;
  context?: string;
  components?: string[];
  guidance?: string;
  relatedPatterns?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface AntiPatternEntry {
  id: string;
  name: string;
  description: string;
  reason: string;
  insteadUse?: string;
  components?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface ComponentBinding {
  importPath?: string;
  installCommand?: string;
  exportName?: string;
  guidance?: string;
  [key: string]: unknown;
}

export interface FrameworkBinding {
  name: string;
  package?: string;
  installCommand?: string;
  description?: string;
  guidance?: string;
  components?: Record<string, ComponentBinding>;
  [key: string]: unknown;
}

export interface DspackDocument {
  $schema?: string;
  dspack: string;
  name: string;
  description?: string;
  version?: string;
  metadata?: Metadata;
  tokens?: Record<string, TokenCategory>;
  components?: Record<string, ComponentEntry>;
  patterns?: PatternEntry[];
  antiPatterns?: AntiPatternEntry[];
  frameworkBindings?: Record<string, FrameworkBinding>;
  [key: string]: unknown;
}
