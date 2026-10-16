import type { SQLiteDatabase } from 'expo-sqlite';

import { LIMITS, validateLibrary, validateRequiredText } from '@/domain/validation';
import { regenerateImportedLibrary } from '@/features/import-export/schema';
import type {
  AppSettings,
  CreateLibraryInput,
  Library,
  LibraryEntry,
  LibraryType,
  UpdateLibraryInput,
} from '@/types/domain';
import { DEFAULT_SETTINGS } from '@/types/domain';
import { createId } from '@/utils/id';

type LibraryRow = {
  id: string;
  name: string;
  description: string | null;
  type: LibraryType;
  created_at: string;
  updated_at: string;
};

type EntryRow = {
  id: string;
  text: string;
  created_at: string | null;
};

export type LibraryRepository = ReturnType<typeof createLibraryRepository>;

export function createLibraryRepository(db: SQLiteDatabase, platform = process.env.EXPO_OS) {
  async function withWriteTransaction(task: (transaction: SQLiteDatabase) => Promise<void>) {
    if (platform === 'web') {
      await db.withTransactionAsync(() => task(db));
      return;
    }
    await db.withExclusiveTransactionAsync(task);
  }

  async function hydrate(row: LibraryRow): Promise<Library> {
    const entries = await db.getAllAsync<EntryRow>(
      'SELECT id, text, created_at FROM library_entries WHERE library_id = ? ORDER BY position, rowid',
      row.id,
    );
    return {
      id: row.id,
      name: row.name,
      ...(row.description ? { description: row.description } : {}),
      type: row.type,
      entries: entries.map((entry) => ({
        id: entry.id,
        text: entry.text,
        ...(entry.created_at ? { createdAt: entry.created_at } : {}),
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async function listLibraries() {
    const rows = await db.getAllAsync<LibraryRow>('SELECT * FROM libraries ORDER BY name COLLATE NOCASE');
    return Promise.all(rows.map(hydrate));
  }

  async function getLibraryById(id: string) {
    const row = await db.getFirstAsync<LibraryRow>('SELECT * FROM libraries WHERE id = ?', id);
    return row ? hydrate(row) : null;
  }

  async function listLibrariesByType(type: LibraryType) {
    const rows = await db.getAllAsync<LibraryRow>(
      'SELECT * FROM libraries WHERE type = ? ORDER BY name COLLATE NOCASE',
      type,
    );
    return Promise.all(rows.map(hydrate));
  }

  async function createLibrary(input: CreateLibraryInput) {
    const name = requireText(input.name, 'Library name', LIMITS.name);
    const description = optionalText(input.description, 'Description', LIMITS.description);
    const now = new Date().toISOString();
    const id = createId();
    await db.runAsync(
      'INSERT INTO libraries (id, name, description, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      name,
      description,
      input.type,
      now,
      now,
    );
    return (await getLibraryById(id))!;
  }

  async function updateLibrary(id: string, input: UpdateLibraryInput) {
    const name = requireText(input.name, 'Library name', LIMITS.name);
    const description = optionalText(input.description, 'Description', LIMITS.description);
    const result = await db.runAsync(
      'UPDATE libraries SET name = ?, description = ?, updated_at = ? WHERE id = ?',
      name,
      description,
      new Date().toISOString(),
      id,
    );
    if (!result.changes) throw new Error('Library not found.');
    return (await getLibraryById(id))!;
  }

  async function deleteLibrary(id: string) {
    await db.runAsync('DELETE FROM libraries WHERE id = ?', id);
  }

  async function addEntry(libraryId: string, text: string) {
    const clean = requireText(text, 'Entry text', LIMITS.entry);
    const now = new Date().toISOString();
    const id = createId();
    const position = await db.getFirstAsync<{ next_position: number }>(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM library_entries WHERE library_id = ?',
      libraryId,
    );
    await withWriteTransaction(async (txn) => {
      const exists = await txn.getFirstAsync<{ id: string }>('SELECT id FROM libraries WHERE id = ?', libraryId);
      if (!exists) throw new Error('Library not found.');
      await txn.runAsync(
        'INSERT INTO library_entries (id, library_id, text, created_at, position) VALUES (?, ?, ?, ?, ?)',
        id,
        libraryId,
        clean,
        now,
        position?.next_position ?? 0,
      );
      await txn.runAsync('UPDATE libraries SET updated_at = ? WHERE id = ?', now, libraryId);
    });
    return { id, text: clean, createdAt: now } satisfies LibraryEntry;
  }

  async function updateEntry(libraryId: string, entryId: string, text: string) {
    const clean = requireText(text, 'Entry text', LIMITS.entry);
    const now = new Date().toISOString();
    await withWriteTransaction(async (txn) => {
      const result = await txn.runAsync(
        'UPDATE library_entries SET text = ? WHERE id = ? AND library_id = ?',
        clean,
        entryId,
        libraryId,
      );
      if (!result.changes) throw new Error('Entry not found.');
      await txn.runAsync('UPDATE libraries SET updated_at = ? WHERE id = ?', now, libraryId);
    });
  }

  async function deleteEntry(libraryId: string, entryId: string) {
    const now = new Date().toISOString();
    await withWriteTransaction(async (txn) => {
      await txn.runAsync('DELETE FROM library_entries WHERE id = ? AND library_id = ?', entryId, libraryId);
      await txn.runAsync('UPDATE libraries SET updated_at = ? WHERE id = ?', now, libraryId);
    });
  }

  async function importLibrary(source: Library) {
    const issues = validateLibrary(source);
    if (issues.length) throw new Error(issues[0].message);
    const now = new Date().toISOString();
    const library = regenerateImportedLibrary(source, createId, now);
    await withWriteTransaction(async (txn) => {
      await txn.runAsync(
        'INSERT INTO libraries (id, name, description, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        library.id,
        library.name,
        library.description ?? null,
        library.type,
        now,
        now,
      );
      for (const [index, entry] of library.entries.entries()) {
        await txn.runAsync(
          'INSERT INTO library_entries (id, library_id, text, created_at, position) VALUES (?, ?, ?, ?, ?)',
          entry.id,
          library.id,
          entry.text,
          now,
          index,
        );
      }
    });
    return library;
  }

  async function exportLibrary(id: string) {
    const library = await getLibraryById(id);
    if (!library) throw new Error('Library not found.');
    return library;
  }

  async function getSettings(): Promise<AppSettings> {
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return {
      themePreference: values.themePreference === 'light' || values.themePreference === 'dark'
        ? values.themePreference
        : 'system',
      avoidImmediateRepeats: values.avoidImmediateRepeats !== 'false',
      hapticsEnabled: false,
    };
  }

  async function saveSettings(settings: AppSettings) {
    const safe = { ...DEFAULT_SETTINGS, ...settings, hapticsEnabled: false };
    await withWriteTransaction(async (txn) => {
      await txn.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        'themePreference',
        safe.themePreference,
      );
      await txn.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        'avoidImmediateRepeats',
        String(safe.avoidImmediateRepeats),
      );
    });
  }

  return {
    listLibraries,
    getLibraryById,
    listLibrariesByType,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    addEntry,
    updateEntry,
    deleteEntry,
    importLibrary,
    exportLibrary,
    getSettings,
    saveSettings,
  };
}

function requireText(value: string, label: string, max: number) {
  const error = validateRequiredText(value, label, max);
  if (error) throw new Error(error);
  return value.trim();
}

function optionalText(value: string | undefined, label: string, max: number) {
  const clean = value?.trim() ?? '';
  if (clean.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return clean || null;
}
