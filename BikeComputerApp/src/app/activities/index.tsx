import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActivities } from '@/api/queries';
import { ActivityRow } from '@/components/activity/activity-row';
import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/query-state';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePreferences } from '@/providers/preferences-provider';
import type { Activity } from '@/types/activity';
import { formatDistance, formatMonthYear } from '@/utils/format';

type MonthSection = {
  key: string;
  title: string;
  distanceMeters: number;
  data: Activity[];
};

/** Groups activities (already sorted newest first) by calendar month. */
function groupByMonth(activities: Activity[]): MonthSection[] {
  const sections: MonthSection[] = [];
  for (const activity of activities) {
    const date = new Date(activity.startTime);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let section = sections.at(-1);
    if (section?.key !== key) {
      section = { key, title: formatMonthYear(date), distanceMeters: 0, data: [] };
      sections.push(section);
    }
    section.data.push(activity);
    section.distanceMeters += activity.distanceMeters;
  }
  return sections;
}

export default function ActivitiesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { units } = usePreferences();
  const { data: activities, isPending, error, refetch, isRefetching } = useActivities();

  const header = (
    <View style={styles.header}>
      <ThemedText type="title" accessibilityRole="header">
        Activities
      </ThemedText>
      {activities ? (
        <ThemedText type="small" themeColor="textSecondary">
          {activities.length} rides synced
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <SectionList
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: insets.left + Spacing.three,
          paddingRight: insets.right + Spacing.three,
        },
      ]}
      sections={activities ? groupByMonth(activities) : []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      ListEmptyComponent={
        isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : (
          <EmptyState
            title="No rides yet"
            message="Rides you sync from your bike computer will show up here."
          />
        )
      }
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">{section.title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {section.data.length} rides · {formatDistance(section.distanceMeters, units)}
          </ThemedText>
        </View>
      )}
      renderItem={({ item }) => <ActivityRow activity={item} units={units} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  separator: {
    height: Spacing.two,
  },
});
