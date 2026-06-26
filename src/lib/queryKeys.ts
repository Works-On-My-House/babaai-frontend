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
    rescue: (limit: number) => ["recipes", "rescue", limit] as const,
    history: (params: SuggestionHistoryParams) => ["recipes", "history", params] as const,
  },
  preferences: {
    all: ["preferences"] as const,
  },
  ingredients: {
    all: ["ingredients"] as const,
    list: (params: IngredientListParams) => ["ingredients", "list", params] as const,
  },
  recipeImports: {
    all: ["recipeImports"] as const,
    mine: ["recipeImports", "mine"] as const,
  },
  adminImports: {
    all: ["adminImports"] as const,
    pending: ["adminImports", "pending"] as const,
    detail: (id: string) => ["adminImports", "detail", id] as const,
    file: (id: string) => ["adminImports", "file", id] as const,
  },
  shoppingLists: {
    all: ["shoppingLists"] as const,
    list: ["shoppingLists", "list"] as const,
    detail: (id: string) => ["shoppingLists", "detail", id] as const,
  },
  mealPlan: {
    all: ["mealPlan"] as const,
    week: (weekStart: string) => ["mealPlan", "week", weekStart] as const,
  },
} as const;
