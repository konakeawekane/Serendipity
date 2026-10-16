import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;
  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS libraries (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS library_entries (
        id TEXT PRIMARY KEY NOT NULL,
        library_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_library_entries_library_id
        ON library_entries(library_id);
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
