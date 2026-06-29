import { TranslatedText } from "@/components/TranslatedText";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { MatchBadge, RecipeMetaRow, StarRating } from "@/features/recipes/components/RecipeMeta";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import { deriveRecipeMeta, matchCountsFromGuest } from "@/features/recipes/lib/recipeMeta";
import type { Recipe } from "@/features/recipes/types/recipe";

interface RecipeListCardProps {
  recipe: Recipe;
  match?: GuestMatch | null;
  rating?: number;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

export function RecipeListCard({
  recipe,
  match,
  rating = 0,
  onOpen,
  onFavoriteChange,
}: RecipeListCardProps) {
  const visual = categoryVisual(recipe.category);
  const meta = deriveRecipeMeta(recipe);
  const matchCounts = matchCountsFromGuest(match);

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
      className="group flex cursor-pointer gap-4 overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-sm shadow-stone-900/5 backdrop-blur-md transition-all duration-200 hover:border-amber-300/70 hover:shadow-lg hover:shadow-orange-500/10 dark:border-stone-700/70 dark:bg-stone-900/70 dark:shadow-black/30 dark:hover:border-amber-600/50 sm:gap-5 sm:p-5"
    >
      <div
        className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-32 sm:w-32 ${visual.gradient}`}
      >
        <CategoryIconBadge
          category={recipe.category}
          size="lg"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {matchCounts && (
          <span className="absolute left-2 top-2">
            <MatchBadge counts={matchCounts} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                <TranslatedText text={recipe.category} />
              </span>
            </div>
            <h3 className="font-display text-xl font-semibold leading-snug text-stone-900 dark:text-stone-100">
              <TranslatedText text={recipe.name} />
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StarRating rating={rating} />
            <FavoriteButton
              recipeId={recipe.id}
              isFavorite={recipe.is_favorite}
              favoriteCount={recipe.favorite_count}
              onChange={(isFavorite, favoriteCount) =>
                onFavoriteChange?.(recipe.id, isFavorite, favoriteCount)
              }
            />
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          <TranslatedText text={recipe.preparation} />
        </p>

        <div className="mt-auto pt-3">
          <RecipeMetaRow meta={meta} />
        </div>
      </div>
    </article>
  );
}
