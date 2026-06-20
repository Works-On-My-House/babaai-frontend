import type { IngredientListParams } from "@/features/ingredients/types/ingredient";
import type { RecipeListParams, SuggestionHistoryParams } from "@/features/recipes/types/recipe";

/**
 * Central query-key factory (PERF-1.6). Using shared keys lets independent components dedupe the
 * same request (e.g. categories fetched by both HomePage and RecipesPage) and lets mutations
 * invalidate precisely.
 */
export const queryKeys = {
  config: {
    public: ["config", "public"] as const,
    inferCategory: (name: string) => ["config", "inferCategory", name] as const,
  },
  recipes: {
    all: ["recipes"] as const,
    categories: ["recipes", "categories"] as const,
    favorites: ["recipes", "favorites"] as const,
    list: (params: RecipeListParams) => ["recipes", "list", params] as const,
    featured: (scope: string) => ["recipes", "featured", scope] as const,
    daily: (limit: number) => ["recipes", "daily", limit] as const,
    today: (limit: number) => ["recipes", "today", limit] as const,
    history: (params: SuggestionHistoryParams) => ["recipes", "history", params] as const,
  },
  preferences: {
    all: ["preferences"] as const,
  },
  ingredients: {
    all: ["ingredients"] as const,
    list: (params: IngredientListParams) => ["ingredients", "list", params] as const,
  },
} as const;
