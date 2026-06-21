import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { CookedItButton } from "@/features/recipes/components/CookedItButton";
import { RecipeDetailModal } from "@/features/recipes/components/RecipeDetailModal";
import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { CookedResponse, Recipe } from "@/features/recipes/types/recipe";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// CookedItButton (and RecipeDetailModal) read the auth token.
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

function makeCookedResponse(overrides: Partial<CookedResponse> = {}): CookedResponse {
  return {
    recipe_id: "r1",
    recipe_name: "Tomato Pasta",
    consumed: [
      { product_name: "Pasta", quantity: 200, unit: "g" },
      { product_name: "Tomato", quantity: 4, unit: "" },
    ],
    unmatched_ingredients: [],
    ...overrides,
  };
}

beforeEach(() => {
  toastSuccess.mockClear();
  toastError.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CookedItButton", () => {
  it("renders the 'Cooked it' action", () => {
    renderWithProviders(<CookedItButton recipeId="r1" />);
    expect(screen.getByRole("button", { name: "Cooked it" })).toBeInTheDocument();
  });

  it("posts to markCooked and shows a success toast summarizing the deduction", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(recipeApi, "markCooked").mockResolvedValue(makeCookedResponse());

    renderWithProviders(<CookedItButton recipeId="r1" />);
    await user.click(screen.getByRole("button", { name: "Cooked it" }));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    // MVP sends no servings.
    expect(spy).toHaveBeenCalledWith("r1", undefined);

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1));
    expect(toastSuccess.mock.calls[0][0]).toBe(
      "Cooked! Deducted from pantry: 200 g Pasta, 4 Tomato",
    );
  });

  it("includes a secondary note for ingredients it couldn't auto-deduct", async () => {
    const user = userEvent.setup();
    vi.spyOn(recipeApi, "markCooked").mockResolvedValue(
      makeCookedResponse({ unmatched_ingredients: ["Garlic", "Olive Oil"] }),
    );

    renderWithProviders(<CookedItButton recipeId="r1" />);
    await user.click(screen.getByRole("button", { name: "Cooked it" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1));
    expect(toastSuccess.mock.calls[0][1]).toMatchObject({
      description: "Couldn't auto-deduct: Garlic, Olive Oil",
    });
  });

  it("surfaces the server error detail on failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(recipeApi, "markCooked").mockRejectedValue(new Error("Recipe not found"));

    renderWithProviders(<CookedItButton recipeId="r1" />);
    await user.click(screen.getByRole("button", { name: "Cooked it" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    expect(toastError.mock.calls[0][0]).toBe("Recipe not found");
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("disables and marks the button busy while the request is pending", async () => {
    const user = userEvent.setup();
    let resolve: (value: CookedResponse) => void = () => {};
    vi.spyOn(recipeApi, "markCooked").mockReturnValue(
      new Promise<CookedResponse>((r) => {
        resolve = r;
      }),
    );

    renderWithProviders(<CookedItButton recipeId="r1" />);
    const button = screen.getByRole("button", { name: "Cooked it" });
    await user.click(button);

    await waitFor(() => {
      const pending = screen.getByRole("button", { name: "Cooking…" });
      expect(pending).toBeDisabled();
      expect(pending).toHaveAttribute("aria-busy", "true");
    });

    resolve(makeCookedResponse());
  });
});

describe("RecipeDetailModal — Cooked it integration", () => {
  it("renders the 'Cooked it' button on the recipe detail for authenticated users", () => {
    renderWithProviders(<RecipeDetailModal recipe={makeRecipe()} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Cooked it" })).toBeInTheDocument();
  });
});
