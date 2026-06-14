import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useTranslatedList } from "@/lib/translation/useTranslatedList";
import type { IngredientSortField, SortOrder } from "@/features/ingredients/types/ingredient";

interface IngredientFiltersProps {
  search: string;
  category: string;
  categories: string[];
  sortBy: IngredientSortField;
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortByChange: (value: IngredientSortField) => void;
  onSortOrderChange: (value: SortOrder) => void;
}

export function IngredientFilters({
  search,
  category,
  categories,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onSortByChange,
  onSortOrderChange,
}: IngredientFiltersProps) {
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

  const sortOptions: { value: IngredientSortField; label: string }[] = [
    { value: "name", label: t("ingredients.sortName") },
    { value: "expiration_date", label: t("ingredients.sortExpiration") },
    { value: "quantity", label: t("ingredients.sortQuantity") },
    { value: "created_at", label: t("ingredients.sortDateAdded") },
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/60 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        label={t("common.search")}
        placeholder={t("ingredients.searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        label={t("ingredients.category")}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categoryOptions}
      />
      <Select
        label={t("ingredients.sortBy")}
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as IngredientSortField)}
        options={sortOptions}
      />
      <Select
        label={t("ingredients.order")}
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        options={[
          { value: "asc", label: t("common.ascending") },
          { value: "desc", label: t("common.descending") },
        ]}
      />
    </div>
  );
}
