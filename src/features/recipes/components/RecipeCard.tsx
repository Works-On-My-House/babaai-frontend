import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { Recipe } from "@/features/recipes/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  selected?: boolean;
  onSelect?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, selected = false, onSelect }: RecipeCardProps) {
  const { t } = useTranslation();

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(recipe)}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect(recipe);
        }
      }}
      className={`flex flex-col rounded-2xl border p-5 shadow-sm shadow-stone-900/5 backdrop-blur-md transition dark:shadow-black/20 ${
        selected
          ? "border-amber-400 bg-amber-50/80 ring-2 ring-amber-200 dark:border-amber-600 dark:bg-amber-950/40 dark:ring-amber-800"
          : "border-white/60 bg-white/70 hover:border-amber-200/80 dark:border-stone-700 dark:bg-stone-900/70 dark:hover:border-amber-700/50"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          <TranslatedText text={recipe.name} />
        </h3>
        <span className="shrink-0 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
          <TranslatedText text={recipe.category} />
        </span>
      </div>
      <p className="line-clamp-3 flex-1 text-sm text-stone-600 dark:text-stone-400">
        <TranslatedText text={recipe.preparation} />
      </p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t("recipes.requiredIngredients")}
        </p>
        <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
          {recipe.ingredients.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                <TranslatedText text={item.product_name} />
              </span>
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {item.quantity} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {onSelect && (
        <p className="mt-4 text-xs font-medium text-amber-700 dark:text-amber-400">
          {selected ? t("recipes.selectedForFilter") : t("recipes.clickToInclude")}
        </p>
      )}
    </article>
  );
}
