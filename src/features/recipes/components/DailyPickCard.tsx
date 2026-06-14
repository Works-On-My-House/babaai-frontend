import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { DailyPick, Recipe } from "@/features/recipes/types/recipe";

interface DailyPickCardProps {
  pick: DailyPick;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

const REASON_STYLES: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  almost: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  taste: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
  popular: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200",
};

export function DailyPickCard({ pick, onOpen, onFavoriteChange }: DailyPickCardProps) {
  const { t } = useTranslation();
  const { recipe } = pick;
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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-900/70"
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
        {pick.match_percent > 0 && (
          <span className="absolute bottom-2 left-3 rounded-full bg-stone-900/75 px-2.5 py-0.5 text-xs font-semibold text-white">
            {t("home.matchLabel", { percent: pick.match_percent })}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          <TranslatedText text={recipe.name} />
        </h3>

        {pick.reasons.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {pick.reasons.map((reason) => (
              <li
                key={reason}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  REASON_STYLES[reason] ?? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {t(`home.reasons.${reason}`)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            {pick.missing_ingredients.length === 0
              ? t("home.reasons.ready")
              : t("home.missingCount", { count: pick.missing_ingredients.length })}
          </span>
          <span className="font-medium text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-400">
            {t("home.viewRecipe")} →
          </span>
        </div>
      </div>
    </article>
  );
}
