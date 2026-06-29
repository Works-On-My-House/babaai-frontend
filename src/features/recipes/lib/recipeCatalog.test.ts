import { describe, expect, it } from "vitest";

import { filterRecipes, parsePreparationSteps, sortRecipes } from "@/features/recipes/lib/recipeCatalog";
import type { Recipe } from "@/features/recipes/types/recipe";

function recipe(overrides: Partial<Recipe> = {}): Recipe {
  const now = "2026-01-01T00:00:00Z";
  return {
    id: "r1",
    created_at: now,
    updated_at: now,
    version: 1,
    name: "Alpha",
    category: "Dinner",
    preparation: "1. Mix\n2. Bake",
    ingredients: [
      {
        id: "i1",
        created_at: now,
        updated_at: now,
        version: 1,
        product_name: "Flour",
        quantity: 1,
        unit: "cup",
      },
    ],
    view_count: 0,
    favorite_count: 0,
    is_favorite: false,
    nutrition: { calories: 500, protein_g: null, carbs_g: null, fat_g: null, complete: false, servings: 1 },
    ...overrides,
  };
}

describe("parsePreparationSteps", () => {
  it("splits numbered newline steps", () => {
    expect(parsePreparationSteps("1. Mix\n2. Bake")).toEqual(["Mix", "Bake"]);
  });

  it("returns a single block when no steps are detected", () => {
    expect(parsePreparationSteps("Stir and serve.")).toEqual(["Stir and serve."]);
  });
});

describe("filterRecipes", () => {
  it("filters by difficulty placeholder meta", () => {
    const now = "2026-01-01T00:00:00Z";
    const easy = recipe({ id: "easy" });
    const hard = recipe({
      id: "hard",
      ingredients: Array.from({ length: 10 }, (_, index) => ({
        id: `i${index}`,
        created_at: now,
        updated_at: now,
        version: 1,
        product_name: `Item ${index}`,
        quantity: 1,
        unit: "x",
      })),
    });
    const result = filterRecipes([easy, hard], { difficulty: "easy", time: "", calories: "" });
    expect(result.map((item) => item.id)).toEqual(["easy"]);
  });
});

describe("sortRecipes", () => {
  it("sorts by name ascending", () => {
    const items = [recipe({ id: "b", name: "Bravo" }), recipe({ id: "a", name: "Alpha" })];
    const sorted = sortRecipes(items, "name_asc", null);
    expect(sorted.map((item) => item.name)).toEqual(["Alpha", "Bravo"]);
  });
});
