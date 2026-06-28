import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FrostedPanel } from "@/components/FrostedPanel";
import type { PantryStats } from "@/features/home/lib/pantryStats";

interface PantryHealthCardProps {
  stats: PantryStats | null;
}

export function PantryHealthCard({ stats }: PantryHealthCardProps) {
  const { t } = useTranslation();
  const total = stats?.total ?? 0;
  const freshPercent = stats?.freshPercent ?? 100;
  const expiring48h = stats?.expiring48h ?? 0;

  return (
    <FrostedPanel className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {t("home.pantryHealth.title")}
          </p>
          <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t("home.pantryHealth.items", { count: total })}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
          {t("home.pantryHealth.freshPercent", { percent: freshPercent })}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${freshPercent}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
        {expiring48h > 0
          ? t("home.pantryHealth.expiring48h", { count: expiring48h })
          : t("home.pantryHealth.noExpiring48h")}
      </p>

      <Link
        to="/ingredients"
        className="mt-auto pt-4 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
      >
        {t("home.pantryHealth.openPantry")} →
      </Link>
    </FrostedPanel>
  );
}
