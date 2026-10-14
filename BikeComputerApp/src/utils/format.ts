import type { UnitSystem } from '@/types/activity';

const METERS_PER_MILE = 1609.344;
const FEET_PER_METER = 3.28084;

export function distanceUnit(units: UnitSystem) {
  return units === 'imperial' ? 'mi' : 'km';
}

export function toDistance(meters: number, units: UnitSystem) {
  return units === 'imperial' ? meters / METERS_PER_MILE : meters / 1000;
}

export function formatDistance(meters: number, units: UnitSystem, { withUnit = true } = {}) {
  const value = toDistance(meters, units).toFixed(1);
  return withUnit ? `${value} ${distanceUnit(units)}` : value;
}

export function formatSpeed(metersPerSecond: number, units: UnitSystem) {
  return units === 'imperial'
    ? `${((metersPerSecond * 3600) / METERS_PER_MILE).toFixed(1)} mph`
    : `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

export function formatElevation(meters: number, units: UnitSystem) {
  return units === 'imperial'
    ? `${Math.round(meters * FEET_PER_METER).toLocaleString()} ft`
    : `${Math.round(meters).toLocaleString()} m`;
}

/** e.g. `1h 24m`, or `42m` for rides under an hour. */
export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** e.g. `Tue, Oct 7`. */
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** e.g. `Tuesday, October 7, 2026 at 7:12 AM`. */
export function formatLongDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
