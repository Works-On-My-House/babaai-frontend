import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { MatchBadge, RecipeMetaRow, StarRating } from "@/features/recipes/components/RecipeMeta";
import { GenerateListButton } from "@/features/shoppingList/components/GenerateListButton";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import { deriveRecipeMeta, matchCountsFromToday } from "@/features/recipes/lib/recipeMeta";
import type { Recipe, TodayItem } from "@/features/recipes/types/recipe";

interface TodayCardProps {
  item: TodayItem;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

export function TodayCard({ item, onOpen, onFavoriteChange }: TodayCardProps) {
  const { t } = useTranslation();
  const { recipe } = item;
  const visual = categoryVisual(recipe.category);
  const meta = deriveRecipeMeta(recipe);
  const matchCounts = matchCountsFromToday(item);

  const isExpiring = item.reasons.includes("expiring");

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
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white/80 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-stone-900/70 ${
        isExpiring
          ? "border-orange-300 ring-1 ring-orange-300/60 dark:border-orange-700/70 dark:ring-orange-800/50"
          : "border-stone-200/70 hover:border-amber-300/70 dark:border-stone-700/70 dark:hover:border-amber-600/50"
      }`}
    >
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${visual.gradient}`}>
        <CategoryIconBadge
          category={recipe.category}
          size="xl"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {matchCounts && (
          <span className="absolute left-3 top-3">
            <MatchBadge counts={matchCounts} />
          </span>
        )}
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
        {isExpiring ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            <span aria-hidden>⏰</span>
            {t("today.reasons.expiring")}
          </span>
        ) : (
          item.can_prepare && (
            <span className="absolute bottom-3 left-3 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-semibold text-white">
              {t("today.readyToCook")}
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-stone-900 dark:text-stone-100">
            <TranslatedText text={recipe.name} />
          </h3>
          <span className="mt-0.5 shrink-0">
            <StarRating rating={meta.rating} />
          </span>
        </div>

        <div className="mt-2">
          <RecipeMetaRow meta={meta} />
        </div>

        {!item.can_prepare && item.missing_ingredients.length > 0 && (
          <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
            {t("home.missingCount", { count: item.missing_ingredients.length })}
          </p>
        )}

        {!item.can_prepare && item.missing_ingredients.length > 0 && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
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
