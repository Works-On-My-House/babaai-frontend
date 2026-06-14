import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { appEnv } from "@/config/env";
import { Button } from "@/components/ui/Button";
import { HistoryCard } from "@/features/recipes/components/HistoryCard";
import { useSuggestionHistory } from "@/features/recipes/hooks/useSuggestionHistory";
import { useApiMessage } from "@/lib/translation/useApiMessage";

export function SuggestionHistoryPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const params = useMemo(
    () => ({
      page,
      page_size: appEnv.historyPageSize,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [page, fromDate, toDate],
  );

  const { data, loading, error } = useSuggestionHistory(params);
  const translatedError = useApiMessage(error);

  useEffect(() => {
    if (translatedError) toast.error(translatedError);
  }, [translatedError]);

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {t("recipes.history.title")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("recipes.history.subtitle")}
          </p>
        </div>
        <Link to="/recipes">
          <Button variant="secondary">{t("recipes.history.backToRecipes")}</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-stone-700 dark:bg-stone-900/70 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
          {t("recipes.history.from")}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-stone-200 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
          {t("recipes.history.to")}
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-stone-200 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </label>
      </div>

      {loading && (
        <p className="text-sm text-stone-500 dark:text-stone-400">{t("recipes.history.loading")}</p>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-8 text-center dark:border-stone-600 dark:bg-stone-900/50">
          <p className="text-stone-600 dark:text-stone-400">{t("recipes.history.empty")}</p>
          <Link to="/recipes" className="mt-4 inline-block">
            <Button>{t("recipes.generate")}</Button>
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("recipes.history.records", { count: data?.total ?? 0 })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {(data?.pages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("common.previous")}
              </Button>
              <span className="text-sm text-stone-600 dark:text-stone-400">
                {t("common.pageOf", { page, pages: data?.pages ?? 1 })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= (data?.pages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
