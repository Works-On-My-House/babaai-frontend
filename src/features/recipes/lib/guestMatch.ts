import type { Recipe } from "@/features/recipes/types/recipe";

export interface GuestMatch {
  percent: number;
  have: number;
  total: number;
}

function tokenMatches(productName: string, token: string): boolean {
  const name = productName.trim().toLowerCase();
  const term = token.trim().toLowerCase();
  if (!name || !term) return false;
  return name.includes(term) || term.includes(name);
}

/**
 * Lightweight, client-side coverage estimate for guests: what share of a
 * recipe's ingredients are covered by the ingredients the visitor typed.
 * This is intentionally name-based only (no quantities) — the full,
 * quantity-aware matching lives behind authentication.
 */
export function guestMatch(recipe: Recipe, ingredientTokens: string[]): GuestMatch {
  const total = recipe.ingredients.length;
  if (total === 0 || ingredientTokens.length === 0) {
    return { percent: 0, have: 0, total };
  }

  const have = recipe.ingredients.filter((ingredient) =>
    ingredientTokens.some((token) => tokenMatches(ingredient.product_name, token)),
  ).length;

  return {
    percent: Math.round((have / total) * 100),
    have,
    total,
  };
}
