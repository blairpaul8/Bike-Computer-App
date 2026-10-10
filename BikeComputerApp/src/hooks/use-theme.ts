import { usePreferences } from '@/providers/preferences-provider';

/** Returns the color tokens for the active color scheme. */
export function useTheme() {
  return usePreferences().colors;
}
