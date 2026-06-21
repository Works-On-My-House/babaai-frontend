import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/AuthContext";
import { SubmissionRow } from "@/features/recipeImports/components/SubmissionRow";
import { UploadCard } from "@/features/recipeImports/components/UploadCard";
import { useMySubmissions } from "@/features/recipeImports/hooks/useMySubmissions";

export function SubmitRecipePage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { data, isLoading } = useMySubmissions(!!token);

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 drop-shadow-sm dark:text-stone-50 sm:text-3xl">
          {t("recipeImports.title")}
        </h1>
        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
          {t("recipeImports.subtitle")}
        </p>
      </div>

      <UploadCard />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t("recipeImports.mySubmissions")}
        </h2>

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl border border-white/60 bg-white/60 dark:border-stone-700 dark:bg-stone-900/50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-6 py-12 text-center backdrop-blur-sm dark:border-amber-800/40 dark:bg-stone-900/60">
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              {t("recipeImports.emptyTitle")}
            </h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {t("recipeImports.emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <SubmissionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
