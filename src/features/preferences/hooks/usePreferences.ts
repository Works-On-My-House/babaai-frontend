import { useQuery } from "@tanstack/react-query";

import { preferencesApi } from "@/features/preferences/services/preferencesApi";
import type { Preferences } from "@/features/preferences/types/preferences";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Taste-profile query (ClickUp 869dr0a4d), only enabled when authenticated.
 * Mutations should invalidate {@link queryKeys.preferences.all} to refresh this.
 */
export function usePreferences(enabled: boolean) {
  return useQuery<Preferences>({
    queryKey: queryKeys.preferences.all,
    queryFn: preferencesApi.get,
    enabled,
  });
}
