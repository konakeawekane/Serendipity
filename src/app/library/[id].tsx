import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AppHeader,
  BodyText,
  ColorfulCard,
  EmptyState,
  ErrorState,
  InputField,
  LoadingState,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  TextButton,
  TypePill,
} from '@/components/ui';
import { toMessage, useAppData } from '@/context/AppDataProvider';
import { LIMITS, validateRequiredText } from '@/domain/validation';
import { shareLibraryFile } from '@/features/import-export/files';
import { spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { Library, LibraryEntry } from '@/types/domain';

export default function LibraryEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { libraries, loading } = useAppData();
  const library = libraries.find((item) => item.id === id);

  if (loading) return <ScreenContainer><AppHeader title="Library" back /><LoadingState /></ScreenContainer>;
  if (!library) return <ScreenContainer><AppHeader title="Library" back /><EmptyState title="Library not found" message="It may have been deleted." actionLabel="Back to libraries" onAction={() => router.replace('/libraries')} /></ScreenContainer>;
  return <LibraryEditor library={library} />;
}

function LibraryEditor({ library }: { library: Library }) {
  const { updateLibrary, deleteLibrary, addEntry, updateEntry, deleteEntry } = useAppData();
  const { colors } = usePlayfulTheme();
  const [name, setName] = useState(library.name);
  const [description, setDescription] = useState(library.description ?? '');
  const [newEntry, setNewEntry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, success?: string) => {
    setBusy(true); setError(null); setNotice(null);
    try { await action(); if (success) setNotice(success); return true; } catch (cause) { setError(toMessage(cause)); return false; } finally { setBusy(false); }
  };

  const saveDetails = () => run(async () => {
    const issue = validateRequiredText(name, 'Library name', LIMITS.name);
    if (issue) throw new Error(issue);
    if (description.trim().length > LIMITS.description) throw new Error(`Description must be ${LIMITS.description} characters or fewer.`);
    await updateLibrary(library.id, { name, description });
  }, 'Library details saved.');

  const add = () => run(async () => {
    await addEntry(library.id, newEntry);
    setNewEntry('');
  }, 'Entry added.');

  const confirmDeleteLibrary = () => Alert.alert(
    'Delete this library?',
    'Its entries will also be deleted. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void run(async () => { await deleteLibrary(library.id); router.replace('/libraries'); }) },
    ],
  );

  return (
    <ScreenContainer>
      <AppHeader title={library.name} subtitle="Edit the shelf and every idea on it." back action={<TypePill type={library.type} />} />
      {error ? <ErrorState message={error} /> : null}
      {notice ? <View accessibilityRole="alert"><BodyText>{notice}</BodyText></View> : null}
      <ColorfulCard>
        <InputField label="Name" value={name} onChangeText={setName} maxLength={LIMITS.name + 1} />
        <InputField label="Description (optional)" value={description} onChangeText={setDescription} multiline maxLength={LIMITS.description + 1} />
        <PrimaryButton label="Save details" onPress={() => void saveDetails()} loading={busy} />
      </ColorfulCard>
      <ColorfulCard>
        <Text style={[typography.heading, { color: colors.text }]}>Entries</Text>
        <InputField label="Add an entry" value={newEntry} onChangeText={setNewEntry} placeholder="Type an idea" multiline maxLength={LIMITS.entry + 1} />
        <SecondaryButton label="Add entry" onPress={() => void add()} disabled={!newEntry.trim()} loading={busy} />
      </ColorfulCard>
      {library.entries.length === 0 ? <EmptyState title="This library is empty" message="Add an entry above to make it usable by its generator." /> : null}
      <View style={styles.entries}>
        {library.entries.map((entry, index) => (
          <EntryEditor
            key={entry.id}
            entry={entry}
            index={index}
            disabled={busy}
            onSave={(text) => run(() => updateEntry(library.id, entry.id, text), 'Entry updated.')}
            onDelete={() => Alert.alert('Delete entry?', entry.text, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => void run(() => deleteEntry(library.id, entry.id), 'Entry deleted.') },
            ])}
          />
        ))}
      </View>
      <ColorfulCard>
        <SecondaryButton label="Export and share JSON" onPress={() => void run(() => shareLibraryFile(library), 'Sharing opened.')} loading={busy} />
        <TextButton label="Delete library" danger onPress={confirmDeleteLibrary} />
      </ColorfulCard>
    </ScreenContainer>
  );
}

function EntryEditor({ entry, index, disabled, onSave, onDelete }: { entry: LibraryEntry; index: number; disabled: boolean; onSave: (text: string) => Promise<boolean>; onDelete: () => void }) {
  const { colors } = usePlayfulTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);
  if (editing) {
    return (
      <ColorfulCard>
        <TextInput
          accessibilityLabel={`Edit entry ${index + 1}`}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={LIMITS.entry + 1}
          style={[styles.entryInput, { color: colors.text, borderColor: colors.border }]}
        />
        <View style={styles.row}>
          <PrimaryButton label="Save" disabled={disabled || !draft.trim()} onPress={() => void onSave(draft).then((saved) => { if (saved) setEditing(false); })} />
          <SecondaryButton label="Cancel" onPress={() => { setDraft(entry.text); setEditing(false); }} />
        </View>
      </ColorfulCard>
    );
  }
  return (
    <ColorfulCard>
      <Text style={[typography.body, { color: colors.text }]}>{entry.text}</Text>
      <View style={styles.row}>
        <TextButton label="Edit" onPress={() => setEditing(true)} />
        <TextButton label="Delete" danger onPress={onDelete} />
      </View>
    </ColorfulCard>
  );
}

const styles = StyleSheet.create({
  entries: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  entryInput: { minHeight: 90, borderWidth: 2, borderRadius: 16, padding: spacing.md, fontSize: 16, textAlignVertical: 'top' },
});
