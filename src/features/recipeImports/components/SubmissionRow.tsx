import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/features/recipeImports/components/StatusBadge";
import type { RecipeImport } from "@/features/recipeImports/types/recipeImport";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionRow({ item }: { item: RecipeImport }) {
  const { t } = useTranslation();

  return (
    <article className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/70 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
            {item.original_filename}
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {t("recipeImports.submittedOn", { date: formatDate(item.created_at) })}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.review_note && (
        <p className="mt-3 rounded-lg bg-stone-100/80 px-3 py-2 text-sm text-stone-700 dark:bg-stone-800/70 dark:text-stone-300">
          <span className="font-medium">{t("recipeImports.reviewNote")}:</span> {item.review_note}
        </p>
      )}
    </article>
  );
}
