/**
 * Domain models shared across the app. Shapes mirror what we expect the C# backend to return
 * (camelCase JSON, SI units, ISO-8601 timestamps), so swapping mocks for real API calls
 * should not require UI changes.
 */

export type UnitSystem = 'imperial' | 'metric';

export type Activity = {
  id: string;
  name: string;
  /** ISO-8601 timestamp of when the ride started. */
  startTime: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;
  elevationGainMeters: number;
  averageSpeedMps: number;
  maxSpeedMps: number;
  /** ISO-8601 timestamp of when the ride was synced from the bike computer. */
  syncedAt: string;
  deviceId: string;
};

export type BikeComputer = {
  id: string;
  name: string;
  firmwareVersion: string;
  /** ISO-8601 timestamp of the last successful sync. */
  lastSyncedAt: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  location: string;
  /** ISO-8601 date the account was created. */
  memberSince: string;
  devices: BikeComputer[];
};
