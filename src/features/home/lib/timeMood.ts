/** Day name + time-of-day mood for the home hero eyebrow. */

export interface TimeMood {
  dayName: string;
  mood: string;
}

function hourMood(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getTimeMood(date = new Date(), locale?: string): TimeMood {
  const dayName = date.toLocaleDateString(locale, { weekday: "long" });
  return { dayName, mood: hourMood(date.getHours()) };
}

export function greetingKey(hour: number): "morning" | "afternoon" | "evening" | "night" {
  return hourMood(hour) as "morning" | "afternoon" | "evening" | "night";
}
