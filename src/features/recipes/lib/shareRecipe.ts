import { parsePreparationSteps } from "@/features/recipes/lib/recipeCatalog";
import type { Recipe } from "@/features/recipes/types/recipe";

export type ShareRecipeResult = "shared" | "copied" | "failed";

export function buildRecipeShareText(recipe: Recipe): string {
  const steps = parsePreparationSteps(recipe.preparation);
  const ingredientLines = recipe.ingredients
    .map((item) => `• ${item.product_name} — ${item.quantity} ${item.unit}`)
    .join("\n");
  const stepLines =
    steps.length > 1
      ? steps.map((step, index) => `${index + 1}. ${step}`).join("\n")
      : recipe.preparation;

  return [
    recipe.name,
    recipe.category,
    "",
    ingredientLines,
    "",
    stepLines,
  ].join("\n");
}

export async function shareRecipe(recipe: Recipe): Promise<ShareRecipeResult> {
  const text = buildRecipeShareText(recipe);
  const title = recipe.name;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "failed";
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
