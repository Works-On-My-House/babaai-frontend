import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { RecipeDraft } from "@/features/admin-moderation/types/adminImport";

/**
 * Renders the extracted recipe draft (name/category/ingredients/steps) for an admin to review
 * against the original file before approving (ClickUp 869dtx804).
 */
export function DraftPreview({ draft }: { draft: RecipeDraft | null }) {
  const { t } = useTranslation();

  if (!draft) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-stone-300/70 bg-stone-50/60 px-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-400">
        {t("adminModeration.detail.noDraft")}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t("adminModeration.detail.parsedDraft")}
        </h3>
        <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">
          <TranslatedText text={draft.name} />
        </p>
        {draft.category && (
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <TranslatedText text={draft.category} />
          </span>
        )}
      </div>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t("adminModeration.detail.ingredients")}
        </h4>
        {draft.ingredients.length === 0 ? (
          <p className="text-sm text-stone-400">{t("adminModeration.detail.noIngredients")}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {draft.ingredients.map((item, index) => (
              <li
                key={`${item.product_name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/80 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
              >
                <span className="text-stone-700 dark:text-stone-200">
                  <TranslatedText text={item.product_name} />
                </span>
                {(item.quantity != null || item.unit) && (
                  <span className="shrink-0 font-medium text-stone-500 dark:text-stone-400">
                    {item.quantity ?? ""} {item.unit ?? ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t("adminModeration.detail.steps")}
        </h4>
        {draft.steps.length === 0 ? (
          <p className="text-sm text-stone-400">{t("adminModeration.detail.noSteps")}</p>
        ) : (
          <ol className="space-y-2">
            {draft.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-stone-700 dark:text-stone-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                  {index + 1}
                </span>
                <span className="leading-relaxed">
                  <TranslatedText text={step} />
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
