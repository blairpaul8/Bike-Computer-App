import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useActivities } from '@/api/queries';
import { ActivityRow } from '@/components/activity/activity-row';
import { MileageChart } from '@/components/activity/mileage-chart';
import { ThemedText } from '@/components/themed-text';
import { Card, SectionTitle } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatGrid, StatTile } from '@/components/ui/stat-tile';
import { Spacing } from '@/constants/theme';
import { usePreferences } from '@/providers/preferences-provider';
import {
  activitiesInPeriod,
  buildChartBuckets,
  startOfWeek,
  summarize,
  type Period,
} from '@/utils/activity-stats';
import {
  distanceUnit,
  formatDistance,
  formatDuration,
  formatElevation,
  formatShortDate,
  formatSpeed,
} from '@/utils/format';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const;

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

export default function OverviewScreen() {
  const { units } = usePreferences();
  const { data: activities, isPending, error, refetch, isRefetching } = useActivities();
  const [period, setPeriod] = useState<Period>('week');

  if (isPending) {
    return (
      <Screen title="Overview">
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Overview">
        <ErrorState message={error.message} onRetry={refetch} />
      </Screen>
    );
  }

  const now = new Date();
  const periodActivities = activitiesInPeriod(activities, period, now);
  const summary = summarize(periodActivities);
  const buckets = buildChartBuckets(activities, period, now);
  const currentIndex =
    period === 'year'
      ? now.getMonth()
      : period === 'month'
        ? now.getDate() - 1
        : (now.getDay() + 6) % 7;
  const thisWeek = activitiesInPeriod(activities, 'week', now);

  return (
    <Screen
      title="Overview"
      subtitle={`Week of ${formatShortDate(startOfWeek(now).toISOString())}`}
      refreshing={isRefetching}
      onRefresh={refetch}>
      <Card
        title="Distance"
        action={
          <SegmentedControl
            accessibilityLabel="Chart period"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
        }>
        <View style={styles.total}>
          <ThemedText type="stat">
            {formatDistance(summary.distanceMeters, units, { withUnit: false })}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {distanceUnit(units)} · {PERIOD_LABELS[period].toLowerCase()}
          </ThemedText>
        </View>
        <MileageChart buckets={buckets} units={units} currentIndex={currentIndex} />
        <StatGrid>
          <StatTile label="Rides" value={String(summary.count)} />
          <StatTile label="Moving time" value={formatDuration(summary.movingTimeSeconds)} />
          <StatTile label="Elevation" value={formatElevation(summary.elevationGainMeters, units)} />
          <StatTile
            label="Avg distance"
            value={formatDistance(
              summary.count ? summary.distanceMeters / summary.count : 0,
              units
            )}
          />
        </StatGrid>
      </Card>

      <Card title={`Highlights · ${PERIOD_LABELS[period]}`}>
        {summary.bests ? (
          <StatGrid>
            <StatTile
              label="Longest ride"
              value={formatDistance(summary.bests.longest.distanceMeters, units)}
              detail={formatShortDate(summary.bests.longest.startTime)}
            />
            <StatTile
              label="Fastest avg"
              value={formatSpeed(summary.bests.fastest.averageSpeedMps, units)}
              detail={formatShortDate(summary.bests.fastest.startTime)}
            />
            <StatTile
              label="Biggest climb"
              value={formatElevation(summary.bests.biggestClimb.elevationGainMeters, units)}
              detail={formatShortDate(summary.bests.biggestClimb.startTime)}
            />
            <StatTile
              label="Longest time"
              value={formatDuration(summary.bests.longestDuration.movingTimeSeconds)}
              detail={formatShortDate(summary.bests.longestDuration.startTime)}
            />
          </StatGrid>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            No rides yet in this period.
          </ThemedText>
        )}
      </Card>

      <SectionTitle>This week&apos;s rides</SectionTitle>
      {thisWeek.length === 0 ? (
        <EmptyState
          title="No rides this week"
          message="Sync your bike computer to see your latest rides here."
        />
      ) : (
        <View style={styles.list}>
          {thisWeek.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} units={units} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
});
