import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useTranslatedList } from "@/lib/translation/useTranslatedList";

interface RecipeFiltersProps {
  search: string;
  category: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function RecipeFilters({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
}: RecipeFiltersProps) {
  const { t } = useTranslation();
  const translatedCategories = useTranslatedList(categories);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("common.allCategories") },
      ...categories.map((value, index) => ({
        value,
        label: translatedCategories[index] ?? value,
      })),
    ],
    [categories, translatedCategories, t],
  );

  return (
    <div className="grid gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/60 sm:grid-cols-2">
      <Input
        label={t("recipes.searchRecipes")}
        placeholder={t("recipes.searchRecipesPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        label={t("ingredients.category")}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categoryOptions}
      />
    </div>
  );
}
