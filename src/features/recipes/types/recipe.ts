import type { BaseEntity, EntityId } from "../../../types/entity";

export interface RecipeIngredient extends BaseEntity {
  product_name: string;
  quantity: number;
  unit: string;
}

/** Per-serving nutrition for a recipe. All macro values may be null when data is unavailable. */
export interface RecipeNutrition {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  complete: boolean;
  servings: number | null;
}

export interface Recipe extends BaseEntity {
  name: string;
  category: string;
  preparation: string;
  ingredients: RecipeIngredient[];
  view_count: number;
  favorite_count: number;
  is_favorite: boolean;
  nutrition?: RecipeNutrition | null;
}

export interface FavoriteResponse {
  recipe_id: EntityId;
  is_favorite: boolean;
  favorite_count: number;
}

/** One pantry line deducted by cooking a recipe. `quantity` is null when the amount is unknown. */
export interface ConsumedLine {
  product_name: string;
  quantity: number | null;
  unit: string;
}

/**
 * Result of marking a recipe as cooked (ClickUp 869dtvyct): the backend deducts the recipe's
 * ingredients from the user's pantry. `consumed` are the deducted lines; `unmatched_ingredients`
 * are recipe ingredients with no pantry match, so the user can adjust those manually.
 */
export interface CookedResponse {
  recipe_id: EntityId;
  recipe_name: string;
  consumed: ConsumedLine[];
  unmatched_ingredients: string[];
}

export interface FavoriteListResponse {
  items: Recipe[];
  total: number;
}

export type DailyPickReason = "ready" | "almost" | "taste" | "popular";

export interface DailyPick {
  recipe: Recipe;
  match_percent: number;
  can_prepare: boolean;
  score: number;
  reasons: DailyPickReason[];
  missing_ingredients: string[];
}

export interface DailyPicksResponse {
  items: DailyPick[];
  generated_for: string;
  message: string | null;
}

/**
 * Reasons a recipe was suggested in the "Today for you" feed.
 * "expiring" is the waste-reduction hero (uses pantry items about to expire).
 */
export type TodayReason = "expiring" | "ready" | "almost" | "taste" | "popular";

export interface TodayItem {
  recipe: Recipe;
  match_percent: number;
  can_prepare: boolean;
  score: number;
  reasons: TodayReason[];
  missing_ingredients: string[];
}

export interface TodaySuggestions {
  generated_for: string;
  items: TodayItem[];
  message: string | null;
}

export interface RecipeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
}

export interface PaginatedRecipes {
  items: Recipe[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type IngredientMatchStatus = "available" | "insufficient" | "missing";

export interface IngredientMatchDetail {
  product_name: string;
  required_quantity: number;
  required_unit: string;
  available_quantity: number | null;
  available_unit: string | null;
  status: IngredientMatchStatus;
}

export interface SuggestionItem {
  recipe_id: EntityId;
  name: string;
  preparation: string;
  match_percent: number;
  ingredients: IngredientMatchDetail[];
  used_ingredients: string[];
  missing_ingredients: string[];
  can_prepare: boolean;
}

export interface AiProposalIngredient {
  product_name: string;
  quantity: number | null;
  unit: string | null;
}

export interface AiRecipeProposal {
  name: string;
  category: string;
  preparation: string;
  steps: string[];
  ingredients: AiProposalIngredient[];
  agent_id: string;
  agent_label: string;
}

export interface SuggestionResponse {
  suggestions: SuggestionItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  message?: string | null;
  ai_proposals?: AiRecipeProposal[];
  ai_message?: string | null;
}

export interface SuggestionRequest {
  min_match_percent?: number;
  limit?: number;
  ingredient_ids?: EntityId[];
  recipe_ids?: EntityId[];
  include_ai?: boolean;
}

export interface HistoryIngredient {
  product_name: string;
  quantity: number | null;
  unit: string | null;
}

export interface SuggestionHistoryItem extends BaseEntity {
  user_id: EntityId;
  recipe_id: EntityId | null;
  recipe_name: string;
  match_percent: number | null;
  used_ingredients: string[];
  missing_ingredients: string[];
  source: "catalog" | "ai";
  agent_label: string | null;
  preparation: string | null;
  ingredients: HistoryIngredient[];
}

export interface PaginatedSuggestionHistory {
  items: SuggestionHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface SuggestionHistoryParams {
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
}
