export const LIBRARY_TYPES = ['wheel', 'what', 'where', 'when', 'caveat'] as const;

export type LibraryType = (typeof LIBRARY_TYPES)[number];

export type LibraryEntry = {
  id: string;
  text: string;
  createdAt?: string;
};

export type Library = {
  id: string;
  name: string;
  description?: string;
  type: LibraryType;
  entries: LibraryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type GeneratedPlan = {
  what: LibraryEntry;
  where: LibraryEntry;
  when: LibraryEntry;
  generatedAt: string;
};

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppSettings = {
  themePreference: ThemePreference;
  avoidImmediateRepeats: boolean;
  hapticsEnabled: boolean;
};

export type CreateLibraryInput = Pick<Library, 'name' | 'type'> & {
  description?: string;
};

export type UpdateLibraryInput = Pick<Library, 'name'> & {
  description?: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'system',
  avoidImmediateRepeats: true,
  hapticsEnabled: false,
};

export const LIBRARY_TYPE_LABELS: Record<LibraryType, string> = {
  wheel: 'Wheel',
  what: 'What',
  where: 'Where',
  when: 'When',
  caveat: 'Caveat',
};
