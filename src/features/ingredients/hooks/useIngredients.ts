import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ingredientApi } from "@/features/ingredients/services/ingredientApi";
import type { IngredientListParams } from "@/features/ingredients/types/ingredient";
import { queryKeys } from "@/lib/queryKeys";

export function useIngredients(params: IngredientListParams) {
  const query = useQuery({
    queryKey: queryKeys.ingredients.list(params),
    queryFn: () => ingredientApi.list(params),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load ingredients"
      : null,
    // Mutations call this via onSuccess to refresh the active list.
    refetch: query.refetch,
  };
}
