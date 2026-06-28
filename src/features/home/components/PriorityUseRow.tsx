import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { expiryLabel } from "@/features/ingredients/lib/expiry";
import { ingredientCategoryVisual } from "@/features/ingredients/lib/ingredientCategoryVisual";
import type { Ingredient } from "@/features/ingredients/types/ingredient";

interface PriorityUseRowProps {
  items: Ingredient[];
}

export function PriorityUseRow({ items }: PriorityUseRowProps) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  const labels = {
    noDate: t("home.priorityUse.noDate"),
    expired: t("home.priorityUse.expired"),
    today: t("home.priorityUse.expiresToday"),
    tomorrow: t("home.priorityUse.expiresTomorrow"),
    inDays: (count: number) => t("home.priorityUse.expiresInDays", { count }),
  };

  return (
    <section className="mt-8" aria-labelledby="priority-use-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="priority-use-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400"
        >
          {t("home.priorityUse.title")}
        </h2>
        <Link
          to="/ingredients"
          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          {t("home.priorityUse.viewAll")} →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.slice(0, 8).map((item) => {
          const visual = ingredientCategoryVisual(item.category);
          const label = expiryLabel(item.expiration_date, labels);
          return (
            <div
              key={item.id}
              className="flex min-w-[140px] shrink-0 flex-col rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/70"
            >
              <span className="text-2xl" aria-hidden>
                {visual.emoji}
              </span>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                <TranslatedText text={item.name} />
              </p>
              <p className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-300">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
