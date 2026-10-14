import type { Activity } from '@/types/activity';

export type Period = 'week' | 'month' | 'year';

export type ChartBucket = {
  key: string;
  label: string;
  distanceMeters: number;
};

export type ActivitySummary = {
  count: number;
  distanceMeters: number;
  movingTimeSeconds: number;
  elevationGainMeters: number;
  /** Personal bests within the set; undefined when there are no activities. */
  bests?: {
    longest: Activity;
    longestDuration: Activity;
    fastest: Activity;
    biggestClimb: Activity;
  };
};

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Weeks start on Monday. */
export function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

export function getPeriodRange(period: Period, now = new Date()) {
  switch (period) {
    case 'week': {
      const start = startOfWeek(now);
      return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) };
    }
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1),
      };
  }
}

export function activitiesInPeriod(activities: Activity[], period: Period, now = new Date()) {
  const { start, end } = getPeriodRange(period, now);
  return activities.filter((activity) => {
    const time = new Date(activity.startTime);
    return time >= start && time < end;
  });
}

/** Distance per day (week/month) or per month (year), for the mileage chart. */
export function buildChartBuckets(
  activities: Activity[],
  period: Period,
  now = new Date()
): ChartBucket[] {
  const { start } = getPeriodRange(period, now);
  let buckets: ChartBucket[];
  let bucketIndex: (date: Date) => number;

  if (period === 'year') {
    buckets = Array.from({ length: 12 }, (_, month) => ({
      key: `m${month}`,
      label: new Date(now.getFullYear(), month, 1).toLocaleDateString(undefined, {
        month: 'narrow',
      }),
      distanceMeters: 0,
    }));
    bucketIndex = (date) => date.getMonth();
  } else {
    const days =
      period === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    buckets = Array.from({ length: days }, (_, day) => ({
      key: `d${day}`,
      label:
        period === 'week'
          ? WEEKDAY_LABELS[day]
          : day === 0 || (day + 1) % 7 === 0
            ? String(day + 1)
            : '',
      distanceMeters: 0,
    }));
    // Both sides are local midnights; round to absorb DST shifts.
    bucketIndex = (date) =>
      Math.round(
        (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
          start.getTime()) /
          (24 * 60 * 60 * 1000)
      );
  }

  for (const activity of activitiesInPeriod(activities, period, now)) {
    const bucket = buckets[bucketIndex(new Date(activity.startTime))];
    if (bucket) bucket.distanceMeters += activity.distanceMeters;
  }

  return buckets;
}

function isNonEmpty<T>(items: T[]): items is [T, ...T[]] {
  return items.length > 0;
}

function maxBy([first, ...rest]: [Activity, ...Activity[]], value: (a: Activity) => number) {
  return rest.reduce((best, activity) => (value(activity) > value(best) ? activity : best), first);
}

export function summarize(activities: Activity[]): ActivitySummary {
  return {
    count: activities.length,
    distanceMeters: activities.reduce((sum, a) => sum + a.distanceMeters, 0),
    movingTimeSeconds: activities.reduce((sum, a) => sum + a.movingTimeSeconds, 0),
    elevationGainMeters: activities.reduce((sum, a) => sum + a.elevationGainMeters, 0),
    bests: isNonEmpty(activities)
      ? {
          longest: maxBy(activities, (a) => a.distanceMeters),
          longestDuration: maxBy(activities, (a) => a.movingTimeSeconds),
          fastest: maxBy(activities, (a) => a.averageSpeedMps),
          biggestClimb: maxBy(activities, (a) => a.elevationGainMeters),
        }
      : undefined,
  };
}
