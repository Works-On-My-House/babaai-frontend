import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TodayCard } from "@/features/recipes/components/TodayCard";
import type { Recipe, TodaySuggestions } from "@/features/recipes/types/recipe";
import { useApiMessage } from "@/lib/translation/useApiMessage";

interface TodaySectionProps {
  data: TodaySuggestions;
  onOpen: (recipe: Recipe) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

/**
 * "Today for you" daily personalized suggestions (ClickUp 869dr0a4d). Rendered at the top of the
 * home page for authenticated users. Surfaces the waste-reduction "Use it up" hero via TodayCard.
 */
export function TodaySection({ data, onOpen, onFavoriteChange }: TodaySectionProps) {
  const { t } = useTranslation();
  const translatedMessage = useApiMessage(data.message ?? null);

  return (
    <section className="mt-10" aria-labelledby="today-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="today-heading" className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {t("today.title")}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("today.subtitle")}</p>
        </div>
        <Link
          to="/preferences"
          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          {t("today.personalize")} →
        </Link>
      </div>

      {data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, index) => (
            <div
              key={item.recipe.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TodayCard item={item} onOpen={onOpen} onFavoriteChange={onFavoriteChange} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-6 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
          <p>{translatedMessage || t("today.empty")}</p>
          <Link
            to="/ingredients"
            className="mt-1 inline-block font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            {t("nav.pantry")}
          </Link>
        </div>
      )}
    </section>
  );
}
