import { useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { TodaySuggestions } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

/**
 * "Today for you" personalized suggestions (ClickUp 869dr0a4d), only enabled when authenticated.
 * Saving preferences should invalidate {@link queryKeys.recipes.today} so the feed re-personalizes.
 */
export function useToday(enabled: boolean, limit = 4) {
  return useQuery<TodaySuggestions>({
    queryKey: queryKeys.recipes.today(limit),
    queryFn: () => recipeApi.today(limit),
    enabled,
  });
}
