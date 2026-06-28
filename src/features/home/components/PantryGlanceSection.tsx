import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { FrostedPanel } from "@/components/FrostedPanel";
import { TranslatedText } from "@/components/TranslatedText";
import {
  buildCategoryBreakdown,
  buildCoverageBreakdown,
  buildExpiryBreakdown,
  downloadPantryPdf,
  PantryExportError,
  printPantryReport,
  type PantryExportLabels,
  type PantryReportPayload,
} from "@/features/home/lib/exportPantryReport";
import { ingredientCategoryVisual } from "@/features/ingredients/lib/ingredientCategoryVisual";
import type { PantryStats, RecipeCoverage } from "@/features/home/lib/pantryStats";

const DONUT_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

function DonutChart({ slices, size = 100 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="mx-auto" role="img" aria-hidden>
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-stone-200 dark:text-stone-700" />
      </svg>
    );
  }

  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="mx-auto" role="img" aria-hidden>
      {slices.map((slice, i) => {
        const fraction = slice.value / total;
        const dash = fraction * circumference;
        const offset = circumference * (1 - cumulative);
        cumulative += fraction;
        return (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        );
      })}
      <circle cx="50" cy="50" r="26" className="fill-white dark:fill-stone-900" />
    </svg>
  );
}

function BarChart({ bars, description }: { bars: { label: string; count: number; color: string }[]; description: string }) {
  const max = Math.max(...bars.map((b) => b.count), 1);
  return (
    <div role="img" aria-label={description}>
      <div className="flex h-24 items-end justify-between gap-2" aria-hidden>
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max((bar.count / max) * 100, bar.count > 0 ? 8 : 0)}%`,
                  backgroundColor: bar.color,
                  minHeight: bar.count > 0 ? 4 : 0,
                }}
              />
            </div>
            <span className="text-center text-[10px] font-medium text-stone-500 dark:text-stone-400">
              {bar.label}
            </span>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{bar.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PantryGlanceSectionProps {
  stats: PantryStats;
  coverage: RecipeCoverage;
  lastUpdated: Date | null;
}

function buildLabels(
  t: (key: string, options?: Record<string, unknown>) => string,
  stats: PantryStats,
  coverage: RecipeCoverage,
  attentionCount: number,
): PantryExportLabels {
  const windowLabels = {
    today: t("home.glance.expiryWindows.today"),
    oneTwo: t("home.glance.expiryWindows.oneTwo"),
    threeSeven: t("home.glance.expiryWindows.threeSeven"),
    eightPlus: t("home.glance.expiryWindows.eightPlus"),
  };

  const ready = t("home.glance.ready");
  const oneAway = t("home.glance.oneAway");
  const other = t("home.glance.other");

  return {
    title: t("home.glance.title"),
    totalItems: t("home.glance.export.totalItems"),
    fresh: t("home.glance.export.fresh"),
    expiring48h: t("home.glance.export.expiring48h"),
    expiryWindows: t("home.glance.expiringSoon"),
    categories: t("home.glance.categoryBreakdown"),
    recipeCoverage: t("home.glance.recipeCoverage"),
    ready,
    oneAway,
    other,
    snapshotAt: t("home.glance.export.snapshotAt"),
    lastUpdated: t("home.glance.export.lastUpdated"),
    generatedBy: t("home.glance.export.generatedBy"),
    windowLabels,
    expiryChartDesc: t("home.glance.export.expiryChartDesc", {
      breakdown: buildExpiryBreakdown(stats, windowLabels),
    }),
    categoryChartDesc: t("home.glance.export.categoryChartDesc", {
      total: stats.total,
      breakdown: buildCategoryBreakdown(stats),
    }),
    coverageChartDesc: t("home.glance.export.coverageChartDesc", {
      breakdown: buildCoverageBreakdown(coverage, { ready, oneAway, other }),
    }),
    attentionNote:
      attentionCount > 0 ? t("home.glance.attentionNote", { count: attentionCount }) : null,
  };
}

export function PantryGlanceSection({ stats, coverage, lastUpdated }: PantryGlanceSectionProps) {
  const { t, i18n } = useTranslation();
  const [busyAction, setBusyAction] = useState<"download" | "print" | null>(null);

  const attentionCount = stats.expiryWindows
    .slice(0, 3)
    .reduce((sum, w) => sum + w.count, 0);

  const exportLabels = useMemo(
    () => buildLabels(t, stats, coverage, attentionCount),
    [t, stats, coverage, attentionCount],
  );

  const reportPayload = useMemo(
    (): PantryReportPayload => ({
      stats,
      coverage,
      labels: exportLabels,
      timestamps: { snapshotAt: new Date(), lastUpdated },
      locale: i18n.language,
    }),
    [stats, coverage, exportLabels, lastUpdated, i18n.language],
  );

  const runExport = useCallback(
    async (action: "download" | "print") => {
      if (busyAction) return;

      setBusyAction(action);
      const toastId = toast.loading(t("home.glance.export.generating"));

      const payload: PantryReportPayload = {
        ...reportPayload,
        timestamps: { snapshotAt: new Date(), lastUpdated },
      };

      try {
        if (action === "download") {
          await downloadPantryPdf(payload);
          toast.success(t("home.glance.export.successDownload"), { id: toastId });
        } else {
          await printPantryReport(payload);
          toast.success(t("home.glance.export.successPrint"), { id: toastId });
        }
      } catch (error) {
        const message =
          error instanceof PantryExportError && error.code === "POPUP_BLOCKED"
            ? t("home.glance.export.popupBlocked")
            : t("home.glance.export.failed");
        toast.error(message, { id: toastId });
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, lastUpdated, reportPayload, t],
  );

  if (stats.total === 0) return null;

  const expiryBars = stats.expiryWindows.map((w, i) => ({
    label: t(`home.glance.expiryWindows.${w.label}`),
    count: w.count,
    color: ["#ef4444", "#f97316", "#f59e0b", "#10b981"][i] ?? "#64748b",
  }));

  const categorySlices: DonutSlice[] = stats.byCategory.slice(0, 6).map((c, i) => ({
    value: c.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
    label: c.category,
  }));

  const coverageSlices: DonutSlice[] = [
    { value: coverage.ready, color: "#10b981", label: t("home.glance.ready") },
    { value: coverage.oneAway, color: "#f59e0b", label: t("home.glance.oneAway") },
    { value: coverage.other, color: "#94a3b8", label: t("home.glance.other") },
  ].filter((s) => s.value > 0);

  return (
    <section className="mt-12" aria-labelledby="pantry-glance-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="pantry-glance-heading"
          className="font-display text-2xl font-semibold italic text-stone-900 dark:text-stone-100"
        >
          {t("home.glance.title")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void runExport("download")}
            className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
            aria-busy={busyAction === "download"}
          >
            {busyAction === "download" ? t("home.glance.export.generating") : t("home.glance.exportPdf")}
          </button>
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void runExport("print")}
            className="rounded-lg border border-stone-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-200 dark:hover:bg-stone-800"
            aria-busy={busyAction === "print"}
          >
            {busyAction === "print" ? t("home.glance.export.generating") : t("home.glance.export.print")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FrostedPanel className="p-5">
          <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            {t("home.glance.expiringSoon")}
          </h3>
          <div className="mt-4">
            <BarChart bars={expiryBars} description={exportLabels.expiryChartDesc} />
          </div>
          {attentionCount > 0 && (
            <p className="mt-3 text-xs text-orange-700 dark:text-orange-300">
              {t("home.glance.attentionNote", { count: attentionCount })}
            </p>
          )}
        </FrostedPanel>

        <FrostedPanel className="p-5">
          <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            {t("home.glance.categoryBreakdown")}
          </h3>
          <div className="mt-3 flex items-center gap-4">
            <DonutChart slices={categorySlices} />
            <ul className="flex-1 space-y-1 text-xs" aria-label={exportLabels.categoryChartDesc}>
              {stats.byCategory.slice(0, 5).map((c, i) => {
                const visual = ingredientCategoryVisual(c.category);
                return (
                  <li key={c.category} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="truncate text-stone-600 dark:text-stone-400">
                      {visual.emoji} <TranslatedText text={c.category} />
                    </span>
                    <span className="ml-auto font-semibold text-stone-800 dark:text-stone-200">
                      {c.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </FrostedPanel>

        <FrostedPanel className="p-5">
          <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            {t("home.glance.recipeCoverage")}
          </h3>
          <div className="mt-3 flex items-center gap-4">
            <DonutChart
              slices={
                coverageSlices.length > 0
                  ? coverageSlices
                  : [{ value: 1, color: "#94a3b8", label: "" }]
              }
            />
            <ul className="space-y-2 text-sm" aria-label={exportLabels.coverageChartDesc}>
              <li className="flex justify-between gap-4">
                <span className="text-stone-600 dark:text-stone-400">{t("home.glance.ready")}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{coverage.ready}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-stone-600 dark:text-stone-400">{t("home.glance.oneAway")}</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{coverage.oneAway}</span>
              </li>
            </ul>
          </div>
        </FrostedPanel>
      </div>
    </section>
  );
}
