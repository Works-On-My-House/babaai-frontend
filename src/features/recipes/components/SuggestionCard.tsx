import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { IngredientMatchDetail, SuggestionItem } from "@/features/recipes/types/recipe";

interface SuggestionCardProps {
  suggestion: SuggestionItem;
}

function statusLabel(status: IngredientMatchDetail["status"], t: (key: string) => string): string {
  switch (status) {
    case "available":
      return t("recipes.matchStatus.enough");
    case "insufficient":
      return t("recipes.matchStatus.lowStock");
    case "missing":
      return t("recipes.matchStatus.missing");
  }
}

function statusClass(status: IngredientMatchDetail["status"]): string {
  switch (status) {
    case "available":
      return "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40";
    case "insufficient":
      return "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40";
    case "missing":
      return "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/40";
  }
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { t } = useTranslation();
  const matchColor = suggestion.can_prepare
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
    : suggestion.match_percent >= 75
      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
      : "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300";

  return (
    <article className="flex flex-col rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm shadow-stone-900/5 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/70">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            <TranslatedText text={suggestion.name} />
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {suggestion.can_prepare
              ? t("recipes.suggestion.canPrepare")
              : t("recipes.suggestion.missingCount", {
                  count: suggestion.missing_ingredients.length,
                })}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${matchColor}`}>
          {suggestion.match_percent}%
        </span>
      </div>

      <p className="mb-4 line-clamp-3 text-sm text-stone-600 dark:text-stone-400">
        <TranslatedText text={suggestion.preparation} />
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {t("recipes.suggestion.requirements")}
        </p>
        <ul className="space-y-2 text-sm">
          {suggestion.ingredients.map((item) => (
            <li
              key={item.product_name}
              className="rounded-xl border border-stone-100 bg-white/80 px-3 py-2 dark:border-stone-700 dark:bg-stone-800/80"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  <TranslatedText text={item.product_name} />
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(item.status)}`}
                >
                  {statusLabel(item.status, t)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
                <span>
                  {t("recipes.suggestion.required")}: {item.required_quantity} {item.required_unit}
                </span>
                <span>
                  {t("recipes.suggestion.inPantry")}:{" "}
                  {item.available_quantity != null
                    ? `${item.available_quantity} ${item.available_unit ?? item.required_unit}`
                    : t("common.notAvailable")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
