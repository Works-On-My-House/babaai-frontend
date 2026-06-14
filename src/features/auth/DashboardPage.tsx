import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { api } from "../../api/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthContext";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, token, refreshUser } = useAuth();
  const [apiHealth, setApiHealth] = useState<string>(t("dashboard.checking"));

  useEffect(() => {
    api.health().then(
      (res) => setApiHealth(res.status),
      () => setApiHealth(t("dashboard.unreachable")),
    );
  }, [t]);

  useEffect(() => {
    if (token) {
      void refreshUser();
    }
  }, [token, refreshUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
          {t("dashboard.welcome", { name: user?.username ?? "chef" })}
        </h1>
        <p className="mt-1 text-stone-500 dark:text-stone-400">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/70">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("dashboard.profile")}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">{t("dashboard.userId")}</dt>
              <dd className="font-medium text-stone-800 dark:text-stone-200">{user?.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">{t("auth.email")}</dt>
              <dd className="font-medium text-stone-800 dark:text-stone-200">{user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">{t("auth.username")}</dt>
              <dd className="font-medium text-stone-800 dark:text-stone-200">{user?.username}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">{t("dashboard.memberSince")}</dt>
              <dd className="font-medium text-stone-800 dark:text-stone-200">
                {user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">{t("dashboard.apiHealth")}</dt>
              <dd className="font-medium text-stone-800 dark:text-stone-200">{apiHealth}</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:from-stone-900/80 dark:to-stone-800/80">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.pantry")}
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t("dashboard.pantryDesc")}</p>
          </div>
          <Link to="/ingredients" className="mt-6">
            <Button className="w-full sm:w-auto">{t("dashboard.manageIngredients")}</Button>
          </Link>
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-white/60 bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:from-stone-900/80 dark:to-stone-800/80 sm:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.recipeSuggestions")}
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {t("dashboard.recipeSuggestionsDesc")}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/recipes">
              <Button>{t("dashboard.getSuggestions")}</Button>
            </Link>
            <Link to="/recipes/history">
              <Button variant="secondary">{t("dashboard.viewHistory")}</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
