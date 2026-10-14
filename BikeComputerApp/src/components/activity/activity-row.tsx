import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Activity, UnitSystem } from '@/types/activity';
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatShortDate,
  formatTime,
} from '@/utils/format';

type ActivityRowProps = {
  activity: Activity;
  units: UnitSystem;
};

export function ActivityRow({ activity, units }: ActivityRowProps) {
  const theme = useTheme();

  return (
    <Link href={`/activities/${activity.id}`} asChild>
      {/* Layout lives on the inner View: Link's slot doesn't forward function styles on web. */}
      <Pressable accessibilityRole="link" accessibilityHint="Opens ride details">
        {({ pressed }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.surfaceRaised }]}>
              <Icon
                name={{ ios: 'bicycle', android: 'directions_bike', web: 'directions_bike' }}
                size={20}
                color="accent"
              />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.flex}>
                  {activity.name}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {formatShortDate(activity.startTime)} · {formatTime(activity.startTime)}
                </ThemedText>
              </View>
              <View style={styles.metrics}>
                <Metric value={formatDistance(activity.distanceMeters, units)} />
                <Metric value={formatDuration(activity.movingTimeSeconds)} />
                <Metric value={formatElevation(activity.elevationGainMeters, units)} />
              </View>
            </View>
            <Icon
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
            />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Metric({ value }: { value: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {value}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  flex: {
    flexShrink: 1,
  },
  metrics: {
    flexDirection: 'row',
    gap: Spacing.three,
    flexWrap: 'wrap',
  },
});
