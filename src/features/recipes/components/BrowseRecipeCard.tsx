import { TranslatedText } from "@/components/TranslatedText";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { MatchBadge, RecipeMetaRow, StarRating } from "@/features/recipes/components/RecipeMeta";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import { deriveRecipeMeta, matchCountsFromGuest } from "@/features/recipes/lib/recipeMeta";
import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import type { Recipe } from "@/features/recipes/types/recipe";

interface BrowseRecipeCardProps {
  recipe: Recipe;
  match?: GuestMatch | null;
  /** When set, overrides derived placeholder rating (Recipes page uses 0.0). */
  rating?: number;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

export function BrowseRecipeCard({ recipe, match, rating, onOpen, onFavoriteChange }: BrowseRecipeCardProps) {
  const visual = categoryVisual(recipe.category);
  const meta = deriveRecipeMeta(recipe);
  const displayRating = rating ?? meta.rating;
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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 shadow-sm shadow-stone-900/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-xl hover:shadow-orange-500/10 dark:border-stone-700/70 dark:bg-stone-900/70 dark:shadow-black/30 dark:hover:border-amber-600/50"
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
        <span className="absolute bottom-3 left-3 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
          <TranslatedText text={recipe.category} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-stone-900 dark:text-stone-100">
            <TranslatedText text={recipe.name} />
          </h3>
          <span className="mt-0.5 shrink-0">
            <StarRating rating={displayRating} />
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-stone-600 dark:text-stone-400">
          <TranslatedText text={recipe.preparation} />
        </p>
        <div className="mt-3">
          <RecipeMetaRow meta={meta} />
        </div>
      </div>
    </article>
  );
}
