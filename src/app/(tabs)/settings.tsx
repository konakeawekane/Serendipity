import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader, BodyText, ColorfulCard, ErrorState, ScreenContainer, SecondaryButton, SectionTitle } from '@/components/ui';
import { toMessage, useAppData } from '@/context/AppDataProvider';
import { radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { ThemePreference } from '@/types/domain';
import { useState } from 'react';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppData();
  const { colors } = usePlayfulTheme();
  const [error, setError] = useState<string | null>(null);
  const save = async (patch: Parameters<typeof updateSettings>[0]) => {
    setError(null);
    try { await updateSettings(patch); } catch (cause) { setError(toMessage(cause)); }
  };
  return (
    <ScreenContainer tab>
      <AppHeader title="Settings" subtitle="Tune the app without changing your ideas." />
      {error ? <ErrorState message={error} /> : null}
      <ColorfulCard>
        <SectionTitle>Appearance</SectionTitle>
        <BodyText muted>Follow your device or choose a theme.</BodyText>
        <View accessibilityRole="radiogroup" style={styles.themeRow}>
          {themeOptions.map((option) => {
            const selected = settings.themePreference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                aria-checked={selected}
                onPress={() => void save({ themePreference: option.value })}
                style={({ pressed }) => [styles.themeChoice, { backgroundColor: selected ? colors.secondary : colors.surfaceMuted, borderColor: selected ? colors.text : colors.border, opacity: pressed ? 0.72 : 1 }]}>
                <Text style={[typography.label, { color: colors.text }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ColorfulCard>
      <ColorfulCard>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <SectionTitle>Avoid repeats</SectionTitle>
            <BodyText muted>Skip the immediately previous result when another entry is available.</BodyText>
          </View>
          <Switch
            accessibilityLabel="Avoid immediate repeats"
            value={settings.avoidImmediateRepeats}
            onValueChange={(value) => void save({ avoidImmediateRepeats: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </ColorfulCard>
      <ColorfulCard>
        <SectionTitle>Data</SectionTitle>
        <BodyText muted>Libraries stay on this device unless you export or share them.</BodyText>
        <SecondaryButton label="Import a library" onPress={() => router.push('/import-library')} />
      </ColorfulCard>
      <Text style={[typography.small, styles.version, { color: colors.mutedText }]}>Playful Generators · Version 1.0.0</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  themeChoice: { flexGrow: 1, borderWidth: 2, borderRadius: radii.pill, alignItems: 'center', padding: spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  settingCopy: { flex: 1, gap: spacing.sm },
  version: { textAlign: 'center' },
});
