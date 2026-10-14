import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useActivity } from '@/api/queries';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { StatGrid, StatTile } from '@/components/ui/stat-tile';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePreferences } from '@/providers/preferences-provider';
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatLongDateTime,
  formatSpeed,
} from '@/utils/format';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { units } = usePreferences();
  const theme = useTheme();
  const { data: activity, isPending, error, refetch } = useActivity(id);

  if (isPending) {
    return (
      <Screen topInset={false}>
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen topInset={false}>
        <ErrorState message={error.message} onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen
      topInset={false}
      title={activity.name}
      subtitle={formatLongDateTime(activity.startTime)}>
      {/* Placeholder until we render the GPS track from the device. */}
      <View
        style={[
          styles.mapPlaceholder,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <Icon name={{ ios: 'map', android: 'map', web: 'map' }} size={32} />
        <ThemedText type="small" themeColor="textSecondary">
          Route map coming soon
        </ThemedText>
      </View>

      <Card>
        <StatGrid>
          <StatTile label="Distance" value={formatDistance(activity.distanceMeters, units)} />
          <StatTile label="Moving time" value={formatDuration(activity.movingTimeSeconds)} />
          <StatTile label="Avg speed" value={formatSpeed(activity.averageSpeedMps, units)} />
          <StatTile label="Max speed" value={formatSpeed(activity.maxSpeedMps, units)} />
          <StatTile
            label="Elevation gain"
            value={formatElevation(activity.elevationGainMeters, units)}
          />
          <StatTile label="Elapsed time" value={formatDuration(activity.elapsedTimeSeconds)} />
        </StatGrid>
      </Card>

      <Card title="Sync">
        <DetailRow label="Device" value={activity.deviceId} />
        <DetailRow label="Synced" value={formatLongDateTime(activity.syncedAt)} />
      </Card>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.detailValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: 200,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
