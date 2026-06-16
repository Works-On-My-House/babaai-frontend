import { useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { FavoriteListResponse } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

const EMPTY_FAVORITES: FavoriteListResponse = { items: [], total: 0 };

/**
 * Favorites query (PERF-1.6), only enabled when authenticated. Mutations (favorite toggle) should
 * invalidate {@link queryKeys.recipes.favorites} to refresh this.
 */
export function useFavorites(enabled: boolean) {
  const { data } = useQuery({
    queryKey: queryKeys.recipes.favorites,
    queryFn: recipeApi.favorites,
    enabled,
  });
  return data ?? EMPTY_FAVORITES;
}
