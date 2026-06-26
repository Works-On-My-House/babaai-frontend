import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ImportDetailModal } from "@/features/admin-moderation/components/ImportDetailModal";
import { ModerationQueueRow } from "@/features/admin-moderation/components/ModerationQueueRow";
import { usePendingImports } from "@/features/admin-moderation/hooks/usePendingImports";
import { PERMISSIONS } from "@/features/auth/permissions";
import { usePermissions } from "@/features/auth/usePermissions";

/**
 * Admin moderation queue (ClickUp 869dtx804). Lists global PENDING imports; clicking a row opens
 * the detail modal for review + approve/reject. The whole page is also route-guarded by
 * RECIPE_MODERATE, but we gate the query too so non-moderators never trigger a 403.
 */
export function ModerationQueuePage() {
  const { t } = useTranslation();
  const { has } = usePermissions();
  const canModerate = has(PERMISSIONS.RECIPE_MODERATE);
  const { data, isLoading } = usePendingImports(canModerate);
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 drop-shadow-sm dark:text-stone-50 sm:text-3xl">
          {t("adminModeration.title")}
        </h1>
        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
          {t("adminModeration.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl border border-white/60 bg-white/60 dark:border-stone-700 dark:bg-stone-900/50"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-6 py-12 text-center backdrop-blur-sm dark:border-amber-800/40 dark:bg-stone-900/60">
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            {t("adminModeration.emptyTitle")}
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("adminModeration.emptyDesc")}
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("adminModeration.queue.count", { count: items.length })}
          </p>
          {items.map((item) => (
            <ModerationQueueRow key={item.id} item={item} onOpen={setActiveId} />
          ))}
        </section>
      )}

      <ImportDetailModal importId={activeId} onClose={() => setActiveId(null)} />
    </div>
  );
}
