import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { AiProposalIngredient, AiRecipeProposal } from "@/features/recipes/types/recipe";

interface AiProposalCardProps {
  proposal: AiRecipeProposal;
}

function formatQuantity(ingredient: AiProposalIngredient): string | null {
  if (ingredient.quantity == null) return ingredient.unit ?? null;
  const quantity = Number.isInteger(ingredient.quantity)
    ? String(ingredient.quantity)
    : ingredient.quantity.toFixed(1);
  return ingredient.unit ? `${quantity} ${ingredient.unit}` : quantity;
}

export function AiProposalCard({ proposal }: AiProposalCardProps) {
  const { t } = useTranslation();
  const steps = proposal.steps.length > 0 ? proposal.steps : [proposal.preparation];

  return (
    <article className="flex flex-col rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-indigo-50/80 p-5 shadow-sm shadow-violet-900/5 backdrop-blur-md dark:border-violet-800/60 dark:from-violet-950/40 dark:to-indigo-950/30">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            <TranslatedText text={proposal.name} />
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("recipes.aiProposal.subtitle")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">
          {proposal.agent_label}
        </span>
      </div>

      {proposal.ingredients.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {t("recipes.aiProposal.ingredients")}
          </p>
          <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
            {proposal.ingredients.map((ingredient) => {
              const quantity = formatQuantity(ingredient);
              return (
                <li
                  key={`${ingredient.product_name}-${ingredient.unit ?? ""}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-1.5 dark:bg-stone-900/50"
                >
                  <span>
                    <TranslatedText text={ingredient.product_name} />
                  </span>
                  {quantity && (
                    <span className="shrink-0 font-medium text-violet-700 dark:text-violet-300">
                      {quantity}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {t("recipes.aiProposal.steps")}
        </p>
        <ol className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-200/80 text-xs font-semibold text-violet-800 dark:bg-violet-900/60 dark:text-violet-200">
                {index + 1}
              </span>
              <span className="leading-relaxed">
                <TranslatedText text={step} />
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {t("recipes.aiProposal.savedToHistory")}
      </p>
    </article>
  );
}
