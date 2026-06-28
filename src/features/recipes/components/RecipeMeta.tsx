import { useTranslation } from "react-i18next";

import type { DerivedRecipeMeta, MatchCounts } from "@/features/recipes/lib/recipeMeta";

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-200">
      <span className="text-amber-500" aria-hidden>
        ★
      </span>
      {rating.toFixed(1)}
    </span>
  );
}

export function MatchBadge({ counts }: { counts: MatchCounts }) {
  const { t } = useTranslation();
  const full = counts.have >= counts.total;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur ${
        full
          ? "bg-emerald-500/90 text-white"
          : "bg-stone-900/70 text-white dark:bg-stone-100/90 dark:text-stone-900"
      }`}
    >
      {t("home.matchCount", { have: counts.have, total: counts.total })}
    </span>
  );
}

export function RecipeMetaRow({ meta }: { meta: DerivedRecipeMeta }) {
  const { t } = useTranslation();
  const parts = [
    t("home.meta.minutes", { count: meta.timeMinutes }),
    t(`home.meta.difficulty.${meta.difficulty}`),
  ];
  if (meta.calories != null) {
    parts.push(t("home.meta.kcal", { count: Math.round(meta.calories) }));
  }
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500 dark:text-stone-400">
      {parts.map((part, index) => (
        <span key={part} className="inline-flex items-center gap-1.5">
          {index > 0 && (
            <span aria-hidden className="text-stone-300 dark:text-stone-600">
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}
