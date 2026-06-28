import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FrostedPanel } from "@/components/FrostedPanel";
import { TranslatedText } from "@/components/TranslatedText";
import { CategoryFilterChips } from "@/features/recipes/components/CategoryFilterChips";
import { MEAL_SLOTS, type MealPlanEntry, type MealSlot } from "@/features/mealPlan/types/mealPlan";
import { toISODate } from "@/features/mealPlan/lib/week";

const QUICK_CATEGORIES = [
  "Seasonal",
  "High protein",
  "Vegetarian",
  "Quick prep",
  "Comfort",
  "Healthy",
];

interface HomeSidebarProps {
  todayEntries: MealPlanEntry[];
  mealPlanEnabled: boolean;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function slotLabel(slot: MealSlot, t: (key: string) => string): string {
  return t(`home.sidebar.slots.${slot}`);
}

export function HomeSidebar({
  todayEntries,
  mealPlanEnabled,
  categories,
  selectedCategory,
  onSelectCategory,
}: HomeSidebarProps) {
  const { t } = useTranslation();
  const today = toISODate(new Date());

  const bySlot = new Map<MealSlot, MealPlanEntry>();
  todayEntries
    .filter((e) => e.date === today)
    .forEach((e) => bySlot.set(e.slot, e));

  const quickCats = categories.length > 0
    ? categories.filter((c) =>
        QUICK_CATEGORIES.some((q) => c.toLowerCase().includes(q.toLowerCase().split(" ")[0])),
      ).slice(0, 6)
    : QUICK_CATEGORIES;

  return (
    <aside className="flex flex-col gap-5">
      <FrostedPanel className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            {t("home.sidebar.todaysPlan")}
          </h3>
          {mealPlanEnabled && (
            <Link
              to="/meal-plan"
              className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
            >
              {t("home.sidebar.openPlanner")} →
            </Link>
          )}
        </div>

        {!mealPlanEnabled ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{t("home.sidebar.planUpsell")}</p>
        ) : (
          <ul className="space-y-3">
            {MEAL_SLOTS.map((slot) => {
              const entry = bySlot.get(slot);
              return (
                <li key={slot} className="flex items-start gap-3">
                  <span className="mt-0.5 w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    {slotLabel(slot, t)}
                  </span>
                  {entry ? (
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      <TranslatedText text={entry.recipe_name} />
                    </span>
                  ) : (
                    <span className="text-sm italic text-stone-400 dark:text-stone-500">
                      {t("home.sidebar.unassigned")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </FrostedPanel>

      <FrostedPanel className="p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
          {t("home.sidebar.quickCategories")}
        </h3>
        <CategoryFilterChips
          categories={quickCats}
          selected={selectedCategory}
          onSelect={onSelectCategory}
        />
      </FrostedPanel>
    </aside>
  );
}
