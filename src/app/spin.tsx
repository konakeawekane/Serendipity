import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { AppHeader, BodyText, ColorfulCard, EmptyState, LibrarySelector, PrimaryButton, ScreenContainer, SecondaryButton, SectionTitle } from '@/components/ui';
import { SpinWheel } from '@/components/SpinWheel';
import { useAppData } from '@/context/AppDataProvider';
import { generateWheelResult } from '@/features/generators';
import { getWheelTargetRotation } from '@/features/wheel-geometry';
import { spacing, typography } from '@/theme/tokens';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { LibraryEntry } from '@/types/domain';

export default function SpinScreen() {
  const { libraries, settings } = useAppData();
  const { colors } = usePlayfulTheme();
  const wheelLibraries = useMemo(() => libraries.filter((item) => item.type === 'wheel'), [libraries]);
  const [requestedId, setRequestedId] = useState<string>();
  const [storedResult, setStoredResult] = useState<LibraryEntry | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [motion, setMotion] = useState({ from: 0, to: 0 });
  const [spinProgress] = useState(() => new Animated.Value(0));
  const pendingResult = useRef<LibraryEntry | null>(null);
  const rotationDegrees = useRef(0);
  const animationRun = useRef(0);
  const selectedId = wheelLibraries.some((item) => item.id === requestedId) ? requestedId : wheelLibraries[0]?.id;
  const selected = wheelLibraries.find((item) => item.id === selectedId);
  const result = storedResult && selected?.entries.some((entry) => entry.id === storedResult.id) ? storedResult : null;
  const animatedRotation = spinProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${motion.from}deg`, `${motion.to}deg`],
  });

  useEffect(() => {
    if (!isSpinning) return;
    const run = ++animationRun.current;
    spinProgress.setValue(0);
    const animation = Animated.timing(spinProgress, {
      toValue: 1,
      duration: 3600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start(({ finished }) => {
      if (!finished || run !== animationRun.current) return;
      rotationDegrees.current = motion.to;
      setStoredResult(pendingResult.current);
      pendingResult.current = null;
      setIsSpinning(false);
    });
    return () => animation.stop();
  }, [isSpinning, motion, spinProgress]);

  const choose = () => {
    if (!selected || isSpinning) return;
    const nextResult = generateWheelResult(selected.entries, result?.id, settings.avoidImmediateRepeats);
    if (!nextResult) return;
    const selectedIndex = selected.entries.findIndex((entry) => entry.id === nextResult.id);
    const from = rotationDegrees.current;
    const to = getWheelTargetRotation(selectedIndex, selected.entries.length, from);
    pendingResult.current = nextResult;
    setStoredResult(null);
    setMotion({ from, to });
    setIsSpinning(true);
  };
  const changeLibrary = (id: string) => {
    animationRun.current += 1;
    spinProgress.stopAnimation();
    spinProgress.setValue(0);
    pendingResult.current = null;
    rotationDegrees.current = 0;
    setMotion({ from: 0, to: 0 });
    setIsSpinning(false);
    setRequestedId(id);
    setStoredResult(null);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Spin the Wheel" subtitle="One library. One delightful decision." back />
      {wheelLibraries.length === 0 ? (
        <EmptyState title="No wheel library yet" message="Create a Wheel library, then add the options you want to spin." actionLabel="Create wheel library" onAction={() => router.push({ pathname: '/create-library', params: { type: 'wheel' } })} />
      ) : (
        <>
          <LibrarySelector label="Wheel library" libraries={wheelLibraries} selectedId={selectedId} onSelect={changeLibrary} />
          {selected?.entries.length ? <SpinWheel entries={selected.entries} rotation={animatedRotation} spinning={isSpinning} /> : null}
          {selected?.entries.length ? (
            <PrimaryButton
              label={isSpinning ? 'Spinning…' : result ? 'Spin again' : 'Spin'}
              accessibilityLabel={isSpinning ? 'Wheel spinning' : result ? 'Spin again' : 'Spin the wheel'}
              onPress={choose}
              loading={isSpinning}
            />
          ) : (
            <EmptyState title="This wheel is empty" message="Add at least one entry before spinning." actionLabel="Manage entries" onAction={() => router.push({ pathname: '/library/[id]', params: { id: selected!.id } })} />
          )}
          {isSpinning ? (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.spinningNotice, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
            >
              <BodyText>Wheel spinning…</BodyText>
              <BodyText muted>The result will appear when the pointer settles.</BodyText>
            </View>
          ) : result ? (
            <ColorfulCard accent={colors.primary}>
              <Text style={[typography.small, { color: colors.mutedText }]}>THE WHEEL CHOSE</Text>
              <Text accessibilityRole="header" style={[typography.heading, styles.resultText, { color: colors.text }]}>{result.text}</Text>
            </ColorfulCard>
          ) : selected?.entries.length ? (
            <BodyText muted>Tap Spin and watch the pointer choose your plan.</BodyText>
          ) : null}
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
  resultText: { textAlign: 'center' },
  spinningNotice: { borderWidth: 2, borderRadius: 16, padding: spacing.lg, gap: spacing.xs, alignItems: 'center' },
});
