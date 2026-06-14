import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import type { Ingredient } from "@/features/ingredients/types/ingredient";
import type { EntityId } from "@/types/entity";

interface IngredientPickerProps {
  ingredients: Ingredient[];
  selectedIds: EntityId[];
  onChange: (ids: EntityId[]) => void;
  loading?: boolean;
}

export function IngredientPicker({
  ingredients,
  selectedIds,
  onChange,
  loading = false,
}: IngredientPickerProps) {
  const { t } = useTranslation();
  const allSelected = ingredients.length > 0 && selectedIds.length === ingredients.length;

  function toggleIngredient(id: EntityId) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  function toggleAll() {
    if (allSelected) {
      onChange([]);
      return;
    }
    onChange(ingredients.map((item) => item.id));
  }

  if (loading) {
    return <p className="text-sm text-stone-500 dark:text-stone-400">{t("recipes.pantryLoading")}</p>;
  }

  if (ingredients.length === 0) {
    return (
      <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-stone-600 dark:bg-stone-900/70 dark:text-stone-400">
        {t("recipes.pantryEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {t("recipes.pantryTitle")}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
        >
          {allSelected ? t("recipes.pantryClear") : t("recipes.pantrySelectAll")}
        </button>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">{t("recipes.pantryHint")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ingredients.map((ingredient) => {
          const checked = selectedIds.includes(ingredient.id);
          return (
            <label
              key={ingredient.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                checked
                  ? "border-amber-300 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-950/40"
                  : "border-stone-200 bg-white/70 hover:border-amber-200 dark:border-stone-600 dark:bg-stone-900/70 dark:hover:border-amber-700"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleIngredient(ingredient.id)}
                className="h-4 w-4 rounded border-stone-300 text-amber-600"
              />
              <span className="flex-1">
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  <TranslatedText text={ingredient.name} />
                </span>
                <span className="ml-2 text-stone-500 dark:text-stone-400">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
