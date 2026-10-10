# Bike Computer App — Details

The companion mobile app for the ESP32 bike computer. Riders sync rides from the device and review them on their phone. The app is built with **Expo SDK 57 / React Native 0.86 / Expo Router** in TypeScript, and the backend is in **C#**.

At the moment the app runs entirely on **mock data**. This document covers:

1. [Running the app](#1-running-the-app)
2. [Project structure](#2-project-structure)
3. [Backend API contract](#3-backend-api-contract): what the C# API needs to return
4. [Wiring the backend into the app](#4-wiring-the-backend-into-the-app)
5. [Notes for further development](#5-notes-for-further-development)

---

## 1. Running the app

```bash
cd BikeComputerApp
npm install
npx expo start          # then press `i` for the iOS simulator, `a` for Android, `w` for web
```

**iOS simulator on macOS:** install Xcode and at least one iOS simulator first. From `npx expo start`, pressing `i` opens the app in Expo Go on the simulator. Some native modules aren't included in Expo Go, so if a screen fails because one is missing, or once we add Bluetooth or other native libraries, make a development build instead:

```bash
npx expo run:ios        # builds the native project locally with Xcode and launches the simulator
```

`ios/` and `android/` are **generated** (Continuous Native Generation). Don't edit them by hand. Native configuration goes in `app.json` or config plugins.

Checks to run before committing:

```bash
npx tsc --noEmit        # typecheck
npx expo lint           # lint
npx expo-doctor         # dependency / config health
```

Add dependencies with `npx expo install <package>`, not `npm install`. It picks versions that are compatible with the SDK.

---

## 2. Project structure

```
BikeComputerApp/
├── app.json                      # Expo config (name, icons, splash, plugins)
├── app_details.md                # this file
└── src/
    ├── app/                      # ROUTES ONLY: every file is a screen (Expo Router)
    │   ├── _layout.tsx           # root: QueryClient + Preferences + navigation theme + tabs
    │   ├── index.tsx             # Tab 1: Overview (chart, period stats, this week's rides)
    │   ├── activities/
    │   │   ├── _layout.tsx       # Stack navigator inside the Activities tab
    │   │   ├── index.tsx         # Tab 2: ride history grouped by month
    │   │   └── [id].tsx          # Ride detail (pushed onto the stack)
    │   └── profile.tsx           # Tab 3: profile, lifetime stats, device, preferences
    │
    ├── api/
    │   ├── client.ts             # data access layer: the ONLY place that talks to the backend
    │   └── queries.ts            # TanStack Query hooks (useActivities, useActivity, useProfile)
    │
    ├── components/
    │   ├── app-tabs.tsx          # native bottom tabs (iOS/Android)
    │   ├── app-tabs.web.tsx      # custom bottom tab bar for web
    │   ├── themed-text.tsx       # Text with theme colors + type scale
    │   ├── themed-view.tsx       # View with theme background
    │   ├── activity/             # domain components (activity row, mileage chart)
    │   └── ui/                   # generic building blocks (Screen, Card, StatTile, SegmentedControl, Icon, loading/error/empty states)
    │
    ├── constants/theme.ts        # design tokens: Colors (light/dark), Spacing, Radius, Fonts
    ├── data/mock-data.ts         # generated mock rides + profile (delete once the API is live)
    ├── hooks/                    # useTheme, useColorScheme
    ├── providers/
    │   └── preferences-provider.tsx  # global appearance (system/light/dark) + units (mi/km)
    ├── types/activity.ts         # domain models: Activity, UserProfile, BikeComputer
    └── utils/
        ├── activity-stats.ts     # period ranges, chart buckets, totals and personal bests
        └── format.ts             # unit conversion + display formatting (distance, speed, time, dates)
```

### Key conventions

- **Routes vs. everything else:** only screens and `_layout.tsx` files belong in `src/app/`. Components, hooks and utilities go outside it.
- **Data flow:** screen → hook in `api/queries.ts` → function in `api/client.ts` → backend (mock data for now). Screens never call `fetch` or import mock data directly.
- **Theming:** never hard-code colors in components. Use `useTheme()`, which returns the active color set from `constants/theme.ts`. To add a color, add it to **both** the `light` and `dark` sets.
  - The app currently defaults to **dark mode**, via `initialColorScheme="dark"` in `src/app/_layout.tsx`.
  - Users can switch between System, Light and Dark on the Profile tab.
  - The provider also calls `Appearance.setColorScheme` so native UI (the tab bar, alerts, the keyboard) matches the app.
- **Units:** all data is stored and passed around in **SI units** (meters, seconds, m/s). It's converted to mi/km, mph/km/h and ft/m only at display time, in `utils/format.ts`, based on the user's unit preference.
- **Platform files:** `*.web.tsx` / `*.web.ts` override the native version on web. For example, web has no system tab bar, so `app-tabs.web.tsx` provides one.
- **Path alias:** `@/` maps to `src/`.

---

## 3. Backend API contract

The TypeScript types in `src/types/activity.ts` define the contract. **The C# API should return JSON that matches these shapes exactly.** If the backend needs a different shape, update the types file and this section together.

### General rules

| Rule | Detail |
| --- | --- |
| JSON casing | `camelCase` property names. This is the ASP.NET Core / System.Text.Json default, so C# `PascalCase` properties serialize correctly with no extra configuration. |
| Timestamps | ISO‑8601 **UTC** strings with a `Z` suffix, e.g. `"2026-10-10T14:25:00Z"`. Use `DateTimeOffset` or UTC `DateTime` in C#. The app converts to local time for display. |
| Dates without time | ISO date string `"2025-03-14"` (C# `DateOnly`). |
| Units | SI only: meters, seconds, meters/second. **No unit conversion on the server.** |
| IDs | Strings. GUIDs are fine; the app never parses them. |
| Errors | Use [RFC 7807 ProblemDetails](https://learn.microsoft.com/aspnet/core/web-api/handle-errors) (ASP.NET's built-in format) with correct status codes: `404` when an activity doesn't exist, `401` when not authenticated, `400` for validation errors. |
| Base path | `/api/...` (suggested). |
| Auth | Planned: JWT bearer token in the `Authorization` header (see §5). Endpoints that return user data should be scoped to the signed-in user, so `/me` instead of `/users/{id}`. |

### Endpoints the app uses today

These map one-to-one to the functions in `src/api/client.ts`.

#### `GET /api/activities` → `Activity[]`

Returns the signed-in user's rides, **sorted newest first**.

```json
[
  {
    "id": "8f0c2b7e-1c1a-4d5e-9a0e-2a1f3b4c5d6e",
    "name": "Morning Ride",
    "startTime": "2026-10-10T14:25:00Z",
    "distanceMeters": 77120,
    "movingTimeSeconds": 10800,
    "elapsedTimeSeconds": 12840,
    "elevationGainMeters": 1228,
    "averageSpeedMps": 7.14,
    "maxSpeedMps": 12.16,
    "syncedAt": "2026-10-10T18:02:11Z",
    "deviceId": "esp32-001"
  }
]
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique ride id |
| `name` | string | Display name. The server can generate a default ("Morning Ride") from the start time. |
| `startTime` | ISO UTC string | When the ride started (from GPS time) |
| `distanceMeters` | number | Total distance |
| `movingTimeSeconds` | integer | Time spent moving (excludes stops) |
| `elapsedTimeSeconds` | integer | Wall-clock time from start to finish |
| `elevationGainMeters` | number | Total ascent |
| `averageSpeedMps` | number | Should equal `distanceMeters / movingTimeSeconds` |
| `maxSpeedMps` | number | Peak speed |
| `syncedAt` | ISO UTC string | When the backend received the ride |
| `deviceId` | string | Which bike computer recorded it |

> **Pagination (needed soon):** the app currently fetches every ride and computes stats on the client. Once real riders have hundreds of rides, add `?page=&pageSize=` (or cursor-based `?before=<startTime>&limit=`) and switch the Activities list to TanStack Query's `useInfiniteQuery`. A suggested response shape is
> `{ "items": Activity[], "nextCursor": string | null }`.

#### `GET /api/activities/{id}` → `Activity`

Returns a single ride in the same shape as above. Returns `404` ProblemDetails if the ride doesn't exist or doesn't belong to the user.

#### `GET /api/me` → `UserProfile`

```json
{
  "id": "b1e1f2a3-...",
  "displayName": "Alex Rider",
  "email": "alex@example.com",
  "location": "Portland, OR",
  "memberSince": "2025-03-14",
  "devices": [
    {
      "id": "esp32-001",
      "name": "Bike Computer",
      "firmwareVersion": "0.1.0",
      "lastSyncedAt": "2026-10-10T18:02:11Z"
    }
  ]
}
```

### Matching C# models (suggested)

```csharp
public record ActivityDto(
    string Id,
    string Name,
    DateTimeOffset StartTime,
    double DistanceMeters,
    int MovingTimeSeconds,
    int ElapsedTimeSeconds,
    double ElevationGainMeters,
    double AverageSpeedMps,
    double MaxSpeedMps,
    DateTimeOffset SyncedAt,
    string DeviceId);

public record BikeComputerDto(
    string Id,
    string Name,
    string FirmwareVersion,
    DateTimeOffset LastSyncedAt);

public record UserProfileDto(
    string Id,
    string DisplayName,
    string Email,
    string Location,
    DateOnly MemberSince,
    IReadOnlyList<BikeComputerDto> Devices);
```

If the API serializes `DateTimeOffset` values with a non-zero offset (e.g. `-07:00`), that's fine too: JavaScript's `Date` parses it correctly. UTC is just simpler to reason about.

### Endpoints we will likely need next

These aren't used by the app yet; they're listed so the backend design can plan for them.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/activities/{id}/track` | GPS track for the route map: `{ "points": [{ "t": ISO, "lat": number, "lon": number, "eleM": number, "speedMps": number }] }`. Consider also returning an encoded polyline for fast map rendering. |
| `GET /api/stats?period=week\|month\|year&date=YYYY-MM-DD` | Server-side aggregates for the Overview (totals, chart buckets, personal bests). Replaces the client-side math in `utils/activity-stats.ts` once ride counts grow. Return chart buckets as `[{ "start": ISO, "distanceMeters": number }]` and let the app format the labels. |
| `PATCH /api/activities/{id}` | Rename a ride, add notes. |
| `DELETE /api/activities/{id}` | Delete a ride. |
| `POST /api/activities` (upload) | Upload a ride recorded on the device (see "Sync flow" in §5). |
| `PATCH /api/me` / `PUT /api/me/preferences` | Edit profile, and store unit/appearance preferences server-side. |
| `POST /api/auth/...` | Sign up / sign in / refresh token. |
| `GET /api/devices`, `POST /api/devices` | Pair and manage bike computers. |

---

## 4. Wiring the backend into the app

The screens are already written against an async API, with loading, error and empty states. Switching from mocks to the real backend should only touch `src/api/`.

### Step 1: configure the base URL

Create `BikeComputerApp/.env.local` (git-ignored):

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

Only variables prefixed with `EXPO_PUBLIC_` are embedded in the app bundle. **Never put secrets in them.** Restart `npx expo start` after changing `.env` files.

Which host to use:

| Where the app runs | API URL |
| --- | --- |
| iOS simulator (same Mac as the API) | `http://localhost:<port>` |
| Android emulator | `http://10.0.2.2:<port>` (the emulator's alias for the host machine) |
| Physical phone | `http://<your-computer-LAN-IP>:<port>`, and run the API on `0.0.0.0`, not just `localhost` |
| Production | the deployed `https://` URL |

Tips for the C# side in development:
- The ASP.NET dev HTTPS certificate isn't trusted by simulators or phones. Use the API's **http** launch profile locally, and HTTPS in production.
- CORS only matters for the **web** build. Allow the Expo dev server origin (e.g. `http://localhost:8081`).

### Step 2: replace the mock bodies in `src/api/client.ts`

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,   // once auth exists
      ...init?.headers,
    },
  });

  if (response.status === 404) throw new NotFoundError(path);
  if (!response.ok) {
    // ASP.NET ProblemDetails: { title, status, detail, errors? }
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.detail ?? problem?.title ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const getActivities = () => request<Activity[]>('/api/activities');
export const getActivity = (id: string) => request<Activity>(`/api/activities/${id}`);
export const getProfile = () => request<UserProfile>('/api/me');
```

Then delete `src/data/mock-data.ts` along with its import.

### Step 3: optional, but recommended

- **Runtime validation:** validate responses with a schema library such as `zod`, so a contract mismatch shows up as a clear error instead of `undefined` deep inside the UI.
- **Writes:** for anything that changes data (rename, delete, upload), use TanStack Query `useMutation` and invalidate `queryKeys.activities` on success, so lists refresh automatically.
- **Query defaults:** tune them on the `QueryClient` in `src/app/_layout.tsx`. `staleTime`, `retry` and refetch on app focus via `focusManager` with React Native's `AppState` are the main ones.

---

## 5. Notes for further development

### Open design decision: how rides get from the ESP32 to the backend

This choice drives a lot of the app work, so we should decide it early.

| Option | How it works | App impact |
| --- | --- | --- |
| **A. Bluetooth LE via the phone** | ESP32 → BLE → app → `POST /api/activities` | Needs a BLE library (e.g. `react-native-ble-plx`), which means a **development build** (no Expo Go), Bluetooth permission strings in `app.json`, and pairing/sync UI. Works without Wi‑Fi on the device. |
| **B. Wi‑Fi direct to the backend** | ESP32 joins Wi‑Fi → uploads to the API itself | Simplest app; it just reads from the API. Requires Wi‑Fi credentials provisioned on the device and device authentication on the API. |
| **C. Hybrid** | BLE for setup and Wi‑Fi provisioning, Wi‑Fi for uploads | Combines the best of both; most work. |

Whichever we choose, agree on a **ride file format** between firmware and backend. FIT and GPX are standard formats that other apps (e.g. Strava) can import; a compact custom binary format is easier to write on the ESP32. The backend should compute the summary fields (distance, moving time, elevation, speeds) from the raw track so all clients agree.

### Suggested roadmap

1. **Backend integration:** implement the §3 endpoints and swap `api/client.ts` (see §4).
2. **Authentication:**
   - Sign-in screen plus an auth gate using Expo Router's protected routes / a `(auth)` route group.
   - Store tokens with `expo-secure-store` (Keychain/Keystore), **not** AsyncStorage.
3. **Persist preferences:** save appearance and units locally (e.g. `expo-sqlite/kv-store`), then sync them to `/api/me/preferences`. See the TODO in `src/providers/preferences-provider.tsx`.
4. **Route maps:** add a map to the ride detail screen (`expo-maps` or `react-native-maps`), drawing the polyline from `/activities/{id}/track`. Replace the "Route map coming soon" placeholder in `src/app/activities/[id].tsx`.
5. **Ride detail charts:** speed and elevation over distance. When we need axes, tooltips or scrubbing, adopt a charting library (e.g. `victory-native` or `react-native-gifted-charts`) instead of extending the hand-built `MileageChart`.
6. **Device management and sync UI:** pairing flow, a "Sync now" button, sync status/progress, and firmware version and update prompts on the Profile tab.
7. **Pagination:** infinite scroll on the Activities list (§3).
8. **Pull stats to the server:** use `/api/stats` for the Overview once ride counts are large.
9. **Editing:** rename or delete rides, ride notes, bike/gear tracking.
10. **Polish:**
    - App icon, splash screen and brand colors (`app.json` still has Expo defaults).
    - Set a real `ios.bundleIdentifier` / `android.package` (currently `com.anonymous.BikeComputerApp`).
    - Haptics, skeleton loaders, an accessibility pass (Dynamic Type, VoiceOver labels).
11. **Testing and CI:**
    - Unit-test `utils/` (pure functions, easy to test) with Jest (`jest-expo`); component tests with React Native Testing Library.
    - Run `tsc`, `expo lint` and the tests in GitHub Actions on each PR.
12. **Builds and release:** EAS Build for TestFlight / Play internal testing, and EAS Update for over-the-air JS updates.

### Things to keep in mind

- **Read the SDK 57 docs, not memory:** Expo changes APIs between SDKs. See `AGENTS.md` for the doc links.
- **Expo Go vs. dev builds:** anything with custom native code (BLE, some map libraries) won't run in Expo Go. Once one of those is added, use `npx expo run:ios` / `eas build --profile development`.
- **Native tabs** (`expo-router/unstable-native-tabs`) are still marked unstable. Watch the Expo changelog when upgrading SDKs. Android supports at most 5 tabs.
- **Time zones:** the server stores UTC. The app groups rides by the phone's **local** day/week/month, and weeks start on Monday (`utils/activity-stats.ts`). If the server ever computes period stats, it needs the user's time zone (send it as a query param or store it on the profile).
- **Mock data** (`src/data/mock-data.ts`) is generated relative to "now", so the Overview always has data this week. It's handy for UI work; it could live behind a flag (e.g. `EXPO_PUBLIC_USE_MOCKS=1`) rather than being deleted, if that helps frontend work move ahead of the backend.
