import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { RecipeListParams } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

export function useRecipes(params: RecipeListParams) {
  const query = useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => recipeApi.list(params),
    // Keep showing the previous page while the next loads (smooth pagination).
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load recipes"
      : null,
    refetch: query.refetch,
  };
}
