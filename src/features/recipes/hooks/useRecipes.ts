import { useCallback, useEffect, useState } from "react";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { PaginatedRecipes, RecipeListParams } from "@/features/recipes/types/recipe";

export function useRecipes(params: RecipeListParams) {
  const [data, setData] = useState<PaginatedRecipes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await recipeApi.list(params);
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.page_size, params.search, params.category]);

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  return { data, loading, error, refetch: fetchRecipes };
}
