import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LIBRARY_TYPE_LABELS, type Library, type LibraryType } from '@/types/domain';
import { layout, radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';

export function ScreenContainer({ children, tab = false }: PropsWithChildren<{ tab?: boolean }>) {
  const { colors } = usePlayfulTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: (tab ? layout.tabBarHeight : Math.max(insets.bottom, spacing.lg)) + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AppHeader({ title, subtitle, back = false, action }: { title: string; subtitle?: string; back?: boolean; action?: ReactNode }) {
  const { colors } = usePlayfulTheme();
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.text }]}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.headerCopy}>
        <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[typography.body, { color: colors.mutedText }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; accessibilityLabel?: string };

export function PrimaryButton({ label, onPress, disabled, loading, accessibilityLabel }: ButtonProps) {
  const { colors } = usePlayfulTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, borderColor: colors.text, opacity: inactive ? 0.45 : pressed ? 0.78 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={colors.primaryText} /> : <Text style={[styles.buttonText, { color: colors.primaryText }]}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, loading, accessibilityLabel }: ButtonProps) {
  const { colors } = usePlayfulTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: inactive ? 0.45 : pressed ? 0.72 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.buttonText, { color: colors.text }]}>{label}</Text>}
    </Pressable>
  );
}

export function TextButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  const { colors } = usePlayfulTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
      <Text style={[typography.label, { color: danger ? colors.danger : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function ColorfulCard({ children, accent, style }: PropsWithChildren<{ accent?: string; style?: ViewStyle }>) {
  const { colors } = usePlayfulTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: accent ?? colors.border }, accent ? { borderLeftWidth: 7 } : null, style]}>{children}</View>;
}

export function InputField({ label, error, ...props }: TextInputProps & { label: string; error?: string | null }) {
  const { colors } = usePlayfulTheme();
  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          props.multiline ? styles.multiline : null,
          { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
          props.style,
        ]}
      />
      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function TypePill({ type }: { type: LibraryType }) {
  const { colors } = usePlayfulTheme();
  const accent = type === 'what' ? colors.what : type === 'where' ? colors.where : type === 'when' ? colors.when : type === 'caveat' ? colors.caveat : colors.primary;
  return (
    <View style={[styles.pill, { backgroundColor: `${accent}22`, borderColor: accent }]}>
      <Text style={[styles.pillText, { color: colors.text }]}>{LIBRARY_TYPE_LABELS[type]}</Text>
    </View>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = usePlayfulTheme();
  return (
    <ColorfulCard>
      <Text style={[typography.subheading, { color: colors.text }]}>{title}</Text>
      <Text style={[typography.body, { color: colors.mutedText }]}>{message}</Text>
      {actionLabel && onAction ? <SecondaryButton label={actionLabel} onPress={onAction} /> : null}
    </ColorfulCard>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = usePlayfulTheme();
  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: `${colors.danger}18`, borderColor: colors.danger }]}>
      <Text style={[typography.body, { color: colors.text }]}>{message}</Text>
      {onRetry ? <TextButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export function LoadingState() {
  const { colors } = usePlayfulTheme();
  return <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} size="large" style={styles.loading} />;
}

export function LibrarySelector({
  label,
  libraries,
  selectedId,
  onSelect,
}: {
  label: string;
  libraries: Library[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = usePlayfulTheme();
  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
      {libraries.length ? (
        <View style={styles.chipRow}>
          {libraries.map((library) => {
            const selected = library.id === selectedId;
            return (
              <Pressable
                key={library.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                aria-checked={selected}
                onPress={() => onSelect(library.id)}
                style={({ pressed }) => [
                  styles.choice,
                  { backgroundColor: selected ? colors.secondary : colors.surface, borderColor: selected ? colors.text : colors.border, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Text numberOfLines={2} style={[typography.label, { color: colors.text }]}>{library.name}</Text>
                <Text style={[typography.small, { color: colors.mutedText }]}>{library.entries.length} {library.entries.length === 1 ? 'entry' : 'entries'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  const { colors } = usePlayfulTheme();
  return <Text style={[typography.heading, { color: colors.text }]}>{children}</Text>;
}

export function BodyText({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) {
  const { colors } = usePlayfulTheme();
  return <Text style={[typography.body, { color: muted ? colors.mutedText : colors.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flexGrow: 1, paddingHorizontal: spacing.lg, alignItems: 'center' },
  content: { width: '100%', maxWidth: layout.maxWidth, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerCopy: { flex: 1, gap: spacing.xs },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  backText: { fontSize: 42, lineHeight: 42, fontWeight: '400' },
  button: { minHeight: 50, borderWidth: 2, borderRadius: radii.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, lineHeight: 20, fontWeight: '900' },
  card: { borderWidth: 2, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  field: { gap: spacing.sm },
  input: { minHeight: 50, borderWidth: 2, borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 16 },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  errorText: { ...typography.small },
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  pillText: { ...typography.small, fontWeight: '800' },
  notice: { padding: spacing.lg, borderWidth: 1, borderRadius: radii.md, gap: spacing.sm },
  loading: { marginVertical: spacing.huge },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minWidth: 132, maxWidth: '100%', flexGrow: 1, flexBasis: 150, borderWidth: 2, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs },
  pressed: { opacity: 0.65 },
});
