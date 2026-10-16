import { useSQLiteContext } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createLibraryRepository } from '@/db/repository';
import type { AppSettings, CreateLibraryInput, Library, UpdateLibraryInput } from '@/types/domain';
import { DEFAULT_SETTINGS } from '@/types/domain';

type AppDataValue = {
  libraries: Library[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLibrary: (input: CreateLibraryInput) => Promise<Library>;
  updateLibrary: (id: string, input: UpdateLibraryInput) => Promise<Library>;
  deleteLibrary: (id: string) => Promise<void>;
  addEntry: (libraryId: string, text: string) => Promise<void>;
  updateEntry: (libraryId: string, entryId: string, text: string) => Promise<void>;
  deleteEntry: (libraryId: string, entryId: string) => Promise<void>;
  importLibrary: (library: Library) => Promise<Library>;
  exportLibrary: (id: string) => Promise<Library>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
};

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const repository = useMemo(() => createLibraryRepository(db), [db]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [nextLibraries, nextSettings] = await Promise.all([
        repository.listLibraries(),
        repository.getSettings(),
      ]);
      setLibraries(nextLibraries);
      setSettings(nextSettings);
    } catch (cause) {
      setError(toMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    Promise.all([repository.listLibraries(), repository.getSettings()])
      .then(([nextLibraries, nextSettings]) => {
        if (!active) return;
        setLibraries(nextLibraries);
        setSettings(nextSettings);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (active) setError(toMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [repository]);

  const value = useMemo<AppDataValue>(() => ({
    libraries,
    settings,
    loading,
    error,
    refresh,
    createLibrary: async (input) => {
      const created = await repository.createLibrary(input);
      await refresh();
      return created;
    },
    updateLibrary: async (id, input) => {
      const updated = await repository.updateLibrary(id, input);
      await refresh();
      return updated;
    },
    deleteLibrary: async (id) => { await repository.deleteLibrary(id); await refresh(); },
    addEntry: async (libraryId, text) => { await repository.addEntry(libraryId, text); await refresh(); },
    updateEntry: async (libraryId, entryId, text) => { await repository.updateEntry(libraryId, entryId, text); await refresh(); },
    deleteEntry: async (libraryId, entryId) => { await repository.deleteEntry(libraryId, entryId); await refresh(); },
    importLibrary: async (library) => {
      const imported = await repository.importLibrary(library);
      await refresh();
      return imported;
    },
    exportLibrary: repository.exportLibrary,
    updateSettings: async (patch) => {
      const next = { ...settings, ...patch, hapticsEnabled: false };
      setSettings(next);
      try {
        await repository.saveSettings(next);
      } catch (cause) {
        setSettings(settings);
        throw cause;
      }
    },
  }), [error, libraries, loading, refresh, repository, settings]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider.');
  return value;
}

export function toMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
