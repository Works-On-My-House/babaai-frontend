import type { BaseEntity, EntityId } from "@/types/entity";

export type ShoppingListItemSource = "manual" | "recipe" | "suggestions" | "meal_plan";

export interface ShoppingListItem extends BaseEntity {
  product_name: string;
  quantity: number | null;
  unit: string | null;
  /** Optional grouping bucket (e.g. ingredient category) for the grouped view. */
  category: string | null;
  checked: boolean;
  source: ShoppingListItemSource;
  /** Recipe this item was generated from, when applicable. */
  recipe_id: EntityId | null;
}

export interface ShoppingList extends BaseEntity {
  name: string;
  items: ShoppingListItem[];
}

/** Lightweight row for the lists index (counts instead of full items). */
export interface ShoppingListSummary extends BaseEntity {
  name: string;
  item_count: number;
  checked_count: number;
}

export interface ShoppingListsResponse {
  items: ShoppingListSummary[];
  total: number;
}

/**
 * Input for generating/appending a shopping list (ClickUp 869dpd7jd). Provide a recipe (backend
 * computes missing vs. pantry), a set of suggestion recipes, and/or explicit product names from a
 * card's `missing_ingredients`. Omit `list_id` to create a new list, or pass it to append.
 */
export interface GenerateShoppingListInput {
  recipe_id?: EntityId;
  recipe_ids?: EntityId[];
  product_names?: string[];
  list_id?: EntityId;
  name?: string;
}

export interface AddShoppingListItemInput {
  product_name: string;
  quantity?: number | null;
  unit?: string | null;
}

export interface UpdateShoppingListItemInput {
  product_name?: string;
  quantity?: number | null;
  unit?: string | null;
  checked?: boolean;
}
