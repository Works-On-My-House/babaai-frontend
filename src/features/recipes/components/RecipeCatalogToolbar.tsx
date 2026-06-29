import { useTranslation } from "react-i18next";

import type {
  CalorieFilter,
  DifficultyFilter,
  RecipeSortKey,
  RecipeViewMode,
  TimeFilter,
} from "@/features/recipes/lib/recipeCatalog";

interface RecipeCatalogToolbarProps {
  sort: RecipeSortKey;
  difficulty: DifficultyFilter;
  time: TimeFilter;
  calories: CalorieFilter;
  viewMode: RecipeViewMode;
  onSortChange: (value: RecipeSortKey) => void;
  onDifficultyChange: (value: DifficultyFilter) => void;
  onTimeChange: (value: TimeFilter) => void;
  onCaloriesChange: (value: CalorieFilter) => void;
  onViewModeChange: (value: RecipeViewMode) => void;
}

const selectClass =
  "rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100";

export function RecipeCatalogToolbar({
  sort,
  difficulty,
  time,
  calories,
  viewMode,
  onSortChange,
  onDifficultyChange,
  onTimeChange,
  onCaloriesChange,
  onViewModeChange,
}: RecipeCatalogToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
          <span className="sr-only">{t("recipes.catalog.sort")}</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as RecipeSortKey)}
            className={selectClass}
            aria-label={t("recipes.catalog.sort")}
          >
            <option value="best_match">{t("recipes.catalog.sortBestMatch")}</option>
            <option value="name_asc">{t("recipes.catalog.sortNameAsc")}</option>
            <option value="name_desc">{t("recipes.catalog.sortNameDesc")}</option>
            <option value="category">{t("recipes.catalog.sortCategory")}</option>
            <option value="calories_asc">{t("recipes.catalog.sortCaloriesAsc")}</option>
            <option value="calories_desc">{t("recipes.catalog.sortCaloriesDesc")}</option>
            <option value="time_asc">{t("recipes.catalog.sortTimeAsc")}</option>
            <option value="time_desc">{t("recipes.catalog.sortTimeDesc")}</option>
            <option value="difficulty">{t("recipes.catalog.sortDifficulty")}</option>
          </select>
        </label>

        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as DifficultyFilter)}
          className={selectClass}
          aria-label={t("recipes.catalog.filterDifficulty")}
        >
          <option value="">{t("recipes.catalog.allDifficulties")}</option>
          <option value="easy">{t("home.meta.difficulty.easy")}</option>
          <option value="intermediate">{t("home.meta.difficulty.intermediate")}</option>
          <option value="hard">{t("home.meta.difficulty.hard")}</option>
        </select>

        <select
          value={time}
          onChange={(e) => onTimeChange(e.target.value as TimeFilter)}
          className={selectClass}
          aria-label={t("recipes.catalog.filterTime")}
        >
          <option value="">{t("recipes.catalog.allTimes")}</option>
          <option value="quick">{t("recipes.catalog.timeQuick")}</option>
          <option value="medium">{t("recipes.catalog.timeMedium")}</option>
          <option value="long">{t("recipes.catalog.timeLong")}</option>
        </select>

        <select
          value={calories}
          onChange={(e) => onCaloriesChange(e.target.value as CalorieFilter)}
          className={selectClass}
          aria-label={t("recipes.catalog.filterCalories")}
        >
          <option value="">{t("recipes.catalog.allCalories")}</option>
          <option value="light">{t("recipes.catalog.caloriesLight")}</option>
          <option value="medium">{t("recipes.catalog.caloriesMedium")}</option>
          <option value="heavy">{t("recipes.catalog.caloriesHeavy")}</option>
        </select>
      </div>

      <div
        className="inline-flex shrink-0 rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-600 dark:bg-stone-800"
        role="group"
        aria-label={t("recipes.catalog.viewMode")}
      >
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            viewMode === "grid"
              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
          }`}
          aria-pressed={viewMode === "grid"}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t("recipes.catalog.grid")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            viewMode === "list"
              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
          }`}
          aria-pressed={viewMode === "list"}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t("recipes.catalog.list")}
          </span>
        </button>
      </div>
    </div>
  );
}
