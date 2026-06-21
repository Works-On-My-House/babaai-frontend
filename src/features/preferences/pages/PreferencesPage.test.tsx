import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { PreferencesPage } from "@/features/preferences/pages/PreferencesPage";
import { EMPTY_PREFERENCES, type Preferences } from "@/features/preferences/types/preferences";

const mutate = vi.fn();
let preferencesData: Preferences | undefined;
let isLoading = false;

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ token: "test-token", user: null }),
}));

vi.mock("@/features/preferences/hooks/usePreferences", () => ({
  usePreferences: () => ({ data: preferencesData, isLoading }),
}));

vi.mock("@/features/preferences/hooks/useUpdatePreferences", () => ({
  useUpdatePreferences: () => ({ mutate, isPending: false }),
}));

vi.mock("@/features/recipes/hooks/useCategories", () => ({
  useCategories: () => ["pasta", "salad"],
}));

beforeEach(() => {
  mutate.mockClear();
  isLoading = false;
  preferencesData = {
    ...EMPTY_PREFERENCES,
    preferred_ingredients: ["garlic"],
    dietary_tags: ["vegan"],
  };
});

describe("PreferencesPage", () => {
  it("shows a loading skeleton while preferences are loading", () => {
    isLoading = true;
    const { container } = renderWithProviders(<PreferencesPage />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("hydrates the form from server data and renders the option groups", () => {
    renderWithProviders(<PreferencesPage />);

    // Free-text chip seeded from server data.
    expect(screen.getByText("garlic")).toBeInTheDocument();
    // Category options sourced from useCategories.
    expect(screen.getByRole("button", { name: "pasta" })).toBeInTheDocument();
    // Fixed dietary + allergen options.
    expect(screen.getByRole("button", { name: "Vegan" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Peanuts" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the save button disabled until the draft changes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PreferencesPage />);

    const save = screen.getByRole("button", { name: "Save taste profile" });
    expect(save).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "pasta" }));
    expect(save).toBeEnabled();
  });

  it("submits the edited draft via the update mutation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PreferencesPage />);

    await user.click(screen.getByRole("button", { name: "salad" }));
    await user.click(screen.getByRole("button", { name: "Save taste profile" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const payload = mutate.mock.calls[0][0] as Preferences;
    expect(payload.preferred_categories).toContain("salad");
    expect(payload.preferred_ingredients).toContain("garlic");
    expect(payload.dietary_tags).toContain("vegan");
  });

  it("lets the user add a free-text favorite ingredient", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PreferencesPage />);

    const input = screen.getByLabelText("Favorite ingredients");
    await user.type(input, "basil{Enter}");

    expect(screen.getByText("basil")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save taste profile" }));
    const payload = mutate.mock.calls[0][0] as Preferences;
    expect(payload.preferred_ingredients).toEqual(expect.arrayContaining(["garlic", "basil"]));
  });
});
