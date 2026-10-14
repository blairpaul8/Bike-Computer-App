import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Web has no system tab bar, so render our own bottom bar with headless tabs. */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {/* TabTriggers must be direct children of the TabList's child for route discovery. */}
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="bar_chart">Overview</TabButton>
          </TabTrigger>
          <TabTrigger name="activities" href="/activities" asChild>
            <TabButton icon="directions_bike">Activities</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="account_circle">Profile</TabButton>
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children, style, ...props }: TabListProps) {
  const theme = useTheme();

  return (
    <View {...props} style={[styles.tabListContainer, style]}>
      <View style={[styles.tabList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: NonNullable<Extract<SymbolViewProps['name'], object>['web']>;
};

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Icon name={{ web: icon }} size={22} color={isFocused ? 'accent' : 'textSecondary'} />
      <ThemedText type="caption" themeColor={isFocused ? 'accent' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    alignItems: 'center',
  },
  tabList: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.five,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
