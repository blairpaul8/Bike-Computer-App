import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useActivities, useProfile } from '@/api/queries';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatGrid, StatTile } from '@/components/ui/stat-tile';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePreferences } from '@/providers/preferences-provider';
import { summarize } from '@/utils/activity-stats';
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatLongDateTime,
} from '@/utils/format';

const APPEARANCE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const UNIT_OPTIONS = [
  { value: 'imperial', label: 'mi' },
  { value: 'metric', label: 'km' },
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { colorSchemePreference, setColorSchemePreference, units, setUnits } = usePreferences();
  const { data: profile, isPending, error, refetch } = useProfile();
  const { data: activities } = useActivities();

  if (isPending) {
    return (
      <Screen title="Profile">
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Profile">
        <ErrorState message={error.message} onRetry={refetch} />
      </Screen>
    );
  }

  const lifetime = summarize(activities ?? []);
  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Screen title="Profile">
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <ThemedText type="heading" style={{ color: theme.onAccent }}>
            {initials(profile.displayName)}
          </ThemedText>
        </View>
        <View style={styles.identityText}>
          <ThemedText type="heading">{profile.displayName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {profile.location}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            Member since {memberSince}
          </ThemedText>
        </View>
      </View>

      <Card title="Lifetime">
        <StatGrid>
          <StatTile label="Rides" value={String(lifetime.count)} />
          <StatTile label="Distance" value={formatDistance(lifetime.distanceMeters, units)} />
          <StatTile label="Moving time" value={formatDuration(lifetime.movingTimeSeconds)} />
          <StatTile
            label="Elevation"
            value={formatElevation(lifetime.elevationGainMeters, units)}
          />
        </StatGrid>
      </Card>

      <Card title="Account">
        <InfoRow label="Email" value={profile.email} />
      </Card>

      {profile.devices.map((device) => (
        <Card key={device.id} title="Bike computer">
          <InfoRow label="Name" value={device.name} />
          <InfoRow label="Firmware" value={device.firmwareVersion} />
          <InfoRow label="Last synced" value={formatLongDateTime(device.lastSyncedAt)} />
        </Card>
      ))}

      <Card title="Preferences">
        <SettingRow label="Appearance">
          <SegmentedControl
            accessibilityLabel="Appearance"
            options={APPEARANCE_OPTIONS}
            value={colorSchemePreference}
            onChange={setColorSchemePreference}
          />
        </SettingRow>
        <SettingRow label="Units">
          <SegmentedControl
            accessibilityLabel="Units"
            options={UNIT_OPTIONS}
            value={units}
            onChange={setUnits}
          />
        </SettingRow>
      </Card>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={[styles.row, styles.settingRow]}>
      <ThemedText type="small">{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  settingRow: {
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
