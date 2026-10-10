import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type StatTileProps = {
  label: string;
  value: string;
  /** Optional supporting line, e.g. the date of a personal best. */
  detail?: string;
};

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="heading" numberOfLines={1}>
        {value}
      </ThemedText>
      {detail ? (
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {detail}
        </ThemedText>
      ) : null}
    </View>
  );
}

/** Lays out stat tiles two per row on phones, wrapping naturally on wider screens. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    gap: Spacing.half,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
    columnGap: Spacing.three,
  },
});
