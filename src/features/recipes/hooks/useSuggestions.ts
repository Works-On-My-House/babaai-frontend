import { useCallback, useState } from "react";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { SuggestionRequest, SuggestionResponse } from "@/features/recipes/types/recipe";

export function useSuggestions() {
  const [data, setData] = useState<SuggestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: SuggestionRequest = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await recipeApi.generateSuggestions(params);
      setData(result);
      return result;
    } catch (err) {
      setData(null);
      const message = err instanceof Error ? err.message : "Failed to generate suggestions";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, generate };
}
