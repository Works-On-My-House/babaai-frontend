import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { RescueCard } from "@/features/recipes/components/RescueCard";
import type { Recipe, RescueResponse } from "@/features/recipes/types/recipe";
import { useApiMessage } from "@/lib/translation/useApiMessage";

interface RescueSectionProps {
  data: RescueResponse;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

/**
 * "Use it up" rescue section (ClickUp 869dtvycn — the waste-reduction hero). Surfaces recipes that
 * consume pantry items about to expire, with an urgent amber/red accent, placed near the top of the
 * Home page. Renders nothing when the user has no expiring items so the home page stays uncluttered.
 */
export function RescueSection({ data, onOpen, onFavoriteChange }: RescueSectionProps) {
  const { t } = useTranslation();
  const translatedMessage = useApiMessage(data.message ?? null);

  // No expiring pantry items → hide the section entirely (don't clutter the home page).
  if (data.expiring_ingredients.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10 rounded-3xl border border-orange-300/70 bg-gradient-to-br from-amber-50/80 to-rose-50/70 p-6 shadow-sm backdrop-blur-md dark:border-orange-800/50 dark:from-orange-950/30 dark:to-rose-950/20 sm:p-8"
      aria-labelledby="rescue-heading"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>
          ⏰
        </span>
        <div>
          <h2
            id="rescue-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            {t("rescue.title", { count: data.expiring_ingredients.length })}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600 dark:text-stone-400">
            {t("rescue.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
          {t("rescue.expiringLabel")}
        </span>
        {data.expiring_ingredients.map((ingredient) => (
          <span
            key={ingredient}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm"
          >
            <span aria-hidden>⏰</span>
            <TranslatedText text={ingredient} />
          </span>
        ))}
      </div>

      {data.items.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, index) => (
            <div
              key={item.recipe.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RescueCard item={item} onOpen={onOpen} onFavoriteChange={onFavoriteChange} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white/60 p-6 text-center text-sm text-stone-600 dark:border-orange-800/50 dark:bg-stone-900/50 dark:text-stone-400">
          {translatedMessage || t("rescue.noMatches")}
        </p>
      )}
    </section>
  );
}
