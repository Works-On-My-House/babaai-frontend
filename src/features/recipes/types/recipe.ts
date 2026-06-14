import type { BaseEntity, EntityId } from "../../../types/entity";

export interface RecipeIngredient extends BaseEntity {
  product_name: string;
  quantity: number;
  unit: string;
}

export interface Recipe extends BaseEntity {
  name: string;
  category: string;
  preparation: string;
  ingredients: RecipeIngredient[];
  view_count: number;
  favorite_count: number;
  is_favorite: boolean;
}

export interface FavoriteResponse {
  recipe_id: EntityId;
  is_favorite: boolean;
  favorite_count: number;
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
