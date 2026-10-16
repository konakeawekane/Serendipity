import { generateCaveat, generateWhatWhereWhen, generateWheelResult, pickRandomEntry } from '../features/generators';
import type { LibraryEntry } from '../types/domain';

const entries: LibraryEntry[] = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Beta' },
  { id: 'c', text: 'Gamma' },
];

describe('pickRandomEntry', () => {
  test('returns null for an empty list', () => expect(pickRandomEntry([])).toBeNull());
  test('returns the sole entry even when it was previous', () => expect(pickRandomEntry([entries[0]], { previousEntryId: 'a' })).toBe(entries[0]));
  test('uses deterministic random values', () => expect(pickRandomEntry(entries, { avoidImmediateRepeats: false, random: () => 0.5 })).toBe(entries[1]));
  test('avoids the prior ID when another exists', () => expect(pickRandomEntry(entries, { previousEntryId: 'a', random: () => 0 })).toBe(entries[1]));
  test('clamps invalid random values safely', () => {
    expect(pickRandomEntry(entries, { random: () => 9 })?.id).toBe('c');
    expect(pickRandomEntry(entries, { random: () => Number.NaN })?.id).toBe('a');
  });
  test('does not mutate input arrays', () => {
    const original = [...entries];
    pickRandomEntry(entries, { previousEntryId: 'a' });
    expect(entries).toEqual(original);
  });
});

test('generateWheelResult follows picker behavior', () => {
  expect(generateWheelResult(entries, 'a', true, () => 0)?.id).toBe('b');
});

describe('generateWhatWhereWhen', () => {
  test('returns null when any category is empty', () => {
    expect(generateWhatWhereWhen({ whatEntries: entries, whereEntries: [], whenEntries: entries })).toBeNull();
  });
  test('returns one structured entry per category', () => {
    const result = generateWhatWhereWhen({ whatEntries: entries, whereEntries: entries, whenEntries: entries, random: () => 0 });
    expect(result).toEqual({ what: entries[0], where: entries[0], when: entries[0] });
  });
  test('tracks prior IDs independently', () => {
    const result = generateWhatWhereWhen({
      whatEntries: entries,
      whereEntries: entries,
      whenEntries: entries,
      previousIds: { what: 'a', where: 'b', when: 'c' },
      random: () => 0,
    });
    expect(result && [result.what.id, result.where.id, result.when.id]).toEqual(['b', 'a', 'a']);
  });
});

describe('generateCaveat', () => {
  test('rejects a blank commitment', () => expect(generateCaveat('  ', entries)).toBeNull());
  test('returns null for an empty caveat library', () => expect(generateCaveat('Study', [])).toBeNull());
  test('trims but does not rewrite the commitment', () => expect(generateCaveat('  Study biology  ', entries, undefined, true, () => 0)?.commitment).toBe('Study biology'));
});
