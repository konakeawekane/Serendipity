import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, BodyText, ColorfulCard, EmptyState, LibrarySelector, PrimaryButton, ScreenContainer, SecondaryButton, SectionTitle } from '@/components/ui';
import { useAppData } from '@/context/AppDataProvider';
import { generateWheelResult } from '@/features/generators';
import { radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { LibraryEntry } from '@/types/domain';

export default function SpinScreen() {
  const { libraries, settings } = useAppData();
  const { colors } = usePlayfulTheme();
  const wheelLibraries = useMemo(() => libraries.filter((item) => item.type === 'wheel'), [libraries]);
  const [requestedId, setRequestedId] = useState<string>();
  const [storedResult, setStoredResult] = useState<LibraryEntry | null>(null);
  const selectedId = wheelLibraries.some((item) => item.id === requestedId) ? requestedId : wheelLibraries[0]?.id;
  const selected = wheelLibraries.find((item) => item.id === selectedId);
  const result = storedResult && selected?.entries.some((entry) => entry.id === storedResult.id) ? storedResult : null;

  const choose = () => {
    if (!selected) return;
    setStoredResult(generateWheelResult(selected.entries, result?.id, settings.avoidImmediateRepeats));
  };
  const changeLibrary = (id: string) => { setRequestedId(id); setStoredResult(null); };

  return (
    <ScreenContainer>
      <AppHeader title="Spin the Wheel" subtitle="One library. One delightful decision." back />
      {wheelLibraries.length === 0 ? (
        <EmptyState title="No wheel library yet" message="Create a Wheel library, then add the options you want to spin." actionLabel="Create wheel library" onAction={() => router.push({ pathname: '/create-library', params: { type: 'wheel' } })} />
      ) : (
        <>
          <LibrarySelector label="Wheel library" libraries={wheelLibraries} selectedId={selectedId} onSelect={changeLibrary} />
          <View accessibilityLabel={result ? `Wheel result: ${result.text}` : 'Wheel ready'} style={[styles.wheel, { backgroundColor: colors.secondary, borderColor: colors.text }]}>
            <View style={[styles.wheelInner, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Text style={[result ? typography.heading : typography.body, styles.resultText, { color: result ? colors.text : colors.mutedText }]}>
                {result?.text ?? (selected?.entries.length ? 'Ready when you are' : 'Add entries to spin')}
              </Text>
            </View>
          </View>
          {selected?.entries.length ? (
            <PrimaryButton label={result ? 'Spin again' : 'Spin'} onPress={choose} />
          ) : (
            <EmptyState title="This wheel is empty" message="Add at least one entry before spinning." actionLabel="Manage entries" onAction={() => router.push({ pathname: '/library/[id]', params: { id: selected!.id } })} />
          )}
          {selected ? <SecondaryButton label="Manage wheel entries" onPress={() => router.push({ pathname: '/library/[id]', params: { id: selected.id } })} /> : null}
          <ColorfulCard>
            <SectionTitle>Repeat setting</SectionTitle>
            <BodyText muted>{settings.avoidImmediateRepeats ? 'The last result is skipped when another entry is available.' : 'Immediate repeats are allowed.'}</BodyText>
          </ColorfulCard>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wheel: { width: '82%', maxWidth: 340, aspectRatio: 1, alignSelf: 'center', borderRadius: radii.pill, borderWidth: 4, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-2deg' }] },
  wheelInner: { width: '100%', aspectRatio: 1, borderRadius: radii.pill, borderWidth: 4, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, transform: [{ rotate: '2deg' }] },
  resultText: { textAlign: 'center' },
});
