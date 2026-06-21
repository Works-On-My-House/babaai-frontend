import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { TodaySection } from "@/features/recipes/components/TodaySection";
import type { Recipe, TodaySuggestions } from "@/features/recipes/types/recipe";

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

function makeData(overrides: Partial<TodaySuggestions> = {}): TodaySuggestions {
  return {
    generated_for: "2026-06-21",
    message: null,
    items: [
      {
        recipe: makeRecipe({
          id: "r1",
          name: "Use-It-Up Stir Fry",
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
        score: 0.9,
        reasons: ["expiring", "almost"],
        missing_ingredients: ["soy sauce"],
      },
      {
        recipe: makeRecipe({ id: "r2", name: "Ready Omelette" }),
        match_percent: 100,
        can_prepare: true,
        score: 1,
        reasons: ["ready", "taste"],
        missing_ingredients: [],
      },
    ],
    ...overrides,
  };
}

describe("TodaySection", () => {
  it("renders the section heading and a personalize link to /preferences", () => {
    renderWithProviders(<TodaySection data={makeData()} onOpen={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Today for you" })).toBeInTheDocument();
    const personalize = screen.getByRole("link", { name: /Personalize/i });
    expect(personalize).toHaveAttribute("href", "/preferences");
  });

  it("shows the standout 'Use it up' expiring badge", () => {
    renderWithProviders(<TodaySection data={makeData()} onOpen={vi.fn()} />);
    expect(screen.getByText("Use it up")).toBeInTheDocument();
  });

  it("shows 'Ready to cook' for preparable items and a missing-ingredient count otherwise", () => {
    renderWithProviders(<TodaySection data={makeData()} onOpen={vi.fn()} />);

    // Ready item shows the ready indicator.
    expect(screen.getAllByText("Ready to cook").length).toBeGreaterThan(0);
    // Non-ready item shows the missing count.
    expect(screen.getByText("1 ingredient missing")).toBeInTheDocument();
  });

  it("renders a per-serving kcal badge when nutrition calories are present", () => {
    renderWithProviders(<TodaySection data={makeData()} onOpen={vi.fn()} />);
    expect(screen.getByText("420 kcal")).toBeInTheDocument();
  });

  it("calls onOpen with the recipe when a card is activated", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderWithProviders(<TodaySection data={makeData()} onOpen={onOpen} />);

    await user.click(screen.getByText("Use-It-Up Stir Fry"));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen.mock.calls[0][0]).toMatchObject({ id: "r1" });
  });

  it("renders the empty-state message when there are no items", () => {
    const data = makeData({ items: [], message: "Your pantry is empty — add ingredients." });
    renderWithProviders(<TodaySection data={data} onOpen={vi.fn()} />);

    expect(screen.getByText("Your pantry is empty — add ingredients.")).toBeInTheDocument();
    expect(screen.queryByText("Use-It-Up Stir Fry")).not.toBeInTheDocument();
  });
});
