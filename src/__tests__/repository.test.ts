import type { SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from '../db/migrations';
import { createLibraryRepository, type LibraryRepository } from '../db/repository';
import type { Library } from '../types/domain';

declare const require: (id: string) => { DatabaseSync: new (path: string) => NodeDatabase };

type NodeStatement = {
  all: (...params: unknown[]) => unknown[];
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => { changes: number | bigint; lastInsertRowid: number | bigint };
};
type NodeDatabase = { exec: (sql: string) => void; prepare: (sql: string) => NodeStatement; close: () => void };

let mockId = 0;
jest.mock('expo-crypto', () => ({ randomUUID: () => `generated-${++mockId}` }));

const { DatabaseSync } = require('node:sqlite');

class TestDatabase {
  readonly raw = new DatabaseSync(':memory:');
  failOnEntryInsert = 0;
  exclusiveTransactions = 0;
  regularTransactions = 0;
  private entryInserts = 0;

  async execAsync(sql: string) { this.raw.exec(sql); }
  async getAllAsync<T>(sql: string, ...params: unknown[]) { return this.raw.prepare(sql).all(...params) as T[]; }
  async getFirstAsync<T>(sql: string, ...params: unknown[]) { return (this.raw.prepare(sql).get(...params) as T | undefined) ?? null; }
  async runAsync(sql: string, ...params: unknown[]) {
    if (sql.startsWith('INSERT INTO library_entries')) {
      this.entryInserts += 1;
      if (this.failOnEntryInsert === this.entryInserts) throw new Error('Simulated entry failure');
    }
    const result = this.raw.prepare(sql).run(...params);
    return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
  }
  async withExclusiveTransactionAsync(task: (txn: TestDatabase) => Promise<void>) {
    this.exclusiveTransactions += 1;
    this.raw.exec('BEGIN IMMEDIATE');
    try { await task(this); this.raw.exec('COMMIT'); } catch (error) { this.raw.exec('ROLLBACK'); throw error; }
  }
  async withTransactionAsync(task: () => Promise<void>) {
    this.regularTransactions += 1;
    this.raw.exec('BEGIN');
    try { await task(); this.raw.exec('COMMIT'); } catch (error) { this.raw.exec('ROLLBACK'); throw error; }
  }
  close() { this.raw.close(); }
}

const importSource: Library = {
  id: 'source-library',
  name: ' Imported ideas ',
  type: 'wheel',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  entries: [
    { id: 'source-one', text: ' One ' },
    { id: 'source-two', text: ' Two ' },
  ],
};

describe('SQLite repository', () => {
  let database: TestDatabase;
  let repository: LibraryRepository;

  beforeEach(async () => {
    mockId = 0;
    database = new TestDatabase();
    await migrateDatabase(database as unknown as SQLiteDatabase);
    repository = createLibraryRepository(database as unknown as SQLiteDatabase);
  });
  afterEach(() => database.close());

  test('initializes a fresh database and performs library/entry CRUD', async () => {
    const tables = await database.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'");
    expect(tables.map((row) => row.name)).toEqual(expect.arrayContaining(['libraries', 'library_entries', 'settings']));
    const library = await repository.createLibrary({ name: 'Wheel', type: 'wheel' });
    await repository.addEntry(library.id, 'First');
    let loaded = await repository.getLibraryById(library.id);
    expect(loaded?.entries[0].text).toBe('First');
    await repository.updateEntry(library.id, loaded!.entries[0].id, 'Updated');
    await repository.updateLibrary(library.id, { name: 'New name', description: 'Description' });
    loaded = await repository.getLibraryById(library.id);
    expect(loaded).toMatchObject({ name: 'New name', description: 'Description' });
    expect(loaded?.entries[0].text).toBe('Updated');
    await repository.deleteEntry(library.id, loaded!.entries[0].id);
    expect((await repository.getLibraryById(library.id))?.entries).toEqual([]);
  });

  test('deleting a library cascades to child entries', async () => {
    const library = await repository.createLibrary({ name: 'Wheel', type: 'wheel' });
    await repository.addEntry(library.id, 'First');
    await repository.deleteLibrary(library.id);
    expect(await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM library_entries')).toEqual({ count: 0 });
  });

  test('imports atomically, regenerates IDs, and exports the saved shape', async () => {
    const imported = await repository.importLibrary(importSource);
    expect(imported.id).not.toBe(importSource.id);
    expect(imported.entries.map((entry) => entry.id)).not.toEqual(importSource.entries.map((entry) => entry.id));
    expect((await repository.exportLibrary(imported.id)).entries.map((entry) => entry.text)).toEqual(['One', 'Two']);
  });

  test('rolls back an import if an entry write fails', async () => {
    database.failOnEntryInsert = 2;
    await expect(repository.importLibrary(importSource)).rejects.toThrow('Simulated entry failure');
    expect(await repository.listLibraries()).toEqual([]);
  });

  test('persists settings', async () => {
    await repository.saveSettings({ themePreference: 'dark', avoidImmediateRepeats: false, hapticsEnabled: false });
    expect(await repository.getSettings()).toEqual({ themePreference: 'dark', avoidImmediateRepeats: false, hapticsEnabled: false });
  });

  test('uses the web-supported transaction API on web', async () => {
    const webRepository = createLibraryRepository(database as unknown as SQLiteDatabase, 'web');
    await webRepository.saveSettings({ themePreference: 'light', avoidImmediateRepeats: true, hapticsEnabled: false });
    expect(database.regularTransactions).toBe(1);
    expect(database.exclusiveTransactions).toBe(0);
    expect((await repository.getSettings()).themePreference).toBe('light');
  });

  test('invalid imports never write data', async () => {
    await expect(repository.importLibrary({ ...importSource, name: ' ' })).rejects.toThrow('Library name is required.');
    expect(await repository.listLibraries()).toEqual([]);
  });
});
