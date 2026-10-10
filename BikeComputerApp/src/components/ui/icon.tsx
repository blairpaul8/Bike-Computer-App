import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconProps = {
  name: SymbolViewProps['name'];
  size?: number;
  color?: ThemeColor;
};

/** Cross-platform icon: SF Symbols on iOS, Material Symbols on Android and web. */
export function Icon({ name, size = 16, color = 'textSecondary' }: IconProps) {
  const theme = useTheme();
  return <SymbolView name={name} size={size} tintColor={theme[color]} />;
}
