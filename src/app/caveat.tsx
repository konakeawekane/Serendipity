import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, BodyText, ColorfulCard, EmptyState, InputField, LibrarySelector, PrimaryButton, ScreenContainer, SecondaryButton } from '@/components/ui';
import { useAppData } from '@/context/AppDataProvider';
import { LIMITS } from '@/domain/validation';
import { generateCaveat, type CaveatResult } from '@/features/generators';
import { spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';

export default function CaveatScreen() {
  const { libraries, settings } = useAppData();
  const { colors } = usePlayfulTheme();
  const caveatLibraries = useMemo(() => libraries.filter((item) => item.type === 'caveat'), [libraries]);
  const [requestedId, setRequestedId] = useState<string>();
  const [commitment, setCommitment] = useState('');
  const [storedResult, setStoredResult] = useState<CaveatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedId = caveatLibraries.some((item) => item.id === requestedId) ? requestedId : caveatLibraries[0]?.id;
  const selected = caveatLibraries.find((item) => item.id === selectedId);
  const result = storedResult && selected?.entries.some((entry) => entry.id === storedResult.caveat.id) ? storedResult : null;

  const generate = () => {
    setError(null);
    if (!commitment.trim()) { setError('Enter a commitment first.'); return; }
    const next = generateCaveat(commitment, selected?.entries ?? [], result?.caveat.id, settings.avoidImmediateRepeats);
    if (!next) { setError('Add at least one caveat before generating.'); return; }
    setStoredResult(next);
  };
  const changeCommitment = (text: string) => { setCommitment(text); setStoredResult(null); setError(null); };

  return (
    <ScreenContainer>
      <AppHeader title="Caveat Generator" subtitle="Keep the goal. Change how you do it." back />
      <InputField label="Your commitment" value={commitment} onChangeText={changeCommitment} placeholder="Study for my biology exam" multiline maxLength={LIMITS.entry + 1} error={error && !commitment.trim() ? error : null} />
      {caveatLibraries.length === 0 ? (
        <EmptyState title="No caveat library yet" message="Create safe, constructive twists that make the process more interesting." actionLabel="Create caveat library" onAction={() => router.push({ pathname: '/create-library', params: { type: 'caveat' } })} />
      ) : (
        <>
          <LibrarySelector label="Caveat library" libraries={caveatLibraries} selectedId={selectedId} onSelect={(id) => { setRequestedId(id); setStoredResult(null); setError(null); }} />
          {selected?.entries.length === 0 ? <EmptyState title="This caveat library is empty" message="Add a caveat that changes how the commitment is done—not whether it gets done." actionLabel="Manage caveats" onAction={() => router.push({ pathname: '/library/[id]', params: { id: selected.id } })} /> : null}
          <PrimaryButton label={result ? 'Generate another' : 'Add a caveat'} onPress={generate} disabled={!selected?.entries.length} />
          {error && commitment.trim() ? <BodyText>{error}</BodyText> : null}
          {result ? (
            <ColorfulCard accent={colors.caveat}>
              <Text style={[typography.label, { color: colors.mutedText }]}>Commitment</Text>
              <Text style={[typography.subheading, { color: colors.text }]}>{result.commitment}</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[typography.label, { color: colors.mutedText }]}>Caveat</Text>
              <Text style={[typography.heading, { color: colors.text }]}>{result.caveat.text}</Text>
              <SecondaryButton label="Reject and try another" onPress={generate} />
            </ColorfulCard>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ divider: { height: 2, marginVertical: spacing.xs } });
