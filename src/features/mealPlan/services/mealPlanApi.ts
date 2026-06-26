import { http } from "@/api/axios";
import type {
  AssignEntryInput,
  MealPlanEntry,
  MealPlanWeek,
  MoveEntryInput,
} from "@/features/mealPlan/types/mealPlan";

const BASE = "/api/v1/meal-plan";

/**
 * Meal planner API client (ClickUp 869dpd7ju). Targets the core API from 869dpd7jt; premium is
 * enforced server-side. Until the backend ships, the week query fails and the page shows its
 * loading/empty/upsell states.
 */
export const mealPlanApi = {
  week: async (weekStart: string): Promise<MealPlanWeek> => {
    const { data } = await http.get<MealPlanWeek>(BASE, { params: { week_start: weekStart } });
    return data;
  },

  assign: async (input: AssignEntryInput): Promise<MealPlanEntry> => {
    const { data } = await http.post<MealPlanEntry>(`${BASE}/entries`, input);
    return data;
  },

  move: async ({ id, date, slot }: MoveEntryInput): Promise<MealPlanEntry> => {
    const { data } = await http.patch<MealPlanEntry>(`${BASE}/entries/${id}`, { date, slot });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await http.delete(`${BASE}/entries/${id}`);
  },
};
