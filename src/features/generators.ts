import type { LibraryEntry } from '@/types/domain';

type PickOptions = {
  previousEntryId?: string;
  avoidImmediateRepeats?: boolean;
  random?: () => number;
};

export function pickRandomEntry(entries: LibraryEntry[], options: PickOptions = {}) {
  if (entries.length === 0) return null;
  const { previousEntryId, avoidImmediateRepeats = true, random = Math.random } = options;
  const candidates = avoidImmediateRepeats && entries.length > 1
    ? entries.filter((entry) => entry.id !== previousEntryId)
    : [...entries];
  const safeCandidates = candidates.length > 0 ? candidates : [...entries];
  const raw = random();
  const normalized = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.9999999999999999) : 0;
  return safeCandidates[Math.floor(normalized * safeCandidates.length)] ?? safeCandidates[0] ?? null;
}

export function generateWheelResult(
  entries: LibraryEntry[],
  previousEntryId?: string,
  avoidImmediateRepeats = true,
  random = Math.random,
) {
  return pickRandomEntry(entries, { previousEntryId, avoidImmediateRepeats, random });
}

export type WhatWhereWhenResult = {
  what: LibraryEntry;
  where: LibraryEntry;
  when: LibraryEntry;
};

export function generateWhatWhereWhen(input: {
  whatEntries: LibraryEntry[];
  whereEntries: LibraryEntry[];
  whenEntries: LibraryEntry[];
  previousIds?: { what?: string; where?: string; when?: string };
  avoidImmediateRepeats?: boolean;
  random?: () => number;
}): WhatWhereWhenResult | null {
  const options = { avoidImmediateRepeats: input.avoidImmediateRepeats, random: input.random };
  const what = pickRandomEntry(input.whatEntries, { ...options, previousEntryId: input.previousIds?.what });
  const where = pickRandomEntry(input.whereEntries, { ...options, previousEntryId: input.previousIds?.where });
  const when = pickRandomEntry(input.whenEntries, { ...options, previousEntryId: input.previousIds?.when });
  return what && where && when ? { what, where, when } : null;
}

export type CaveatResult = {
  commitment: string;
  caveat: LibraryEntry;
  generatedAt: string;
};

export function generateCaveat(
  commitment: string,
  caveatEntries: LibraryEntry[],
  previousCaveatId?: string,
  avoidImmediateRepeats = true,
  random = Math.random,
): CaveatResult | null {
  const cleanCommitment = commitment.trim();
  if (!cleanCommitment) return null;
  const caveat = pickRandomEntry(caveatEntries, {
    previousEntryId: previousCaveatId,
    avoidImmediateRepeats,
    random,
  });
  return caveat ? { commitment: cleanCommitment, caveat, generatedAt: new Date().toISOString() } : null;
}
