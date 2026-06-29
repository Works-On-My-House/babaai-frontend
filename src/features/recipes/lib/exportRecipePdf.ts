import { jsPDF } from "jspdf";

import { parsePreparationSteps } from "@/features/recipes/lib/recipeCatalog";
import type { Recipe } from "@/features/recipes/types/recipe";

export interface RecipeExportLabels {
  ingredients: string;
  preparation: string;
  steps: string;
  nutrition: string;
  calories: string;
  generatedBy: string;
  exportedAt: string;
}

export function downloadRecipePdf(recipe: Recipe, labels: RecipeExportLabels, locale?: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const exportedAt = new Date().toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function ensureSpace(lines = 12): void {
    if (y + lines > 280) {
      doc.addPage();
      y = 20;
    }
  }

  function writeHeading(text: string, size = 14): void {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  }

  function writeBody(text: string, size = 10): void {
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

  writeHeading(recipe.name, 18);
  writeBody(recipe.category, 10);
  y += 2;

  writeHeading(labels.ingredients, 12);
  for (const item of recipe.ingredients) {
    writeBody(`• ${item.product_name} — ${item.quantity} ${item.unit}`, 9.5);
  }
  y += 2;

  const steps = parsePreparationSteps(recipe.preparation);
  writeHeading(steps.length > 1 ? labels.steps : labels.preparation, 12);
  if (steps.length > 1) {
    steps.forEach((step, index) => writeBody(`${index + 1}. ${step}`, 9.5));
  } else {
    writeBody(recipe.preparation, 9.5);
  }

  if (recipe.nutrition?.calories != null) {
    y += 2;
    writeHeading(labels.nutrition, 12);
    writeBody(`${labels.calories}: ${Math.round(recipe.nutrition.calories)} kcal`, 9.5);
  }

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text(`${labels.generatedBy} BabaAI | ${labels.exportedAt}: ${exportedAt}`, margin, footerY, {
    maxWidth: contentWidth,
  });
  doc.setTextColor(0);

  const slug = recipe.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  doc.save(`recipe-${slug || recipe.id}.pdf`);
}
