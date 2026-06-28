import { describe, expect, it } from "vitest";

import { pantryLastUpdated } from "@/features/home/lib/pantryLastUpdated";
import type { Ingredient } from "@/features/ingredients/types/ingredient";

function ingredient(updatedAt: string): Ingredient {
  return {
    id: "1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: updatedAt,
    version: 1,
    name: "Tomato",
    category: "vegetables",
    quantity: 1,
    unit: "kg",
    expiration_date: null,
    notes: null,
    user_id: "u1",
  };
}

describe("pantryLastUpdated", () => {
  it("returns null for an empty pantry", () => {
    expect(pantryLastUpdated([])).toBeNull();
  });

  it("returns the latest updated_at across items", () => {
    const result = pantryLastUpdated([
      ingredient("2026-06-01T10:00:00Z"),
      ingredient("2026-06-10T08:30:00Z"),
      ingredient("2026-06-05T12:00:00Z"),
    ]);
    expect(result?.toISOString()).toBe("2026-06-10T08:30:00.000Z");
  });
});
