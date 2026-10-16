import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { usePlayfulTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = usePlayfulTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 12 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Make', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✦</Text> }} />
      <Tabs.Screen name="libraries" options={{ title: 'Libraries', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>▤</Text> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙</Text> }} />
    </Tabs>
  );
}
