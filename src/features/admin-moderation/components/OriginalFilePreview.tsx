import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useImportFile } from "@/features/admin-moderation/hooks/useImportFile";

interface OriginalFilePreviewProps {
  importId: string;
  filename: string;
  contentType: string;
}

function isText(contentType: string, filename: string): boolean {
  return (
    contentType.startsWith("text/") ||
    contentType.includes("json") ||
    contentType.includes("csv") ||
    /\.(txt|json|csv|md)$/i.test(filename)
  );
}

/**
 * Renders the original uploaded file alongside the parsed draft (ClickUp 869dtx804): inline image
 * for images, scrollable text for text/JSON/CSV, embedded viewer for PDFs, and a download link for
 * everything. The file is fetched as an authenticated blob and exposed via an object URL.
 */
export function OriginalFilePreview({ importId, filename, contentType }: OriginalFilePreviewProps) {
  const { t } = useTranslation();
  const { data: blob, isLoading, isError } = useImportFile(importId);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const textual = useMemo(() => isText(contentType, filename), [contentType, filename]);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    let cancelled = false;
    if (textual) {
      void blob.text().then((value) => {
        if (!cancelled) setText(value);
      });
    }

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
      setObjectUrl(null);
      setText(null);
    };
  }, [blob, textual]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t("adminModeration.detail.originalFile")}
        </h3>
        {objectUrl && (
          <a
            href={objectUrl}
            download={filename}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-200 dark:ring-stone-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            {t("adminModeration.detail.download")}
          </a>
        )}
      </div>

      <div className="min-h-[12rem] flex-1 overflow-hidden rounded-xl border border-stone-200/70 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-900/60">
        {isLoading ? (
          <div className="flex h-full min-h-[12rem] animate-pulse items-center justify-center text-sm text-stone-400">
            {t("common.loading")}
          </div>
        ) : isError ? (
          <div className="flex h-full min-h-[12rem] items-center justify-center px-4 text-center text-sm text-stone-500 dark:text-stone-400">
            {t("adminModeration.detail.fileUnavailable")}
          </div>
        ) : !objectUrl ? null : contentType.startsWith("image/") ? (
          <img src={objectUrl} alt={filename} className="mx-auto max-h-[60vh] w-auto object-contain" />
        ) : contentType.includes("pdf") ? (
          <iframe src={objectUrl} title={filename} className="h-[60vh] w-full" />
        ) : textual ? (
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
            {text}
          </pre>
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center px-4 text-center text-sm text-stone-500 dark:text-stone-400">
            {t("adminModeration.detail.noPreview")}
          </div>
        )}
      </div>
    </div>
  );
}
