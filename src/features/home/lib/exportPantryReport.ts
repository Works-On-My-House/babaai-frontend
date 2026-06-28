import type { PantryStats, RecipeCoverage } from "@/features/home/lib/pantryStats";

export interface PantryExportLabels {
  title: string;
  totalItems: string;
  fresh: string;
  expiring48h: string;
  expiryWindows: string;
  categories: string;
  recipeCoverage: string;
  ready: string;
  oneAway: string;
  other: string;
  snapshotAt: string;
  lastUpdated: string;
  generatedBy: string;
  windowLabels: Record<string, string>;
  /** Accessible text descriptions for each chart section. */
  expiryChartDesc: string;
  categoryChartDesc: string;
  coverageChartDesc: string;
  attentionNote: string | null;
}

export interface PantryExportTimestamps {
  snapshotAt: Date;
  lastUpdated: Date | null;
}

export interface PantryReportPayload {
  stats: PantryStats;
  coverage: RecipeCoverage;
  labels: PantryExportLabels;
  timestamps: PantryExportTimestamps;
  locale?: string;
}

export function formatReportTimestamp(date: Date, locale?: string): string {
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function buildExpiryBreakdown(stats: PantryStats, windowLabels: Record<string, string>): string {
  return stats.expiryWindows
    .map((w) => `${windowLabels[w.label] ?? w.label}: ${w.count}`)
    .join(", ");
}

export function buildCategoryBreakdown(stats: PantryStats): string {
  if (stats.byCategory.length === 0) return "—";
  return stats.byCategory
    .map((c) => `${c.category} (${c.count})`)
    .join(", ");
}

export function buildCoverageBreakdown(coverage: RecipeCoverage, labels: Pick<PantryExportLabels, "ready" | "oneAway" | "other">): string {
  return `${labels.ready}: ${coverage.ready}, ${labels.oneAway}: ${coverage.oneAway}, ${labels.other}: ${coverage.other}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildPantryReportHtml(payload: PantryReportPayload): string {
  const { stats, coverage, labels, timestamps, locale } = payload;
  const snapshotText = formatReportTimestamp(timestamps.snapshotAt, locale);
  const lastUpdatedText = timestamps.lastUpdated
    ? formatReportTimestamp(timestamps.lastUpdated, locale)
    : "—";

  const expiryRows = stats.expiryWindows
    .map(
      (w) =>
        `<tr><td>${escapeHtml(labels.windowLabels[w.label] ?? w.label)}</td><td>${w.count}</td></tr>`,
    )
    .join("");

  const categoryRows = stats.byCategory
    .map((c) => `<tr><td>${escapeHtml(c.category)}</td><td>${c.count}</td></tr>`)
    .join("");

  const attentionBlock = labels.attentionNote
    ? `<p class="note">${escapeHtml(labels.attentionNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale?.startsWith("bg") ? "bg" : "en"}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)}</title>
  <style>
    @page { margin: 18mm 16mm 24mm; }
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1c1917; margin: 0; padding: 0 0 3rem; }
    h1 { font-size: 1.6rem; margin: 0 0 0.35rem; font-style: italic; }
    .meta { font-family: system-ui, sans-serif; font-size: 0.8rem; color: #57534e; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .card { font-family: system-ui, sans-serif; font-size: 0.85rem; padding: 0.85rem; border: 1px solid #e7e5e4; border-radius: 10px; }
    .card strong { display: block; font-size: 1.25rem; margin-top: 0.25rem; color: #1c1917; }
    section { margin-bottom: 1.35rem; page-break-inside: avoid; }
    h2 { font-family: system-ui, sans-serif; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #78716c; margin: 0 0 0.45rem; }
    .chart-desc {
      font-family: system-ui, sans-serif;
      font-size: 0.82rem;
      color: #44403c;
      background: #fafaf9;
      border-left: 3px solid #d97706;
      padding: 0.65rem 0.75rem;
      margin: 0 0 0.65rem;
    }
    table { width: 100%; border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 0.85rem; }
    th, td { padding: 0.4rem 0; border-bottom: 1px solid #e7e5e4; text-align: left; }
    td:last-child, th:last-child { text-align: right; font-weight: 600; }
    .note { font-family: system-ui, sans-serif; font-size: 0.8rem; color: #c2410c; margin: 0.5rem 0 0; }
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      font-family: system-ui, sans-serif;
      font-size: 0.68rem;
      color: #78716c;
      border-top: 1px solid #d6d3d1;
      padding: 0.55rem 0;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      background: #fff;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(labels.title)}</h1>
  <p class="meta">${escapeHtml(labels.snapshotAt)}: <strong>${escapeHtml(snapshotText)}</strong></p>

  <div class="grid">
    <div class="card">${escapeHtml(labels.totalItems)}<strong>${stats.total}</strong></div>
    <div class="card">${escapeHtml(labels.fresh)}<strong>${stats.freshPercent}%</strong></div>
    <div class="card">${escapeHtml(labels.expiring48h)}<strong>${stats.expiring48h}</strong></div>
  </div>

  <section aria-labelledby="expiry-heading">
    <h2 id="expiry-heading">${escapeHtml(labels.expiryWindows)}</h2>
    <p class="chart-desc" role="doc-subtitle">${escapeHtml(labels.expiryChartDesc)}</p>
    <table>
      <thead><tr><th scope="col">${escapeHtml(labels.expiryWindows)}</th><th scope="col">#</th></tr></thead>
      <tbody>${expiryRows}</tbody>
    </table>
    ${attentionBlock}
  </section>

  <section aria-labelledby="category-heading">
    <h2 id="category-heading">${escapeHtml(labels.categories)}</h2>
    <p class="chart-desc" role="doc-subtitle">${escapeHtml(labels.categoryChartDesc)}</p>
    <table>
      <thead><tr><th scope="col">${escapeHtml(labels.categories)}</th><th scope="col">#</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </section>

  <section aria-labelledby="coverage-heading">
    <h2 id="coverage-heading">${escapeHtml(labels.recipeCoverage)}</h2>
    <p class="chart-desc" role="doc-subtitle">${escapeHtml(labels.coverageChartDesc)}</p>
    <table>
      <tbody>
        <tr><td>${escapeHtml(labels.ready)}</td><td>${coverage.ready}</td></tr>
        <tr><td>${escapeHtml(labels.oneAway)}</td><td>${coverage.oneAway}</td></tr>
        <tr><td>${escapeHtml(labels.other)}</td><td>${coverage.other}</td></tr>
      </tbody>
    </table>
  </section>

  <footer>
    <span>${escapeHtml(labels.generatedBy)} BabaAI</span>
    <span>${escapeHtml(labels.lastUpdated)}: ${escapeHtml(lastUpdatedText)}</span>
    <span>${escapeHtml(labels.snapshotAt)}: ${escapeHtml(snapshotText)}</span>
  </footer>
</body>
</html>`;
}

export class PantryExportError extends Error {
  constructor(
    message: string,
    readonly code: "POPUP_BLOCKED" | "PDF_FAILED" | "PRINT_FAILED",
  ) {
    super(message);
    this.name = "PantryExportError";
  }
}

export async function printPantryReport(payload: PantryReportPayload): Promise<void> {
  const html = buildPantryReportHtml(payload);
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new PantryExportError("Popup blocked", "POPUP_BLOCKED");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        resolve();
      } catch {
        reject(new PantryExportError("Print failed", "PRINT_FAILED"));
      }
    }, 250);

    printWindow.addEventListener("load", () => {
      window.clearTimeout(timer);
      try {
        printWindow.focus();
        printWindow.print();
        resolve();
      } catch {
        reject(new PantryExportError("Print failed", "PRINT_FAILED"));
      }
    }, { once: true });
  });
}

export async function downloadPantryPdf(payload: PantryReportPayload): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { stats, coverage, labels, timestamps, locale } = payload;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const snapshotText = formatReportTimestamp(timestamps.snapshotAt, locale);
  const lastUpdatedText = timestamps.lastUpdated
    ? formatReportTimestamp(timestamps.lastUpdated, locale)
    : "—";

  function ensureSpace(lines = 12): void {
    if (y + lines > 280) {
      doc.addPage();
      y = 20;
    }
  }

  function writeHeading(text: string, size = 11): void {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(text, margin, y);
    y += size * 0.45 + 2;
  }

  function writeBody(text: string, size = 9.5): void {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      ensureSpace(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 2;
  }

  function writeTableRow(label: string, value: string | number): void {
    ensureSpace(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(label, margin, y);
    doc.text(String(value), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  writeHeading(labels.title, 16);
  writeBody(`${labels.snapshotAt}: ${snapshotText}`, 9);
  y += 2;

  writeBody(`${labels.totalItems}: ${stats.total}`);
  writeBody(`${labels.fresh}: ${stats.freshPercent}%`);
  writeBody(`${labels.expiring48h}: ${stats.expiring48h}`);
  y += 2;

  writeHeading(labels.expiryWindows);
  writeBody(labels.expiryChartDesc);
  for (const window of stats.expiryWindows) {
    writeTableRow(labels.windowLabels[window.label] ?? window.label, window.count);
  }
  if (labels.attentionNote) writeBody(labels.attentionNote);
  y += 2;

  writeHeading(labels.categories);
  writeBody(labels.categoryChartDesc);
  for (const category of stats.byCategory) {
    writeTableRow(category.category, category.count);
  }
  y += 2;

  writeHeading(labels.recipeCoverage);
  writeBody(labels.coverageChartDesc);
  writeTableRow(labels.ready, coverage.ready);
  writeTableRow(labels.oneAway, coverage.oneAway);
  writeTableRow(labels.other, coverage.other);

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text(
    `${labels.generatedBy} BabaAI | ${labels.lastUpdated}: ${lastUpdatedText} | ${labels.snapshotAt}: ${snapshotText}`,
    margin,
    footerY,
    { maxWidth: contentWidth },
  );
  doc.setTextColor(0);

  const fileDate = timestamps.snapshotAt.toISOString().slice(0, 10);
  doc.save(`pantry-report-${fileDate}.pdf`);
}
