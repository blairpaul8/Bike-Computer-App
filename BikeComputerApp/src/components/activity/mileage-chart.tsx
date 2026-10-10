import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UnitSystem } from '@/types/activity';
import type { ChartBucket } from '@/utils/activity-stats';
import { formatDistance } from '@/utils/format';

const CHART_HEIGHT = 140;

type MileageChartProps = {
  buckets: ChartBucket[];
  units: UnitSystem;
  /** Index of the bucket for "today" / "this month", drawn in the accent color. */
  currentIndex?: number;
};

/**
 * Simple bar chart built from Views so it works everywhere without a charting dependency.
 * Swap for a charting library if we need axes, tooltips or gestures later.
 */
export function MileageChart({ buckets, units, currentIndex }: MileageChartProps) {
  const theme = useTheme();
  const max = Math.max(...buckets.map((b) => b.distanceMeters), 1);
  const dense = buckets.length > 12;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Distance chart. Peak ${formatDistance(max, units)}.`}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.maxLabel}>
        {formatDistance(max, units)}
      </ThemedText>
      <View style={[styles.bars, { gap: dense ? 2 : Spacing.two }]}>
        {buckets.map((bucket, index) => (
          <View key={bucket.key} style={[styles.track, { backgroundColor: theme.chartTrack }]}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(bucket.distanceMeters / max) * 100}%`,
                  backgroundColor: index === currentIndex ? theme.accent : theme.textSecondary,
                  opacity: index === currentIndex ? 1 : 0.55,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={[styles.labels, { gap: dense ? 2 : Spacing.two }]}>
        {buckets.map((bucket) => (
          <ThemedText
            key={bucket.key}
            type="caption"
            themeColor="textSecondary"
            numberOfLines={1}
            style={[styles.label, dense && styles.denseLabel]}>
            {bucket.label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  maxLabel: {
    textAlign: 'right',
    marginBottom: Spacing.one,
  },
  bars: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  track: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  labels: {
    flexDirection: 'row',
    marginTop: Spacing.one,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
  denseLabel: {
    // Month view labels (1, 7, 14…) are wider than their bar; let them overflow.
    overflow: 'visible',
    fontSize: 10,
  },
});
