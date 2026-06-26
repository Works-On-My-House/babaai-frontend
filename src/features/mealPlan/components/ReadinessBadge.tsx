import { useTranslation } from "react-i18next";

import type { MealPlanReadiness } from "@/features/mealPlan/types/mealPlan";

/**
 * Per-slot pantry-readiness badge (ClickUp 869dpd7ju), driven by core readiness fields:
 * match%, canPrepare, and missing count.
 */
export function ReadinessBadge({ readiness }: { readiness: MealPlanReadiness | null }) {
  const { t } = useTranslation();
  if (!readiness) return null;

  if (readiness.can_prepare) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
        {t("mealPlan.readiness.ready")}
      </span>
    );
  }

  const tone =
    readiness.match_percent >= 75
      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
      : "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {t("mealPlan.readiness.missing", { count: readiness.missing_count })}
    </span>
  );
}
