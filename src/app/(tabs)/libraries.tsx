import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenContainer, SecondaryButton, TypePill } from '@/components/ui';
import { useAppData } from '@/context/AppDataProvider';
import { radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';

export default function LibrariesScreen() {
  const { libraries, loading, error, refresh } = useAppData();
  const { colors } = usePlayfulTheme();
  return (
    <ScreenContainer tab>
      <AppHeader title="Your libraries" subtitle="The ingredients behind every generator." />
      <View style={styles.actions}>
        <PrimaryButton label="Create library" onPress={() => router.push('/create-library')} />
        <SecondaryButton label="Import JSON" onPress={() => router.push('/import-library')} />
      </View>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && libraries.length === 0 ? (
        <EmptyState title="Start with one idea shelf" message="Create a library for a wheel, a category, or your caveats." actionLabel="Create your first library" onAction={() => router.push('/create-library')} />
      ) : null}
      <View style={styles.list}>
        {libraries.map((library) => (
          <Pressable
            key={library.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${library.name}`}
            onPress={() => router.push({ pathname: '/library/[id]', params: { id: library.id } })}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
            <View style={styles.cardTop}>
              <Text numberOfLines={2} style={[typography.subheading, styles.name, { color: colors.text }]}>{library.name}</Text>
              <TypePill type={library.type} />
            </View>
            {library.description ? <Text numberOfLines={3} style={[typography.body, { color: colors.mutedText }]}>{library.description}</Text> : null}
            <Text style={[typography.small, { color: colors.mutedText }]}>{library.entries.length} {library.entries.length === 1 ? 'entry' : 'entries'}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.md },
  card: { borderWidth: 2, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  name: { flex: 1 },
});
