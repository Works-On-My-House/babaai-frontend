import { useCallback, useEffect, useState } from "react";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type {
  PaginatedSuggestionHistory,
  SuggestionHistoryParams,
} from "@/features/recipes/types/recipe";

export function useSuggestionHistory(params: SuggestionHistoryParams) {
  const [data, setData] = useState<PaginatedSuggestionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await recipeApi.history(params);
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.page_size, params.from_date, params.to_date]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
