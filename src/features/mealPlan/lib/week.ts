/** ISO-week date helpers for the meal planner (ClickUp 869dpd7ju). Weeks start on Monday. */

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday (local time) of the week containing `date`, as a YYYY-MM-DD string. */
export function startOfWeek(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday … 6 = Saturday
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addWeeks(weekStart: string, weeks: number): string {
  const d = parseISODate(weekStart);
  d.setDate(d.getDate() + weeks * 7);
  return toISODate(d);
}

/** The 7 ISO day strings (Mon→Sun) of the given week. */
export function weekDays(weekStart: string): string[] {
  const start = parseISODate(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function isToday(iso: string): boolean {
  return iso === toISODate(new Date());
}

/** e.g. "Mon 12". Locale-aware short weekday + day number. */
export function formatDayHeading(iso: string, locale?: string): { weekday: string; day: string } {
  const d = parseISODate(iso);
  return {
    weekday: d.toLocaleDateString(locale, { weekday: "short" }),
    day: String(d.getDate()),
  };
}

/** e.g. "Jun 9 – 15". Human label for a whole week. */
export function formatWeekRange(weekStart: string, locale?: string): string {
  const start = parseISODate(weekStart);
  const end = parseISODate(addWeeks(weekStart, 1));
  end.setDate(end.getDate() - 1);
  const startLabel = start.toLocaleDateString(locale, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(locale, {
    month: start.getMonth() === end.getMonth() ? undefined : "short",
    day: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}
