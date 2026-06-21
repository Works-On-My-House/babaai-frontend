import { useTranslation } from "react-i18next";

import type { RecipeNutrition } from "@/features/recipes/types/recipe";

interface NutritionBadgeProps {
  nutrition: RecipeNutrition | null | undefined;
  className?: string;
}

/** Compact per-serving kcal badge for recipe cards. Renders nothing when calories are unknown. */
export function NutritionBadge({ nutrition, className = "" }: NutritionBadgeProps) {
  const { t } = useTranslation();

  if (!nutrition || nutrition.calories == null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-stone-900/75 px-2.5 py-0.5 text-xs font-semibold text-white ${className}`}
      title={t("recipes.nutrition.perServing")}
    >
      <span aria-hidden>🔥</span>
      {t("recipes.nutrition.kcalBadge", { calories: Math.round(nutrition.calories) })}
    </span>
  );
}
