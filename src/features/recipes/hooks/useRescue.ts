import { useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { RescueResponse } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

/**
 * "Use it up" rescue feed (ClickUp 869dtvycn): recipes that consume pantry items about to expire,
 * so the user cooks them before they spoil. Only enabled when authenticated. Saving preferences or
 * editing the pantry should invalidate {@link queryKeys.recipes.rescue} so the feed refreshes.
 */
export function useRescue(enabled: boolean, limit = 5) {
  return useQuery<RescueResponse>({
    queryKey: queryKeys.recipes.rescue(limit),
    queryFn: () => recipeApi.rescue(limit),
    enabled,
  });
}
