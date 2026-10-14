/**
 * Design tokens for the app. Components should read colors through `useTheme()`
 * rather than importing `Colors` directly, so they follow the user's appearance preference.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0E1116',
    textSecondary: '#5B6470',
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceRaised: '#ECEEF1',
    border: '#E1E4E8',
    accent: '#E8571C',
    onAccent: '#FFFFFF',
    chartTrack: '#E6E8EC',
    success: '#1F9D55',
  },
  dark: {
    text: '#F2F4F7',
    textSecondary: '#9AA3AE',
    background: '#0B0D10',
    surface: '#15181D',
    surfaceRaised: '#1F232A',
    border: '#272C34',
    accent: '#FF6B2C',
    onAccent: '#0B0D10',
    chartTrack: '#1F232A',
    success: '#3DD68C',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeColors = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Extra bottom padding so scroll content clears the tab bar. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 88 }) ?? 0;
export const MaxContentWidth = 800;
