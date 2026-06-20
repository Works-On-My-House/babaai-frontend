import { useTranslation } from "react-i18next";

import type { RecipeNutrition } from "@/features/recipes/types/recipe";

interface NutritionPanelProps {
  nutrition: RecipeNutrition | null | undefined;
}

interface MacroRow {
  key: string;
  value: number | null;
  unit: string;
}

/**
 * Per-serving nutrition block for the recipe detail view (ClickUp 869dr0a4d).
 * Hidden entirely when all macro values are null. Shows an "approx." note when complete=false.
 */
export function NutritionPanel({ nutrition }: NutritionPanelProps) {
  const { t } = useTranslation();

  if (!nutrition) return null;

  const { calories, protein_g, carbs_g, fat_g, complete } = nutrition;
  const allNull = calories == null && protein_g == null && carbs_g == null && fat_g == null;
  if (allNull) return null;

  const macros: MacroRow[] = [
    { key: "protein", value: protein_g, unit: "g" },
    { key: "carbs", value: carbs_g, unit: "g" },
    { key: "fat", value: fat_g, unit: "g" },
  ];

  return (
    <section aria-labelledby="nutrition-heading">
      <div className="mb-2 flex items-center justify-between">
        <h3
          id="nutrition-heading"
          className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
        >
          {t("recipes.nutrition.title")}
        </h3>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          {t("recipes.nutrition.perServing")}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/80 px-3 py-2 text-center dark:border-stone-700 dark:bg-stone-800/60">
          <dt className="text-[11px] uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {t("recipes.nutrition.calories")}
          </dt>
          <dd className="mt-0.5 font-semibold text-stone-800 dark:text-stone-100">
            {calories == null
              ? t("common.notAvailable")
              : t("recipes.nutrition.kcalValue", { calories: Math.round(calories) })}
          </dd>
        </div>
        {macros.map((macro) => (
          <div
            key={macro.key}
            className="rounded-xl border border-stone-200/70 bg-stone-50/80 px-3 py-2 text-center dark:border-stone-700 dark:bg-stone-800/60"
          >
            <dt className="text-[11px] uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t(`recipes.nutrition.${macro.key}`)}
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-800 dark:text-stone-100">
              {macro.value == null
                ? t("common.notAvailable")
                : `${Math.round(macro.value)}${macro.unit}`}
            </dd>
          </div>
        ))}
      </dl>

      {!complete && (
        <p className="mt-2 text-[11px] italic text-stone-400 dark:text-stone-500">
          {t("recipes.nutrition.approx")}
        </p>
      )}
    </section>
  );
}
