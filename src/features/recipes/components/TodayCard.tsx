import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { NutritionBadge } from "@/features/recipes/components/NutritionBadge";
import { GenerateListButton } from "@/features/shoppingList/components/GenerateListButton";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { Recipe, TodayItem, TodayReason } from "@/features/recipes/types/recipe";

interface TodayCardProps {
  item: TodayItem;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

// "expiring" is the waste-reduction hero and is rendered separately with a standout style.
const SECONDARY_REASON_STYLES: Record<Exclude<TodayReason, "expiring">, string> = {
  ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  almost: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  taste: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
  popular: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200",
};

export function TodayCard({ item, onOpen, onFavoriteChange }: TodayCardProps) {
  const { t } = useTranslation();
  const { recipe } = item;
  const visual = categoryVisual(recipe.category);

  const isExpiring = item.reasons.includes("expiring");
  const secondaryReasons = item.reasons.filter(
    (reason): reason is Exclude<TodayReason, "expiring"> => reason !== "expiring",
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(recipe)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(recipe);
        }
      }}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white/80 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-stone-900/70 ${
        isExpiring
          ? "border-orange-300 ring-1 ring-orange-300/60 dark:border-orange-700/70 dark:ring-orange-800/50"
          : "border-white/60 dark:border-stone-700"
      }`}
    >
      <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${visual.gradient}`}>
        <CategoryIconBadge
          category={recipe.category}
          size="md"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <FavoriteButton
            recipeId={recipe.id}
            isFavorite={recipe.is_favorite}
            favoriteCount={recipe.favorite_count}
            onChange={(isFavorite, favoriteCount) =>
              onFavoriteChange?.(recipe.id, isFavorite, favoriteCount)
            }
          />
        </div>
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          {item.can_prepare ? (
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-semibold text-white">
              {t("today.readyToCook")}
            </span>
          ) : (
            item.match_percent > 0 && (
              <span className="rounded-full bg-stone-900/75 px-2.5 py-0.5 text-xs font-semibold text-white">
                {t("home.matchLabel", { percent: item.match_percent })}
              </span>
            )
          )}
          <NutritionBadge nutrition={recipe.nutrition} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          <TranslatedText text={recipe.name} />
        </h3>

        {item.reasons.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {isExpiring && (
              <li className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                <span aria-hidden>⏰</span>
                {t("today.reasons.expiring")}
              </li>
            )}
            {secondaryReasons.map((reason) => (
              <li
                key={reason}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${SECONDARY_REASON_STYLES[reason]}`}
              >
                {t(`today.reasons.${reason}`)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            {item.can_prepare || item.missing_ingredients.length === 0
              ? t("today.readyToCook")
              : t("home.missingCount", { count: item.missing_ingredients.length })}
          </span>
          <span className="font-medium text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-400">
            {t("home.viewRecipe")} →
          </span>
        </div>

        {!item.can_prepare && item.missing_ingredients.length > 0 && (
          <div className="mt-3">
            <GenerateListButton
              input={{ recipe_id: recipe.id, product_names: item.missing_ingredients }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </article>
  );
}
