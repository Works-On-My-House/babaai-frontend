import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { RescueSection } from "@/features/recipes/components/RescueSection";
import type { Recipe, RescueResponse } from "@/features/recipes/types/recipe";

// FavoriteButton (rendered inside each card) reads the auth token.
vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ token: "test-token", user: null }),
}));

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    created_at: "2026-06-21T00:00:00Z",
    updated_at: "2026-06-21T00:00:00Z",
    version: 1,
    name: "Tomato Pasta",
    category: "pasta",
    preparation: "Boil and toss.",
    ingredients: [],
    view_count: 0,
    favorite_count: 0,
    is_favorite: false,
    nutrition: null,
    ...overrides,
  };
}

function makeData(overrides: Partial<RescueResponse> = {}): RescueResponse {
  return {
    generated_for: "2026-06-21",
    expiring_ingredients: ["spinach", "yogurt"],
    message: null,
    items: [
      {
        recipe: makeRecipe({
          id: "r1",
          name: "Spinach Frittata",
          nutrition: {
            calories: 420,
            protein_g: 18,
            carbs_g: 50,
            fat_g: 12,
            complete: true,
            servings: 2,
          },
        }),
        match_percent: 90,
        can_prepare: false,
        rescued_ingredients: ["spinach"],
        missing_ingredients: ["onion"],
      },
      {
        recipe: makeRecipe({ id: "r2", name: "Yogurt Smoothie" }),
        match_percent: 100,
        can_prepare: true,
        rescued_ingredients: ["yogurt"],
        missing_ingredients: [],
      },
    ],
    ...overrides,
  };
}

describe("RescueSection", () => {
  it("renders the urgent heading with the expiring count", () => {
    renderWithProviders(<RescueSection data={makeData()} onOpen={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: /Use it up — 2 items expiring soon/i }),
    ).toBeInTheDocument();
  });

  it("renders the expiring item names as urgent chips and the rescue recipe cards", () => {
    renderWithProviders(<RescueSection data={makeData()} onOpen={vi.fn()} />);

    // Expiring chips (appear in the header strip) — at least once each.
    expect(screen.getAllByText("spinach").length).toBeGreaterThan(0);
    expect(screen.getAllByText("yogurt").length).toBeGreaterThan(0);
    // Rescue recipe cards.
    expect(screen.getByText("Spinach Frittata")).toBeInTheDocument();
    expect(screen.getByText("Yogurt Smoothie")).toBeInTheDocument();
  });

  it("badges which expiring items each recipe rescues plus a ready indicator", () => {
    renderWithProviders(<RescueSection data={makeData()} onOpen={vi.fn()} />);

    // The ready item shows the ready-to-cook indicator.
    expect(screen.getAllByText("Ready to cook").length).toBeGreaterThan(0);
    // The non-ready item shows its missing-ingredient count.
    expect(screen.getByText("1 ingredient missing")).toBeInTheDocument();
  });

  it("calls onOpen with the recipe when a card is activated", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderWithProviders(<RescueSection data={makeData()} onOpen={onOpen} />);

    await user.click(screen.getByText("Spinach Frittata"));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen.mock.calls[0][0]).toMatchObject({ id: "r1" });
  });

  it("hides the section entirely when there are no expiring items", () => {
    const data = makeData({
      expiring_ingredients: [],
      items: [],
      message: "Nothing in your pantry is expiring soon.",
    });
    const { container } = renderWithProviders(<RescueSection data={data} onOpen={vi.fn()} />);

    // Section is not rendered at all.
    expect(container.querySelector("section")).toBeNull();
    expect(screen.queryByText("Nothing in your pantry is expiring soon.")).not.toBeInTheDocument();
  });

  it("renders the message only when the user has expiring items but no matching recipes", () => {
    const data = makeData({
      expiring_ingredients: ["spinach"],
      items: [],
      message: "No catalog recipes use your expiring items.",
    });
    renderWithProviders(<RescueSection data={data} onOpen={vi.fn()} />);

    // Heading + expiring chip still render.
    expect(screen.getByRole("heading", { name: /Use it up/i })).toBeInTheDocument();
    expect(screen.getByText("spinach")).toBeInTheDocument();
    // The backend message is surfaced in place of cards.
    expect(screen.getByText("No catalog recipes use your expiring items.")).toBeInTheDocument();
  });
});
