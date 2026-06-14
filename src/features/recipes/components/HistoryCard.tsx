import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { HistoryIngredient, SuggestionHistoryItem } from "@/features/recipes/types/recipe";

interface HistoryCardProps {
  item: SuggestionHistoryItem;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatQuantity(ingredient: HistoryIngredient): string | null {
  if (ingredient.quantity == null) return ingredient.unit ?? null;
  const quantity = Number.isInteger(ingredient.quantity)
    ? String(ingredient.quantity)
    : ingredient.quantity.toFixed(1);
  return ingredient.unit ? `${quantity} ${ingredient.unit}` : quantity;
}

export function HistoryCard({ item }: HistoryCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isAi = item.source === "ai";
  const steps = item.preparation
    ? item.preparation.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm backdrop-blur-md ${
        isAi
          ? "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-indigo-50/70 dark:border-violet-800/60 dark:from-violet-950/40 dark:to-indigo-950/30"
          : "border-white/60 bg-white/70 dark:border-stone-700 dark:bg-stone-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            <TranslatedText text={item.recipe_name} />
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{formatDate(item.created_at)}</p>
        </div>
        {isAi ? (
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">
            {item.agent_label
              ? t("recipes.history.aiBy", { agent: item.agent_label })
              : t("recipes.history.aiRecipe")}
          </span>
        ) : (
          item.match_percent != null && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              {t("recipes.history.match", { percent: item.match_percent })}
            </span>
          )
        )}
      </div>

      {isAi ? (
        <div className="mt-3 space-y-3">
          {item.ingredients.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {item.ingredients.map((ingredient) => {
                const quantity = formatQuantity(ingredient);
                return (
                  <li
                    key={`${ingredient.product_name}-${ingredient.unit ?? ""}`}
                    className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-stone-700 dark:bg-stone-800/80 dark:text-stone-200"
                  >
                    <TranslatedText text={ingredient.product_name} />
                    {quantity && <span className="ml-1 font-medium text-violet-700 dark:text-violet-300">· {quantity}</span>}
                  </li>
                );
              })}
            </ul>
          )}

          {steps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="text-xs font-medium text-violet-700 hover:underline dark:text-violet-300"
              >
                {expanded ? t("recipes.history.hideSteps") : t("recipes.history.showSteps")}
              </button>
              {expanded && (
                <ol className="mt-2 space-y-1.5 text-sm text-stone-600 dark:text-stone-400">
                  {steps.map((step, index) => (
                    <li key={index} className="leading-relaxed">
                      <TranslatedText text={step} />
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-400">
          <span>{t("recipes.history.availableCount", { count: item.used_ingredients.length })}</span>
          <span>·</span>
          <span>{t("recipes.history.missingCount", { count: item.missing_ingredients.length })}</span>
        </div>
      )}
    </article>
  );
}
