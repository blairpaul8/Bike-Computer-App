import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  title?: string;
  /** Rendered on the right side of the title row, e.g. a segmented control or link. */
  action?: ReactNode;
};

export function Card({ title, action, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}
      {...rest}>
      {title || action ? (
        <View style={styles.titleRow}>
          {title ? <ThemedText type="smallBold">{title}</ThemedText> : <View />}
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Section heading used between cards. */
export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText type="heading" accessibilityRole="header">
        {children}
      </ThemedText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -Spacing.two,
  },
});
