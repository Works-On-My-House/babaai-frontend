import type { BaseEntity, EntityId } from "../../../types/entity";

export interface Ingredient extends BaseEntity {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date: string | null;
  notes: string | null;
  user_id: EntityId;
}

export interface PaginatedIngredients {
  items: Ingredient[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface IngredientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  sort_by?: IngredientSortField;
  sort_order?: SortOrder;
}

export type IngredientSortField = "name" | "expiration_date" | "quantity" | "created_at";
export type SortOrder = "asc" | "desc";

export interface IngredientCreatePayload {
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  expiration_date?: string | null;
  notes?: string | null;
}

export type IngredientUpdatePayload = Partial<IngredientCreatePayload>;
