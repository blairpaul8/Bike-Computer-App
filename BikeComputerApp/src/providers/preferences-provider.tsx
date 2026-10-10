import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';
import { Appearance, Platform } from 'react-native';

import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { UnitSystem } from '@/types/activity';

export type ColorSchemePreference = 'system' | ColorScheme;

type PreferencesContextValue = {
  /** What the user picked. `system` follows the OS setting. */
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (preference: ColorSchemePreference) => void;
  /** The scheme actually in effect after resolving `system`. */
  colorScheme: ColorScheme;
  colors: ThemeColors;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = PropsWithChildren<{
  initialColorScheme?: ColorSchemePreference;
  initialUnits?: UnitSystem;
}>;

// TODO: persist preferences (and later sync them to the user's profile on the backend).
export function PreferencesProvider({
  children,
  initialColorScheme = 'dark',
  initialUnits = 'imperial',
}: PreferencesProviderProps) {
  const [colorSchemePreference, setColorSchemePreference] =
    useState<ColorSchemePreference>(initialColorScheme);
  const [units, setUnits] = useState<UnitSystem>(initialUnits);
  const systemScheme = useColorScheme();

  // Override the native appearance so system UI (tab bar, alerts, keyboard) matches the app.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(
      colorSchemePreference === 'system' ? 'unspecified' : colorSchemePreference
    );
  }, [colorSchemePreference]);

  const colorScheme: ColorScheme =
    colorSchemePreference === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : colorSchemePreference;

  return (
    <PreferencesContext
      value={{
        colorSchemePreference,
        setColorSchemePreference,
        colorScheme,
        colors: Colors[colorScheme],
        units,
        setUnits,
      }}>
      {children}
    </PreferencesContext>
  );
}

export function usePreferences() {
  const context = use(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
