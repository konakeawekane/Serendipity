import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaintSplatter } from '@/components/PaintSplatter';
import { AppHeader, ScreenContainer } from '@/components/ui';
import { radii, spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';

const generators = [
  { title: 'Spin the Wheel', description: 'Let one of your own ideas win.', route: '/spin' as const, symbol: '↻', accent: 'primary' as const },
  { title: 'What, Where, When', description: 'Mix three libraries into one plan.', route: '/what-where-when' as const, symbol: '✦', accent: 'where' as const },
  { title: 'Caveat Generator', description: 'Add a playful twist to a commitment.', route: '/caveat' as const, symbol: '!', accent: 'caveat' as const },
];

export default function MakeScreen() {
  const { colors } = usePlayfulTheme();
  return (
    <ScreenContainer tab>
      <View style={styles.hero}>
        <View style={styles.splatter}><PaintSplatter color={colors.primary} size={130} /></View>
        <AppHeader title="Make a plan" subtitle="Your ideas, shuffled into something worth doing." />
      </View>
      <View style={styles.grid}>
        {generators.map((item) => {
          const accent = colors[item.accent];
          return (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title}`}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: accent, opacity: pressed ? 0.78 : 1 }]}>
              <View style={[styles.symbol, { backgroundColor: accent }]}><Text style={styles.symbolText}>{item.symbol}</Text></View>
              <View style={styles.cardCopy}>
                <Text style={[typography.heading, { color: colors.text }]}>{item.title}</Text>
                <Text style={[typography.body, { color: colors.mutedText }]}>{item.description}</Text>
              </View>
              <Text style={[styles.arrow, { color: colors.text }]}>›</Text>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 150, justifyContent: 'center' },
  splatter: { position: 'absolute', right: -20, top: -20 },
  grid: { gap: spacing.lg },
  card: { minHeight: 150, borderWidth: 2, borderRadius: radii.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  symbol: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
  symbolText: { fontSize: 30, fontWeight: '900', color: '#241620' },
  cardCopy: { flex: 1, gap: spacing.sm },
  arrow: { fontSize: 36, lineHeight: 40 },
});
