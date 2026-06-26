import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mealPlanApi } from "@/features/mealPlan/services/mealPlanApi";
import type { MealPlanEntry, MealPlanWeek, MealSlot } from "@/features/mealPlan/types/mealPlan";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

interface AssignVars {
  weekStart: string;
  date: string;
  slot: MealSlot;
  recipe: { id: string; name: string; category: string | null };
}

interface MoveVars {
  weekStart: string;
  id: string;
  date: string;
  slot: MealSlot;
}

interface RemoveVars {
  weekStart: string;
  id: string;
}

interface WeekContext {
  key: ReturnType<typeof queryKeys.mealPlan.week>;
  previous: MealPlanWeek | undefined;
}

/**
 * Assign / move / remove meal-plan entries (ClickUp 869dpd7ju) with optimistic week-cache updates,
 * rollback on error, and invalidation on settle — mirroring useShoppingListMutations conventions.
 */
export function useMealPlanMutations() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const translateApiError = useCallback(
    async (message: string) => {
      if (i18n.language === "en") return message;
      return translateText(message, i18n.language as AppLanguage, "en");
    },
    [i18n.language],
  );

  const showError = useCallback(
    async (err: unknown, fallbackKey: string) => {
      const message = err instanceof Error ? err.message : t(fallbackKey);
      toast.error(await translateApiError(message));
    },
    [t, translateApiError],
  );

  const snapshot = useCallback(
    async (weekStart: string): Promise<WeekContext> => {
      const key = queryKeys.mealPlan.week(weekStart);
      await queryClient.cancelQueries({ queryKey: key });
      return { key, previous: queryClient.getQueryData<MealPlanWeek>(key) };
    },
    [queryClient],
  );

  const rollback = useCallback(
    (context: WeekContext | undefined) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    },
    [queryClient],
  );

  const assign = useMutation({
    mutationFn: ({ date, slot, recipe }: AssignVars) =>
      mealPlanApi.assign({ date, slot, recipe_id: recipe.id }),
    onMutate: async ({ weekStart, date, slot, recipe }: AssignVars) => {
      const context = await snapshot(weekStart);
      if (context.previous) {
        const optimistic: MealPlanEntry = {
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 0,
          date,
          slot,
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          category: recipe.category,
          readiness: null,
        };
        const others = context.previous.entries.filter(
          (entry) => !(entry.date === date && entry.slot === slot),
        );
        queryClient.setQueryData<MealPlanWeek>(context.key, {
          ...context.previous,
          entries: [...others, optimistic],
        });
      }
      return context;
    },
    onError: (err, _vars, context) => {
      rollback(context);
      void showError(err, "mealPlan.toast.assignFailed");
    },
    onSettled: (_data, _err, { weekStart }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan.week(weekStart) });
    },
  });

  const move = useMutation({
    mutationFn: ({ id, date, slot }: MoveVars) => mealPlanApi.move({ id, date, slot }),
    onMutate: async ({ weekStart, id, date, slot }: MoveVars) => {
      const context = await snapshot(weekStart);
      if (context.previous) {
        queryClient.setQueryData<MealPlanWeek>(context.key, {
          ...context.previous,
          entries: context.previous.entries.map((entry) =>
            entry.id === id ? { ...entry, date, slot } : entry,
          ),
        });
      }
      return context;
    },
    onError: (err, _vars, context) => {
      rollback(context);
      void showError(err, "mealPlan.toast.moveFailed");
    },
    onSettled: (_data, _err, { weekStart }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan.week(weekStart) });
    },
  });

  const remove = useMutation({
    mutationFn: ({ id }: RemoveVars) => mealPlanApi.remove(id),
    onMutate: async ({ weekStart, id }: RemoveVars) => {
      const context = await snapshot(weekStart);
      if (context.previous) {
        queryClient.setQueryData<MealPlanWeek>(context.key, {
          ...context.previous,
          entries: context.previous.entries.filter((entry) => entry.id !== id),
        });
      }
      return context;
    },
    onError: (err, _vars, context) => {
      rollback(context);
      void showError(err, "mealPlan.toast.removeFailed");
    },
    onSettled: (_data, _err, { weekStart }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan.week(weekStart) });
    },
  });

  return { assign, move, remove };
}
