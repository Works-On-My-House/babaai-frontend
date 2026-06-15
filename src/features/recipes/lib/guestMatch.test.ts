import { describe, expect, it } from "vitest";

import { guestMatch } from "@/features/recipes/lib/guestMatch";
import type { Recipe } from "@/features/recipes/types/recipe";

function recipe(ingredientNames: string[]): Recipe {
  const now = "2026-01-01T00:00:00Z";
  return {
    id: "recipe-1",
    created_at: now,
    updated_at: now,
    version: 1,
    name: "Test Recipe",
    category: "Main",
    preparation: "Mix and serve",
    view_count: 0,
    favorite_count: 0,
    is_favorite: false,
    ingredients: ingredientNames.map((name, index) => ({
      id: `ingredient-${index}`,
      created_at: now,
      updated_at: now,
      version: 1,
      product_name: name,
      quantity: 1,
      unit: "pcs",
    })),
  };
}

describe("guestMatch", () => {
  it("returns zero coverage when pantry tokens are empty", () => {
    const result = guestMatch(recipe(["egg", "milk"]), []);
    expect(result).toEqual({ percent: 0, have: 0, total: 2 });
  });

  it("matches ingredient names case-insensitively", () => {
    const result = guestMatch(recipe(["Egg", "Milk", "Flour"]), ["egg", "flour"]);
    expect(result).toEqual({ percent: 67, have: 2, total: 3 });
  });

  it("returns full coverage when all ingredients match", () => {
    const result = guestMatch(recipe(["Tomato", "Basil"]), ["tomato", "basil"]);
    expect(result).toEqual({ percent: 100, have: 2, total: 2 });
  });
});
