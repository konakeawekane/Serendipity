import { LIMITS, validateLibrary, type ValidationIssue } from '@/domain/validation';
import type { Library } from '@/types/domain';

export type LibraryExport = { schemaVersion: 1; library: Library };

export type ImportParseResult =
  | { ok: true; value: LibraryExport; issues: [] }
  | { ok: false; issues: ValidationIssue[] };

export function parseLibraryJson(text: string): ImportParseResult {
  if (utf8ByteLength(text) > LIMITS.importBytes) {
    return { ok: false, issues: [{ path: 'file', message: 'File must be 1 MB or smaller.' }] };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, issues: [{ path: 'file', message: 'This file is not valid JSON.' }] };
  }
  if (!isRecord(raw)) return { ok: false, issues: [{ path: 'file', message: 'The JSON root must be an object.' }] };
  if (raw.schemaVersion !== 1) {
    return { ok: false, issues: [{ path: 'schemaVersion', message: 'Only schema version 1 is supported.' }] };
  }
  const library = coerceLibrary(raw.library);
  if (!library) return { ok: false, issues: [{ path: 'library', message: 'The library record is incomplete or invalid.' }] };
  const issues = validateLibrary(library);
  return issues.length ? { ok: false, issues } : { ok: true, value: { schemaVersion: 1, library }, issues: [] };
}

export function serializeLibrary(library: Library) {
  return JSON.stringify({ schemaVersion: 1, library } satisfies LibraryExport, null, 2);
}

export function regenerateImportedLibrary(source: Library, createNewId: () => string, now = new Date().toISOString()): Library {
  return {
    ...source,
    id: createNewId(),
    name: source.name.trim(),
    description: source.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    entries: source.entries.map((entry) => ({ id: createNewId(), text: entry.text.trim(), createdAt: now })),
  };
}

export function safeLibraryFilename(name: string) {
  const safe = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${safe || 'library'}.json`;
}

function coerceLibrary(value: unknown): Library | null {
  if (!isRecord(value) || !Array.isArray(value.entries)) return null;
  const { id, name, type, createdAt, updatedAt } = value;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof type !== 'string' || typeof createdAt !== 'string' || typeof updatedAt !== 'string') return null;
  const entries = value.entries.map((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.text !== 'string') return null;
    if (entry.createdAt !== undefined && typeof entry.createdAt !== 'string') return null;
    return { id: entry.id, text: entry.text, ...(entry.createdAt ? { createdAt: entry.createdAt } : {}) };
  });
  if (entries.some((entry) => entry === null)) return null;
  if (value.description !== undefined && typeof value.description !== 'string') return null;
  return {
    id,
    name,
    ...(value.description ? { description: value.description } : {}),
    type: type as Library['type'],
    entries: entries as Library['entries'],
    createdAt,
    updatedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function utf8ByteLength(value: string) {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) { bytes += 4; index += 1; }
      else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}
