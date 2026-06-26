import { useTranslation } from "react-i18next";
import { AddOutlined, CloseOutlined } from "@mui/icons-material";

import { TranslatedText } from "@/components/TranslatedText";
import { ReadinessBadge } from "@/features/mealPlan/components/ReadinessBadge";
import type { MealPlanEntry, MealSlot } from "@/features/mealPlan/types/mealPlan";

interface MealSlotCellProps {
  date: string;
  slot: MealSlot;
  entry: MealPlanEntry | null;
  onAssign: (date: string, slot: MealSlot) => void;
  onRemove: (entry: MealPlanEntry) => void;
}

export function MealSlotCell({ date, slot, entry, onAssign, onRemove }: MealSlotCellProps) {
  const { t } = useTranslation();

  if (!entry) {
    return (
      <button
        type="button"
        onClick={() => onAssign(date, slot)}
        aria-label={t("mealPlan.assignTo", { slot: t(`mealPlan.slots.${slot}`) })}
        className="flex min-h-[3.5rem] w-full items-center justify-center rounded-xl border border-dashed border-stone-300/70 bg-white/40 text-stone-400 transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-600 dark:border-stone-700 dark:bg-stone-900/30 dark:hover:bg-amber-950/30"
      >
        <AddOutlined sx={{ fontSize: 18 }} />
      </button>
    );
  }

  return (
    <div className="group relative flex min-h-[3.5rem] flex-col gap-1 rounded-xl border border-white/60 bg-white/80 p-2.5 shadow-sm dark:border-stone-700 dark:bg-stone-800/70">
      <span className="pr-5 text-sm font-medium leading-snug text-stone-800 dark:text-stone-200">
        <TranslatedText text={entry.recipe_name} />
      </span>
      <ReadinessBadge readiness={entry.readiness} />
      <button
        type="button"
        onClick={() => onRemove(entry)}
        aria-label={t("mealPlan.removeEntry", { name: entry.recipe_name })}
        className="absolute right-1.5 top-1.5 rounded-md p-0.5 text-stone-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950/40"
      >
        <CloseOutlined sx={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
