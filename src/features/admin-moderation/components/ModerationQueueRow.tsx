import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/features/recipeImports/components/StatusBadge";
import type { AdminRecipeImport } from "@/features/admin-moderation/types/adminImport";

interface ModerationQueueRowProps {
  item: AdminRecipeImport;
  onOpen: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ModerationQueueRow({ item, onOpen }: ModerationQueueRowProps) {
  const { t } = useTranslation();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item.id);
        }
      }}
      className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-700 dark:bg-stone-900/70 sm:p-5"
    >
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
          {item.original_filename}
        </h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {t("adminModeration.queue.submittedBy", {
            name: item.submitter.username,
            date: formatDate(item.created_at),
          })}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={item.status} />
        <span className="text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-400" aria-hidden>
          →
        </span>
      </div>
    </article>
  );
}
