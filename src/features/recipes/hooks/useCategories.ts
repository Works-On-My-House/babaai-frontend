import { useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Shared recipe-categories query (PERF-1.6). HomePage and RecipesPage both consume this, so the
 * single shared key dedupes the request and serves it from cache for 5 minutes across navigations.
 */
export function useCategories() {
  const { data } = useQuery({
    queryKey: queryKeys.recipes.categories,
    queryFn: recipeApi.categories,
    staleTime: 5 * 60 * 1000,
  });
  return data ?? EMPTY_CATEGORIES;
}

const EMPTY_CATEGORIES: string[] = [];
