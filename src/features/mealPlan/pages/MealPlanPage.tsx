import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

import { Button } from "@/components/ui/Button";
import { useEntitlements } from "@/features/auth/useEntitlements";
import { AssignRecipeDialog } from "@/features/mealPlan/components/AssignRecipeDialog";
import { PremiumUpsell } from "@/features/mealPlan/components/PremiumUpsell";
import { WeekGrid } from "@/features/mealPlan/components/WeekGrid";
import { useMealPlan } from "@/features/mealPlan/hooks/useMealPlan";
import { useMealPlanMutations } from "@/features/mealPlan/hooks/useMealPlanMutations";
import { addWeeks, formatWeekRange, startOfWeek } from "@/features/mealPlan/lib/week";
import type { MealPlanEntry, MealSlot } from "@/features/mealPlan/types/mealPlan";
import { useShoppingListMutations } from "@/features/shoppingList/hooks/useShoppingListMutations";

export function MealPlanPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isPremium } = useEntitlements();

  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [target, setTarget] = useState<{ date: string; slot: MealSlot } | null>(null);

  const { data: week, isLoading } = useMealPlan(weekStart, isPremium);
  const { assign, remove } = useMealPlanMutations();
  const { generate } = useShoppingListMutations();

  const weekRecipeIds = useMemo(
    () => Array.from(new Set((week?.entries ?? []).map((entry) => entry.recipe_id))),
    [week],
  );

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <PremiumUpsell />
      </div>
    );
  }

  function handleGenerateShoppingList() {
    if (weekRecipeIds.length === 0 || generate.isPending) return;
    generate.mutate(
      { recipe_ids: weekRecipeIds, name: t("mealPlan.weekListName", { range: formatWeekRange(weekStart, i18n.language) }) },
      { onSuccess: () => navigate("/shopping-list") },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            aria-label={t("mealPlan.prevWeek")}
            className="rounded-lg border border-stone-200 bg-white/80 p-1.5 text-stone-600 transition hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300"
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </button>
          <span className="min-w-[8rem] text-center text-sm font-semibold text-stone-800 dark:text-stone-200">
            {formatWeekRange(weekStart, i18n.language)}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            aria-label={t("mealPlan.nextWeek")}
            className="rounded-lg border border-stone-200 bg-white/80 p-1.5 text-stone-600 transition hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300"
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek())}>
            {t("mealPlan.thisWeek")}
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleGenerateShoppingList}
          disabled={weekRecipeIds.length === 0 || generate.isPending}
        >
          {generate.isPending ? t("mealPlan.generatingList") : t("mealPlan.generateWeekList")}
        </Button>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-2xl border border-white/60 bg-white/50 dark:border-stone-700 dark:bg-stone-900/50" />
      ) : (
        <WeekGrid
          weekStart={weekStart}
          week={week ?? null}
          onAssign={(date, slot) => setTarget({ date, slot })}
          onRemove={(entry: MealPlanEntry) => remove.mutate({ weekStart, id: entry.id })}
        />
      )}

      <AssignRecipeDialog
        open={target != null}
        onClose={() => setTarget(null)}
        onSelect={(recipe) => {
          if (!target) return;
          assign.mutate({
            weekStart,
            date: target.date,
            slot: target.slot,
            recipe: { id: recipe.id, name: recipe.name, category: recipe.category },
          });
        }}
      />
    </div>
  );
}

function PageHeader() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 drop-shadow-sm dark:text-stone-50 sm:text-3xl">
        {t("mealPlan.title")}
      </h1>
      <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">{t("mealPlan.subtitle")}</p>
    </div>
  );
}
