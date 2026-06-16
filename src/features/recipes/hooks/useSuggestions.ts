import { useMutation } from "@tanstack/react-query";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { SuggestionRequest, SuggestionResponse } from "@/features/recipes/types/recipe";

/**
 * Suggestion generation is a user-triggered action (POST), so it's a mutation rather than a cached
 * query. `generate` keeps the previous contract: returns the response, or null on error (the error
 * is surfaced via `error`).
 */
export function useSuggestions() {
  const mutation = useMutation({
    mutationFn: (params: SuggestionRequest = {}) => recipeApi.generateSuggestions(params),
  });

  const generate = async (params: SuggestionRequest = {}): Promise<SuggestionResponse | null> => {
    try {
      return await mutation.mutateAsync(params);
    } catch {
      return null;
    }
  };

  return {
    data: mutation.isError ? null : mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : "Failed to generate suggestions"
      : null,
    generate,
  };
}
