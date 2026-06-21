import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/renderWithProviders";
import { SubmitRecipePage } from "@/features/recipeImports/pages/SubmitRecipePage";
import type { MyRecipeImports, RecipeImport } from "@/features/recipeImports/types/recipeImport";

const mutate = vi.fn();
let submissions: MyRecipeImports | undefined;
let isLoading = false;

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ token: "test-token", user: null }),
}));

vi.mock("@/features/recipeImports/hooks/useMySubmissions", () => ({
  useMySubmissions: () => ({ data: submissions, isLoading }),
}));

vi.mock("@/features/recipeImports/hooks/useSubmitRecipeImport", () => ({
  useSubmitRecipeImport: () => ({ mutate, isPending: false }),
}));

function makeImport(overrides: Partial<RecipeImport> = {}): RecipeImport {
  return {
    id: "import-1",
    created_at: "2026-06-20T10:00:00Z",
    updated_at: "2026-06-20T10:00:00Z",
    version: 1,
    original_filename: "grandma-stew.json",
    content_type: "application/json",
    size_bytes: 2048,
    status: "pending",
    review_note: null,
    decided_at: null,
    ...overrides,
  };
}

beforeEach(() => {
  mutate.mockClear();
  isLoading = false;
  submissions = { items: [], total: 0 };
});

describe("SubmitRecipePage", () => {
  it("renders the upload form with a labelled file input and the accepted-types hint", () => {
    renderWithProviders(<SubmitRecipePage />);

    expect(screen.getByLabelText("Recipe file")).toBeInTheDocument();
    expect(
      screen.getByText("Upload a recipe file (e.g. JSON or CSV). PDFs and photos are coming soon."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit recipe" })).toBeDisabled();
  });

  it("shows the empty state when there are no submissions", () => {
    renderWithProviders(<SubmitRecipePage />);
    expect(screen.getByText("No submissions yet")).toBeInTheDocument();
  });

  it("renders the submissions list with status badges and a reviewer note", () => {
    submissions = {
      total: 2,
      items: [
        makeImport({ id: "a", original_filename: "soup.json", status: "pending" }),
        makeImport({
          id: "b",
          original_filename: "cake.csv",
          status: "rejected",
          review_note: "Missing ingredient quantities.",
        }),
      ],
    };

    renderWithProviders(<SubmitRecipePage />);

    expect(screen.getByText("soup.json")).toBeInTheDocument();
    expect(screen.getByText("cake.csv")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText(/Missing ingredient quantities\./)).toBeInTheDocument();
  });

  it("calls the submit mutation with the chosen file", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubmitRecipePage />);

    const file = new File(["{}"], "recipe.json", { type: "application/json" });
    const input = screen.getByLabelText("Recipe file") as HTMLInputElement;
    await user.upload(input, file);

    const submit = screen.getByRole("button", { name: "Submit recipe" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toBe(file);
  });
});
