import { useTranslation } from "react-i18next";

/**
 * Upsell shown to non-premium users on the meal planner (ClickUp 869dpd7ju). The route is reachable
 * but the planner is gated; entitlement is authoritative server-side, this is UX only.
 */
export function PremiumUpsell() {
  const { t } = useTranslation();

  const benefits = [
    t("mealPlan.upsell.benefit1"),
    t("mealPlan.upsell.benefit2"),
    t("mealPlan.upsell.benefit3"),
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-white p-8 text-center shadow-sm dark:border-amber-800/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-stone-900/60 sm:p-12">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
        ✨ {t("mealPlan.upsell.badge")}
      </span>
      <h2 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">
        {t("mealPlan.upsell.title")}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-stone-300">
        {t("mealPlan.upsell.subtitle")}
      </p>

      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-200">
            <span className="mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden>
              ✓
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-8 inline-flex flex-col items-center gap-2">
        <span className="cursor-not-allowed rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white opacity-90 shadow-md">
          {t("mealPlan.upsell.cta")}
        </span>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {t("mealPlan.upsell.comingSoon")}
        </span>
      </div>
    </div>
  );
}
