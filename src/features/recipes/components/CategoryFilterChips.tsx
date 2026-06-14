import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { CategoryIconChip } from "@/features/recipes/components/CategoryIcon";

interface CategoryFilterChipsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  trailing?: ReactNode;
}

const chipBase =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2";

const chipInactive =
  "border border-stone-200/90 bg-white/85 text-stone-700 shadow-sm hover:border-amber-300 hover:bg-white hover:text-stone-900 dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-200 dark:hover:border-amber-600";

const chipActive =
  "border border-transparent bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-orange-500/25";

export function CategoryFilterChips({
  categories,
  selected,
  onSelect,
  trailing,
}: CategoryFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`${chipBase} ${selected === "" ? chipActive : chipInactive}`}
      >
        <CategoryIconChip category="All" />
        <span>{t("home.allCategories")}</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`${chipBase} ${selected === cat ? chipActive : chipInactive}`}
        >
          <CategoryIconChip category={cat} />
          <TranslatedText text={cat} />
        </button>
      ))}

      {trailing ? <div className="ml-auto flex shrink-0 items-center">{trailing}</div> : null}
    </div>
  );
}
