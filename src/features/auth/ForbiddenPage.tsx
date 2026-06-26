import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

/**
 * Friendly 403 view shown when a signed-in user navigates to a page they lack permission for
 * (ClickUp 869dqfawy). Distinct from the login redirect used for unauthenticated users.
 */
export function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        🔒
      </span>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("forbidden.title")}
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">{t("forbidden.description")}</p>
      <Link to="/">
        <Button>{t("forbidden.backHome")}</Button>
      </Link>
    </div>
  );
}
