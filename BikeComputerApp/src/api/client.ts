import { mockActivities, mockProfile } from '@/data/mock-data';
import type { Activity, UserProfile } from '@/types/activity';

/**
 * Data access layer. Every function here returns a Promise so screens are already written
 * against an async API; replace the mock bodies with `fetch` calls to the C# backend later.
 */

const MOCK_LATENCY_MS = 300;

function mockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_LATENCY_MS));
}

export class NotFoundError extends Error {}

export async function getActivities(): Promise<Activity[]> {
  const sorted = [...mockActivities].sort((a, b) => b.startTime.localeCompare(a.startTime));
  return mockResponse(sorted);
}

export async function getActivity(id: string): Promise<Activity> {
  const activity = mockActivities.find((a) => a.id === id);
  if (!activity) throw new NotFoundError(`Activity ${id} not found`);
  return mockResponse(activity);
}

export async function getProfile(): Promise<UserProfile> {
  return mockResponse(mockProfile);
}
