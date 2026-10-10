import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: ReactNode;
  /** Set to false when a navigation header already handles the top safe area. */
  topInset?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

/** Scrollable page wrapper that handles safe areas, the tab bar and max content width. */
export function Screen({
  title,
  subtitle,
  topInset = true,
  refreshing = false,
  onRefresh,
  children,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: (topInset ? insets.top : 0) + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: insets.left + Spacing.three,
          paddingRight: insets.right + Spacing.three,
        },
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        ) : undefined
      }>
      <View style={styles.inner}>
        {title ? (
          <View style={styles.header}>
            <ThemedText type="title" accessibilityRole="header">
              {title}
            </ThemedText>
            {typeof subtitle === 'string' ? (
              <ThemedText type="small" themeColor="textSecondary">
                {subtitle}
              </ThemedText>
            ) : (
              subtitle
            )}
          </View>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.half,
  },
});
