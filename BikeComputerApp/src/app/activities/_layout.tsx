import { Stack } from 'expo-router';

export default function ActivitiesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Activities' }} />
      <Stack.Screen name="[id]" options={{ title: 'Ride' }} />
    </Stack>
  );
}
