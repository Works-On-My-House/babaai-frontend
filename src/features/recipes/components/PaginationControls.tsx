import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

interface PaginationControlsProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function PaginationControls({
  page,
  pages,
  total,
  onPageChange,
  label = "items",
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  const showPager = pages > 1;
  const showPageSize = pageSize != null && pageSizeOptions != null && onPageSizeChange != null;

  if (!showPager && !showPageSize) return null;

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {total} {label}
        {showPager ? ` · ${t("common.pageOf", { page, pages })}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {showPageSize && (
          <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
            <span className="whitespace-nowrap">{t("home.showPerPage")}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        {showPager && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
