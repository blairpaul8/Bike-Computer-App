import type { Activity, UserProfile } from '@/types/activity';

/**
 * Placeholder data until the backend exists. Activities are generated relative to the current
 * date so the overview always has rides in the current week, month and year.
 */

const DEVICE_ID = 'esp32-001';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Small seeded PRNG so the mock data is stable between reloads. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rideName(start: Date, distanceMeters: number, elevationGainMeters: number) {
  if (distanceMeters > 80_000) return 'Long Ride';
  if (elevationGainMeters > 900) return 'Hill Climb';
  const hour = start.getHours();
  if (hour < 11) return 'Morning Ride';
  if (hour < 14) return 'Lunch Ride';
  if (hour < 18) return 'Afternoon Ride';
  return 'Evening Ride';
}

function createActivity(index: number, start: Date, random: () => number): Activity {
  const isWeekend = start.getDay() === 0 || start.getDay() === 6;
  const distanceMeters =
    Math.round((isWeekend ? 35_000 + random() * 70_000 : 15_000 + random() * 30_000) / 10) * 10;
  const averageSpeedMps = 6 + random() * 2.5; // ~13–19 mph
  const movingTimeSeconds = Math.round(distanceMeters / averageSpeedMps);
  const elevationGainMeters = Math.round((distanceMeters / 1000) * (4 + random() * 14));

  return {
    id: `ride-${index}`,
    name: rideName(start, distanceMeters, elevationGainMeters),
    startTime: start.toISOString(),
    distanceMeters,
    movingTimeSeconds,
    elapsedTimeSeconds: Math.round(movingTimeSeconds * (1.05 + random() * 0.2)),
    elevationGainMeters,
    averageSpeedMps,
    maxSpeedMps: averageSpeedMps * (1.6 + random() * 0.6),
    syncedAt: new Date(start.getTime() + movingTimeSeconds * 1000 + 30 * 60 * 1000).toISOString(),
    deviceId: DEVICE_ID,
  };
}

function generateActivities(now = new Date()): Activity[] {
  const random = createRandom(42);
  const activities: Activity[] = [];

  // Always include a ride from a few hours ago so "this week" is never empty.
  activities.push(createActivity(0, new Date(now.getTime() - 3 * 60 * 60 * 1000), random));

  for (let daysAgo = 1; daysAgo < 400; daysAgo++) {
    const day = new Date(now.getTime() - daysAgo * DAY_MS);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    if (random() > (isWeekend ? 0.75 : 0.35)) continue;

    const start = new Date(day);
    start.setHours(isWeekend ? 8 : 6 + Math.floor(random() * 13), Math.floor(random() * 60), 0, 0);
    activities.push(createActivity(activities.length, start, random));
  }

  return activities;
}

export const mockActivities = generateActivities();

export const mockProfile: UserProfile = {
  id: 'user-1',
  displayName: 'Alex Rider',
  email: 'alex@example.com',
  location: 'Portland, OR',
  memberSince: '2025-03-14',
  devices: [
    {
      id: DEVICE_ID,
      name: 'Bike Computer',
      firmwareVersion: '0.1.0',
      lastSyncedAt: mockActivities[0].syncedAt,
    },
  ],
};
