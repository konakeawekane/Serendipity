import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, BodyText, ColorfulCard, ErrorState, PrimaryButton, ScreenContainer, SecondaryButton, SectionTitle, TypePill } from '@/components/ui';
import { toMessage, useAppData } from '@/context/AppDataProvider';
import { pickLibraryFile } from '@/features/import-export/files';
import { parseLibraryJson, type LibraryExport } from '@/features/import-export/schema';
import { spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { ValidationIssue } from '@/domain/validation';

export default function ImportLibraryScreen() {
  const { importLibrary } = useAppData();
  const { colors } = usePlayfulTheme();
  const [fileName, setFileName] = useState<string>();
  const [preview, setPreview] = useState<LibraryExport>();
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importedId, setImportedId] = useState<string>();

  const reset = () => { setFileName(undefined); setPreview(undefined); setIssues([]); setError(null); setImportedId(undefined); };
  const pick = async () => {
    setBusy(true); setError(null); setIssues([]); setImportedId(undefined);
    try {
      const file = await pickLibraryFile();
      if (!file) return;
      setFileName(file.name);
      const parsed = parseLibraryJson(file.text);
      if (parsed.ok) setPreview(parsed.value);
      else { setPreview(undefined); setIssues(parsed.issues); }
    } catch (cause) {
      setPreview(undefined); setError(toMessage(cause));
    } finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!preview) return;
    setBusy(true); setError(null);
    try {
      const imported = await importLibrary(preview.library);
      setImportedId(imported.id);
      setPreview(undefined);
    } catch (cause) { setError(toMessage(cause)); } finally { setBusy(false); }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Import library" subtitle="Review every file before it joins your shelves." back />
      {error ? <ErrorState message={error} /> : null}
      {importedId ? (
        <ColorfulCard accent={colors.when}>
          <SectionTitle>Library imported</SectionTitle>
          <BodyText>The library and its entries were saved with new IDs.</BodyText>
          <PrimaryButton label="Open library" onPress={() => router.replace({ pathname: '/library/[id]', params: { id: importedId } })} />
          <SecondaryButton label="Import another" onPress={reset} />
        </ColorfulCard>
      ) : (
        <>
          {!fileName ? (
            <ColorfulCard>
              <SectionTitle>Choose a JSON file</SectionTitle>
              <BodyText muted>Maximum size: 1 MB. The file is checked before anything is saved.</BodyText>
              <PrimaryButton label="Pick file" onPress={() => void pick()} loading={busy} />
            </ColorfulCard>
          ) : null}
          {issues.length > 0 ? (
            <ColorfulCard accent={colors.danger}>
              <SectionTitle>Cannot import {fileName}</SectionTitle>
              {issues.map((issue, index) => <Text key={`${issue.path}-${index}`} style={[typography.body, { color: colors.text }]}>• {issue.message}</Text>)}
              <PrimaryButton label="Choose another file" onPress={() => void pick()} loading={busy} />
              <SecondaryButton label="Cancel" onPress={reset} />
            </ColorfulCard>
          ) : null}
          {preview ? (
            <ColorfulCard accent={colors.where}>
              <View style={styles.previewHeader}>
                <SectionTitle>{preview.library.name}</SectionTitle>
                <TypePill type={preview.library.type} />
              </View>
              {preview.library.description ? <BodyText>{preview.library.description}</BodyText> : null}
              <Text style={[typography.label, { color: colors.mutedText }]}>{preview.library.entries.length} {preview.library.entries.length === 1 ? 'entry' : 'entries'} · Schema v1</Text>
              <PrimaryButton label="Confirm import" onPress={() => void confirm()} loading={busy} />
              <SecondaryButton label="Cancel" onPress={reset} disabled={busy} />
            </ColorfulCard>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ previewHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm } });
