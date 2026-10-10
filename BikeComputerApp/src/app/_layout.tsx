import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import AppTabs from '@/components/app-tabs';
import { PreferencesProvider, usePreferences } from '@/providers/preferences-provider';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider initialColorScheme="dark">
        <ThemedNavigation />
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

/** Keeps React Navigation's theme (headers, backgrounds) in sync with our color tokens. */
function ThemedNavigation() {
  const { colorScheme, colors } = usePreferences();
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
        },
      }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppTabs />
    </ThemeProvider>
  );
}
