import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppData } from '@/context/AppDataProvider';
import { themes, type AppTheme } from '@/theme/tokens';

type ThemeValue = { colors: AppTheme; scheme: 'light' | 'dark' };
const ThemeContext = createContext<ThemeValue>({ colors: themes.light, scheme: 'light' });

export function PlayfulThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { settings } = useAppData();
  const scheme = settings.themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.themePreference;
  const value = useMemo(() => ({ colors: themes[scheme], scheme }), [scheme]);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = useMemo(() => ({
    ...base,
    colors: {
      ...base.colors,
      primary: value.colors.primary,
      background: value.colors.background,
      card: value.colors.surface,
      text: value.colors.text,
      border: value.colors.border,
      notification: value.colors.caveat,
    },
  }), [base, value]);
  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function usePlayfulTheme() {
  return useContext(ThemeContext);
}
