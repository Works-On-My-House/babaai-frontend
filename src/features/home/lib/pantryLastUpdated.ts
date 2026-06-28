import type { Ingredient } from "@/features/ingredients/types/ingredient";

/** Latest `updated_at` across pantry items, or null when the pantry is empty. */
export function pantryLastUpdated(ingredients: Ingredient[]): Date | null {
  if (ingredients.length === 0) return null;
  let latest = 0;
  for (const item of ingredients) {
    const ts = Date.parse(item.updated_at);
    if (!Number.isNaN(ts) && ts > latest) latest = ts;
  }
  return latest > 0 ? new Date(latest) : null;
}
