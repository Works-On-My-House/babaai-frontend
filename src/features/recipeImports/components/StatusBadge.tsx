import { useTranslation } from "react-i18next";

import type { RecipeImportStatus } from "@/features/recipeImports/types/recipeImport";

const STATUS_CLASSES: Record<RecipeImportStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

export function StatusBadge({ status }: { status: RecipeImportStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {t(`recipeImports.status.${status}`)}
    </span>
  );
}
