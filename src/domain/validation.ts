import { LIBRARY_TYPES, type Library, type LibraryType } from '@/types/domain';

export const LIMITS = {
  name: 80,
  description: 500,
  entry: 500,
  importBytes: 1_000_000,
  importEntries: 2_000,
} as const;

export type ValidationIssue = { path: string; message: string };

export function validateRequiredText(value: string, label: string, max: number) {
  const text = value.trim();
  if (!text) return `${label} is required.`;
  if (text.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function isLibraryType(value: unknown): value is LibraryType {
  return typeof value === 'string' && LIBRARY_TYPES.includes(value as LibraryType);
}

export function validateLibrary(library: Library): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nameError = validateRequiredText(library.name, 'Library name', LIMITS.name);
  if (nameError) issues.push({ path: 'library.name', message: nameError });
  if (library.description && library.description.trim().length > LIMITS.description) {
    issues.push({ path: 'library.description', message: `Description must be ${LIMITS.description} characters or fewer.` });
  }
  if (!isLibraryType(library.type)) {
    issues.push({ path: 'library.type', message: 'Choose a supported library type.' });
  }
  if (!library.id.trim()) issues.push({ path: 'library.id', message: 'Library ID is required.' });
  if (!isIsoDate(library.createdAt)) issues.push({ path: 'library.createdAt', message: 'Created date must be an ISO timestamp.' });
  if (!isIsoDate(library.updatedAt)) issues.push({ path: 'library.updatedAt', message: 'Updated date must be an ISO timestamp.' });
  if (library.entries.length > LIMITS.importEntries) {
    issues.push({ path: 'library.entries', message: `Libraries may contain at most ${LIMITS.importEntries} entries.` });
  }
  const ids = new Set<string>();
  library.entries.forEach((entry, index) => {
    const path = `library.entries[${index}]`;
    if (!entry.id.trim()) issues.push({ path: `${path}.id`, message: 'Entry ID is required.' });
    if (ids.has(entry.id)) issues.push({ path: `${path}.id`, message: 'Entry IDs must be unique.' });
    ids.add(entry.id);
    const textError = validateRequiredText(entry.text, 'Entry text', LIMITS.entry);
    if (textError) issues.push({ path: `${path}.text`, message: textError });
    if (entry.createdAt && !isIsoDate(entry.createdAt)) {
      issues.push({ path: `${path}.createdAt`, message: 'Entry date must be an ISO timestamp.' });
    }
  });
  return issues;
}

function isIsoDate(value: string) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}
