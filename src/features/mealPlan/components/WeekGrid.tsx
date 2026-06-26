import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { MealSlotCell } from "@/features/mealPlan/components/MealSlotCell";
import { formatDayHeading, isToday, weekDays } from "@/features/mealPlan/lib/week";
import { MEAL_SLOTS, type MealPlanEntry, type MealPlanWeek, type MealSlot } from "@/features/mealPlan/types/mealPlan";

interface WeekGridProps {
  weekStart: string;
  week: MealPlanWeek | null;
  onAssign: (date: string, slot: MealSlot) => void;
  onRemove: (entry: MealPlanEntry) => void;
}

function entryKey(date: string, slot: MealSlot): string {
  return `${date}|${slot}`;
}

/**
 * 7-day × meal-slot grid (ClickUp 869dpd7ju). Day columns on desktop, stacked per-day cards on
 * mobile. Each cell shows the assigned recipe + readiness badge or an empty "add" affordance.
 */
export function WeekGrid({ weekStart, week, onAssign, onRemove }: WeekGridProps) {
  const { t, i18n } = useTranslation();
  const days = useMemo(() => weekDays(weekStart), [weekStart]);

  const byCell = useMemo(() => {
    const map = new Map<string, MealPlanEntry>();
    for (const entry of week?.entries ?? []) {
      map.set(entryKey(entry.date, entry.slot), entry);
    }
    return map;
  }, [week]);

  return (
    <>
      {/* Desktop: a true grid with a leading slot-label column. */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="grid min-w-[56rem] grid-cols-[5rem_repeat(7,minmax(0,1fr))] gap-2">
          <div />
          {days.map((day) => {
            const heading = formatDayHeading(day, i18n.language);
            return (
              <div
                key={day}
                className={`rounded-lg px-2 py-1.5 text-center ${
                  isToday(day)
                    ? "bg-amber-100/80 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                    : "text-stone-600 dark:text-stone-300"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide">{heading.weekday}</div>
                <div className="text-sm font-bold">{heading.day}</div>
              </div>
            );
          })}

          {MEAL_SLOTS.map((slot) => (
            <div key={slot} className="contents">
              <div className="flex items-center text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {t(`mealPlan.slots.${slot}`)}
              </div>
              {days.map((day) => (
                <MealSlotCell
                  key={entryKey(day, slot)}
                  date={day}
                  slot={slot}
                  entry={byCell.get(entryKey(day, slot)) ?? null}
                  onAssign={onAssign}
                  onRemove={onRemove}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stack by day, with a slot row inside each day card. */}
      <div className="space-y-4 lg:hidden">
        {days.map((day) => {
          const heading = formatDayHeading(day, i18n.language);
          return (
            <div
              key={day}
              className="rounded-2xl border border-white/60 bg-white/60 p-3 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/60"
            >
              <div
                className={`mb-2 inline-flex items-baseline gap-1.5 rounded-lg px-2 py-0.5 text-sm font-semibold ${
                  isToday(day)
                    ? "bg-amber-100/80 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                    : "text-stone-700 dark:text-stone-200"
                }`}
              >
                {heading.weekday} <span className="font-bold">{heading.day}</span>
              </div>
              <div className="space-y-2">
                {MEAL_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-[5rem_minmax(0,1fr)] items-stretch gap-2">
                    <span className="flex items-center text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      {t(`mealPlan.slots.${slot}`)}
                    </span>
                    <MealSlotCell
                      date={day}
                      slot={slot}
                      entry={byCell.get(entryKey(day, slot)) ?? null}
                      onAssign={onAssign}
                      onRemove={onRemove}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
