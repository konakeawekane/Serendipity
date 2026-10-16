import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, ErrorState, InputField, PrimaryButton, ScreenContainer, TypePill } from '@/components/ui';
import { toMessage, useAppData } from '@/context/AppDataProvider';
import { LIMITS, validateRequiredText } from '@/domain/validation';
import { LIBRARY_TYPES, LIBRARY_TYPE_LABELS, type LibraryType } from '@/types/domain';
import { radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';

export default function CreateLibraryScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { createLibrary } = useAppData();
  const { colors } = usePlayfulTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const initialType = LIBRARY_TYPES.includes(params.type as LibraryType) ? params.type as LibraryType : 'wheel';
  const [type, setType] = useState<LibraryType>(initialType);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const validation = validateRequiredText(name, 'Library name', LIMITS.name);
    if (validation) { setError(validation); return; }
    if (description.trim().length > LIMITS.description) { setError(`Description must be ${LIMITS.description} characters or fewer.`); return; }
    setSaving(true);
    setError(null);
    try {
      const library = await createLibrary({ name, description, type });
      router.replace({ pathname: '/library/[id]', params: { id: library.id } });
    } catch (cause) {
      setError(toMessage(cause));
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Create library" subtitle="Pick one purpose now; entries can come later." back />
      {error ? <ErrorState message={error} /> : null}
      <InputField label="Name" value={name} onChangeText={setName} placeholder="Weekend ideas" maxLength={LIMITS.name + 1} autoFocus />
      <View style={styles.field}>
        <Text style={[typography.label, { color: colors.text }]}>Type</Text>
        <View accessibilityRole="radiogroup" style={styles.types}>
          {LIBRARY_TYPES.map((item) => {
            const selected = type === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                aria-checked={selected}
                accessibilityLabel={`${LIBRARY_TYPE_LABELS[item]} library`}
                onPress={() => setType(item)}
                style={({ pressed }) => [styles.typeChoice, { backgroundColor: selected ? colors.secondary : colors.surface, borderColor: selected ? colors.text : colors.border, opacity: pressed ? 0.7 : 1 }]}>
                <TypePill type={item} />
              </Pressable>
            );
          })}
        </View>
      </View>
      <InputField label="Description (optional)" value={description} onChangeText={setDescription} placeholder="What belongs in this library?" multiline maxLength={LIMITS.description + 1} />
      <PrimaryButton label="Create library" onPress={() => void submit()} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChoice: { borderWidth: 2, borderRadius: radii.md, padding: spacing.sm },
});
