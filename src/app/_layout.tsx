import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/context/AppDataProvider';
import { migrateDatabase } from '@/db/migrations';
import { PlayfulThemeProvider, usePlayfulTheme } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="playful-generators.db" onInit={migrateDatabase}>
          <AppDataProvider>
            <PlayfulThemeProvider>
              <AppNavigation />
            </PlayfulThemeProvider>
          </AppDataProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigation() {
  const { scheme } = usePlayfulTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spin" />
        <Stack.Screen name="what-where-when" />
        <Stack.Screen name="caveat" />
        <Stack.Screen name="library/[id]" />
        <Stack.Screen name="create-library" />
        <Stack.Screen name="import-library" />
      </Stack>
    </>
  );
}
