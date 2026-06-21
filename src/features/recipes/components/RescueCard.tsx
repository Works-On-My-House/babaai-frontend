import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { NutritionBadge } from "@/features/recipes/components/NutritionBadge";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { Recipe, RescueItem } from "@/features/recipes/types/recipe";

interface RescueCardProps {
  item: RescueItem;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

/**
 * A single "Use it up" rescue recipe card (ClickUp 869dtvycn). Urgent amber/red accent. Badges
 * which expiring pantry items the recipe rescues plus a ready / match indicator.
 */
export function RescueCard({ item, onOpen, onFavoriteChange }: RescueCardProps) {
  const { t } = useTranslation();
  const { recipe } = item;
  const visual = categoryVisual(recipe.category);

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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-orange-300 bg-white/80 shadow-sm ring-1 ring-orange-300/60 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-orange-700/70 dark:bg-stone-900/70 dark:ring-orange-800/50"
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
              {t("rescue.readyToCook")}
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

        {item.rescued_ingredients.length > 0 && (
          <>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
              {t("rescue.rescuesLabel")}
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {item.rescued_ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
                >
                  <span aria-hidden>⏰</span>
                  <TranslatedText text={ingredient} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            {item.can_prepare || item.missing_ingredients.length === 0
              ? t("rescue.readyToCook")
              : t("home.missingCount", { count: item.missing_ingredients.length })}
          </span>
          <span className="font-medium text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-400">
            {t("rescue.viewRecipe")} →
          </span>
        </div>
      </div>
    </article>
  );
}
