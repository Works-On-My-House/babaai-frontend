import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/features/recipeImports/components/StatusBadge";
import { DraftPreview } from "@/features/admin-moderation/components/DraftPreview";
import { OriginalFilePreview } from "@/features/admin-moderation/components/OriginalFilePreview";
import { useApproveImport } from "@/features/admin-moderation/hooks/useApproveImport";
import { useImportDetail } from "@/features/admin-moderation/hooks/useImportDetail";
import { useRejectImport } from "@/features/admin-moderation/hooks/useRejectImport";

interface ImportDetailModalProps {
  importId: string | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Admin review modal (ClickUp 869dtx804): parsed draft on the left, original file on the right,
 * with Approve and Reject (requires a note) actions. Closes on a successful decision.
 */
export function ImportDetailModal({ importId, onClose }: ImportDetailModalProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useImportDetail(importId);
  const approve = useApproveImport();
  const reject = useRejectImport();

  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!importId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [importId, onClose]);

  // Reset the reject panel whenever a different import is opened.
  useEffect(() => {
    setRejecting(false);
    setNote("");
  }, [importId]);

  if (!importId) return null;

  const busy = approve.isPending || reject.isPending;

  function handleApprove() {
    if (!importId) return;
    approve.mutate(importId, { onSuccess: onClose });
  }

  function handleReject() {
    if (!importId || !note.trim()) return;
    reject.mutate({ id: importId, note: note.trim() }, { onSuccess: onClose });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("adminModeration.detail.title")}
    >
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-stone-900/50 backdrop-blur-sm"
        aria-label={t("common.cancel")}
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-5xl animate-slide-up flex-col overflow-hidden rounded-t-3xl border border-white/40 bg-white/95 shadow-2xl shadow-stone-900/20 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/95 sm:rounded-3xl">
        <header className="flex items-start justify-between gap-4 border-b border-stone-200/70 px-6 py-4 dark:border-stone-700">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-stone-900 dark:text-stone-100">
              {data?.original_filename ?? t("adminModeration.detail.title")}
            </h2>
            {data && (
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {t("adminModeration.queue.submittedBy", {
                  name: data.submitter.username,
                  date: formatDate(data.created_at),
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {data && <StatusBadge status={data.status} />}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
              aria-label={t("common.cancel")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex min-h-[16rem] items-center justify-center text-sm text-stone-400">
              {t("common.loading")}
            </div>
          ) : isError || !data ? (
            <div className="flex min-h-[16rem] items-center justify-center px-4 text-center text-sm text-stone-500 dark:text-stone-400">
              {t("adminModeration.detail.loadFailed")}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <DraftPreview draft={data.draft} />
              <OriginalFilePreview
                importId={data.id}
                filename={data.original_filename}
                contentType={data.content_type}
              />
            </div>
          )}
        </div>

        {data && data.status === "pending" && (
          <footer className="border-t border-stone-200/70 px-6 py-4 dark:border-stone-700">
            {rejecting ? (
              <div className="space-y-3">
                <label
                  htmlFor="reject-note"
                  className="text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  {t("adminModeration.detail.rejectNoteLabel")}
                </label>
                <textarea
                  id="reject-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder={t("adminModeration.detail.rejectNotePlaceholder")}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-100"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRejecting(false);
                      setNote("");
                    }}
                    disabled={busy}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button variant="danger" onClick={handleReject} disabled={busy || !note.trim()}>
                    {reject.isPending
                      ? t("adminModeration.detail.rejecting")
                      : t("adminModeration.detail.confirmReject")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button variant="danger" onClick={() => setRejecting(true)} disabled={busy}>
                  {t("adminModeration.detail.reject")}
                </Button>
                <Button onClick={handleApprove} disabled={busy}>
                  {approve.isPending
                    ? t("adminModeration.detail.approving")
                    : t("adminModeration.detail.approve")}
                </Button>
              </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
