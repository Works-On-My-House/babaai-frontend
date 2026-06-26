import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TranslatedText } from "@/components/TranslatedText";
import { CategoryIconChip } from "@/features/recipes/components/CategoryIcon";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import type { Recipe } from "@/features/recipes/types/recipe";

interface AssignRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}

/**
 * Picks a catalog recipe to assign to a meal slot (ClickUp 869dpd7ju). Reuses the recipe catalog
 * search; selecting a recipe hands it back to the grid which performs the optimistic assign.
 */
export function AssignRecipeDialog({ open, onClose, onSelect }: AssignRecipeDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, loading } = useRecipes({ page: 1, page_size: 20, search });

  const recipes = data?.items ?? [];

  return (
    <Modal open={open} onClose={onClose} title={t("mealPlan.assign.title")} size="lg">
      <div className="space-y-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("mealPlan.assign.searchPlaceholder")}
          aria-label={t("mealPlan.assign.searchPlaceholder")}
        />

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-stone-400">{t("common.loading")}</p>
          ) : recipes.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              {t("mealPlan.assign.noResults")}
            </p>
          ) : (
            recipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => {
                  onSelect(recipe);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200/70 bg-white/80 p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-stone-800"
              >
                <CategoryIconChip category={recipe.category} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-200">
                    <TranslatedText text={recipe.name} />
                  </span>
                  <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                    <TranslatedText text={recipe.category} />
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
