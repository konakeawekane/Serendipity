import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, ColorfulCard, EmptyState, LibrarySelector, PrimaryButton, ScreenContainer } from '@/components/ui';
import { useAppData } from '@/context/AppDataProvider';
import { generateWhatWhereWhen, type WhatWhereWhenResult } from '@/features/generators';
import { spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { Library, LibraryType } from '@/types/domain';

const categories: { type: Extract<LibraryType, 'what' | 'where' | 'when'>; label: string }[] = [
  { type: 'what', label: 'What' },
  { type: 'where', label: 'Where' },
  { type: 'when', label: 'When' },
];

export default function WhatWhereWhenScreen() {
  const { libraries, settings } = useAppData();
  const { colors } = usePlayfulTheme();
  const grouped = useMemo(() => Object.fromEntries(categories.map(({ type }) => [type, libraries.filter((item) => item.type === type)])) as Record<'what' | 'where' | 'when', Library[]>, [libraries]);
  const [requested, setRequested] = useState<{ what?: string; where?: string; when?: string }>({});
  const [storedResult, setStoredResult] = useState<WhatWhereWhenResult | null>(null);
  const selected = {
    what: grouped.what.some((item) => item.id === requested.what) ? requested.what : grouped.what[0]?.id,
    where: grouped.where.some((item) => item.id === requested.where) ? requested.where : grouped.where[0]?.id,
    when: grouped.when.some((item) => item.id === requested.when) ? requested.when : grouped.when[0]?.id,
  };

  const chosen = {
    what: grouped.what.find((item) => item.id === selected.what),
    where: grouped.where.find((item) => item.id === selected.where),
    when: grouped.when.find((item) => item.id === selected.when),
  };
  const result = storedResult
    && chosen.what?.entries.some((entry) => entry.id === storedResult.what.id)
    && chosen.where?.entries.some((entry) => entry.id === storedResult.where.id)
    && chosen.when?.entries.some((entry) => entry.id === storedResult.when.id)
    ? storedResult
    : null;
  const missing = categories.filter(({ type }) => !chosen[type]?.entries.length);
  const generate = () => {
    const next = generateWhatWhereWhen({
      whatEntries: chosen.what?.entries ?? [],
      whereEntries: chosen.where?.entries ?? [],
      whenEntries: chosen.when?.entries ?? [],
      previousIds: result ? { what: result.what.id, where: result.where.id, when: result.when.id } : undefined,
      avoidImmediateRepeats: settings.avoidImmediateRepeats,
    });
    setStoredResult(next);
  };
  const choose = (type: 'what' | 'where' | 'when', id: string) => { setRequested((current) => ({ ...current, [type]: id })); setStoredResult(null); };

  return (
    <ScreenContainer>
      <AppHeader title="What, Where, When" subtitle="Three shelves become one surprisingly solid plan." back />
      {categories.map(({ type, label }) => (
        <View key={type} style={styles.category}>
          <LibrarySelector label={`${label} library`} libraries={grouped[type]} selectedId={selected[type]} onSelect={(id) => choose(type, id)} />
          {grouped[type].length === 0 ? (
            <EmptyState title={`Missing ${label.toLowerCase()} library`} message={`Create a ${label} library and add at least one entry.`} actionLabel={`Create ${label} library`} onAction={() => router.push({ pathname: '/create-library', params: { type } })} />
          ) : chosen[type]?.entries.length === 0 ? (
            <EmptyState title={`${label} library is empty`} message="Add an entry to this selected library." actionLabel="Manage entries" onAction={() => router.push({ pathname: '/library/[id]', params: { id: chosen[type]!.id } })} />
          ) : null}
        </View>
      ))}
      <PrimaryButton label={result ? 'Generate another' : 'Generate plan'} onPress={generate} disabled={missing.length > 0} />
      {result ? (
        <View accessibilityLabel={`Plan: ${result.what.text}, ${result.where.text}, ${result.when.text}`} style={styles.results}>
          <ResultCard label="What" value={result.what.text} accent={colors.what} />
          <ResultCard label="Where" value={result.where.text} accent={colors.where} />
          <ResultCard label="When" value={result.when.text} accent={colors.when} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function ResultCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const { colors } = usePlayfulTheme();
  return (
    <ColorfulCard accent={accent}>
      <Text style={[typography.label, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[typography.heading, { color: colors.text }]}>{value}</Text>
    </ColorfulCard>
  );
}

const styles = StyleSheet.create({ category: { gap: spacing.sm }, results: { gap: spacing.md } });
