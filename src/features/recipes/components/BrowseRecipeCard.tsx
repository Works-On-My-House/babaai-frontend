import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import type { Recipe } from "@/features/recipes/types/recipe";

interface BrowseRecipeCardProps {
  recipe: Recipe;
  match?: GuestMatch | null;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

function matchTone(percent: number): string {
  if (percent >= 100) return "bg-emerald-500 text-white";
  if (percent >= 60) return "bg-amber-500 text-white";
  return "bg-stone-500/80 text-white";
}

export function BrowseRecipeCard({ recipe, match, onOpen, onFavoriteChange }: BrowseRecipeCardProps) {
  const { t } = useTranslation();
  const visual = categoryVisual(recipe.category);
  const showMatch = match != null && match.total > 0 && match.have > 0;

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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm shadow-stone-900/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-amber-200/80 hover:shadow-lg hover:shadow-orange-500/10 dark:border-stone-700 dark:bg-stone-900/70 dark:shadow-black/20 dark:hover:border-amber-700/50"
    >
      <div
        className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${visual.gradient}`}
      >
        <CategoryIconBadge
          category={recipe.category}
          size="lg"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
          <TranslatedText text={recipe.category} />
        </span>
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
        {showMatch && (
          <span
            className={`absolute bottom-2 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow ${matchTone(
              match!.percent,
            )}`}
          >
            {t("home.matchLabel", { percent: match!.percent })}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          <TranslatedText text={recipe.name} />
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-stone-600 dark:text-stone-400">
          <TranslatedText text={recipe.preparation} />
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>{t("home.ingredientsCount", { count: recipe.ingredients.length })}</span>
          <span className="font-medium text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-400">
            {t("home.viewRecipe")} →
          </span>
        </div>
      </div>
    </article>
  );
}
