import { useQuery } from "@tanstack/react-query";

import { mealPlanApi } from "@/features/mealPlan/services/mealPlanApi";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Weekly meal plan query (ClickUp 869dpd7ju). Disabled for non-premium users so we never fire a
 * 402/403 — the page renders the upsell instead.
 */
export function useMealPlan(weekStart: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.mealPlan.week(weekStart),
    queryFn: () => mealPlanApi.week(weekStart),
    enabled,
  });
}
