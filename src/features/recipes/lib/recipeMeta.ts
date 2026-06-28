import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import type { Recipe, TodayItem } from "@/features/recipes/types/recipe";

/** Stable 32-bit hash from a string so derived meta is deterministic per recipe. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export type Difficulty = "easy" | "intermediate" | "hard";

export interface DerivedRecipeMeta {
  /** 4.1 – 4.9, deterministic per recipe (placeholder until ratings exist). */
  rating: number;
  /** Estimated prep time in minutes (placeholder, derived from complexity). */
  timeMinutes: number;
  difficulty: Difficulty;
  /** Per-serving kcal when nutrition data is present. */
  calories: number | null;
}

/**
 * Derive plausible card meta (rating / time / difficulty) from existing recipe data.
 * These are deterministic placeholders — the data model has no rating/time/difficulty yet.
 */
export function deriveRecipeMeta(recipe: Recipe): DerivedRecipeMeta {
  const hash = hashString(recipe.id || recipe.name);
  const ingredientCount = recipe.ingredients.length;

  const rating = Math.round((4.1 + (hash % 9) / 10) * 10) / 10;

  const timeMinutes = 10 + ingredientCount * 5 + (hash % 3) * 5;

  let difficulty: Difficulty = "easy";
  if (timeMinutes > 45 || ingredientCount >= 9) difficulty = "hard";
  else if (timeMinutes > 25 || ingredientCount >= 5) difficulty = "intermediate";

  return {
    rating,
    timeMinutes,
    difficulty,
    calories: recipe.nutrition?.calories ?? null,
  };
}

export interface MatchCounts {
  have: number;
  total: number;
}

/** "have/total" counts from a guest match (ingredient explorer). */
export function matchCountsFromGuest(match: GuestMatch | null | undefined): MatchCounts | null {
  if (!match || match.total <= 0) return null;
  return { have: match.have, total: match.total };
}

/** "have/total" counts for a personalized "today" suggestion. */
export function matchCountsFromToday(item: TodayItem): MatchCounts | null {
  const total = item.recipe.ingredients.length;
  if (total <= 0) return null;
  const have = Math.max(0, total - item.missing_ingredients.length);
  return { have, total };
}
