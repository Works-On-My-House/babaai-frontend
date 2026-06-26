import type { BaseEntity, EntityId } from "@/types/entity";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

/** Pantry-readiness for a planned recipe, driven by core readiness fields (ClickUp 869dpd7ju). */
export interface MealPlanReadiness {
  match_percent: number;
  can_prepare: boolean;
  missing_count: number;
}

export interface MealPlanEntry extends BaseEntity {
  /** ISO day (YYYY-MM-DD). */
  date: string;
  slot: MealSlot;
  recipe_id: EntityId;
  recipe_name: string;
  category: string | null;
  readiness: MealPlanReadiness | null;
}

export interface MealPlanWeek {
  /** ISO date of the Monday that starts the week. */
  week_start: string;
  entries: MealPlanEntry[];
}

export interface AssignEntryInput {
  date: string;
  slot: MealSlot;
  recipe_id: EntityId;
}

export interface MoveEntryInput {
  id: EntityId;
  date: string;
  slot: MealSlot;
}
