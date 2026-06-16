import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { SuggestionHistoryParams } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

export function useSuggestionHistory(params: SuggestionHistoryParams) {
  const query = useQuery({
    queryKey: queryKeys.recipes.history(params),
    queryFn: () => recipeApi.history(params),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load history"
      : null,
    refetch: query.refetch,
  };
}
