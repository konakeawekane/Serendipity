import { LIMITS, validateLibrary } from '../domain/validation';
import { parseLibraryJson, regenerateImportedLibrary, safeLibraryFilename, serializeLibrary } from '../features/import-export/schema';
import type { Library } from '../types/domain';

const library: Library = {
  id: 'weekend',
  name: 'Weekend ideas',
  description: 'Things to try',
  type: 'wheel',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
  entries: [{ id: 'one', text: 'Cook something new' }],
};

describe('library validation', () => {
  test('accepts a valid library', () => expect(validateLibrary(library)).toEqual([]));
  test('reports empty and oversized text', () => {
    const invalid = { ...library, name: ' ', entries: [{ id: 'one', text: 'x'.repeat(LIMITS.entry + 1) }] };
    expect(validateLibrary(invalid).map((issue) => issue.path)).toEqual(['library.name', 'library.entries[0].text']);
  });
  test('reports duplicate entry IDs', () => {
    expect(validateLibrary({ ...library, entries: [...library.entries, { id: 'one', text: 'Another' }] }).some((issue) => issue.message.includes('unique'))).toBe(true);
  });
});

describe('versioned JSON', () => {
  test('rejects malformed JSON', () => expect(parseLibraryJson('{nope').ok).toBe(false));
  test('rejects unsupported versions', () => expect(parseLibraryJson(JSON.stringify({ schemaVersion: 2, library })).ok).toBe(false));
  test('rejects invalid record fields', () => expect(parseLibraryJson(JSON.stringify({ schemaVersion: 1, library: { ...library, type: 'unknown' } })).ok).toBe(false));
  test('serializes an importable schema v1 document', () => {
    const parsed = parseLibraryJson(serializeLibrary(library));
    expect(parsed.ok && parsed.value.library).toEqual(library);
  });
  test('creates safe filenames', () => expect(safeLibraryFilename(' A/B: Fun?! ')).toBe('a-b-fun.json'));
});

test('import regeneration replaces every ID and timestamp', () => {
  const ids = ['new-library', 'new-entry'];
  const regenerated = regenerateImportedLibrary(library, () => ids.shift()!, '2026-02-02T00:00:00.000Z');
  expect(regenerated.id).toBe('new-library');
  expect(regenerated.entries[0].id).toBe('new-entry');
  expect(regenerated.createdAt).toBe('2026-02-02T00:00:00.000Z');
  expect(regenerated.updatedAt).toBe('2026-02-02T00:00:00.000Z');
});
