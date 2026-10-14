import { useQuery } from '@tanstack/react-query';

import { getActivities, getActivity, getProfile } from '@/api/client';

export const queryKeys = {
  activities: ['activities'] as const,
  activity: (id: string) => ['activities', id] as const,
  profile: ['profile'] as const,
};

export function useActivities() {
  return useQuery({ queryKey: queryKeys.activities, queryFn: getActivities });
}

export function useActivity(id: string) {
  return useQuery({ queryKey: queryKeys.activity(id), queryFn: () => getActivity(id) });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: getProfile });
}
