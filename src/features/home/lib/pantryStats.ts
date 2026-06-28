import { daysUntilExpiry, isExpired, isExpiringSoon } from "@/features/ingredients/lib/expiry";
import type { Ingredient } from "@/features/ingredients/types/ingredient";

export interface PantryStats {
  total: number;
  freshCount: number;
  freshPercent: number;
  expiring48h: number;
  expiringSoon: Ingredient[];
  byCategory: { category: string; count: number }[];
  expiryWindows: { label: string; count: number }[];
}

const EXPIRY_WINDOWS = [
  { key: "today", maxDays: 0 },
  { key: "oneTwo", minDays: 1, maxDays: 2 },
  { key: "threeSeven", minDays: 3, maxDays: 7 },
  { key: "eightPlus", minDays: 8 },
] as const;

export function computePantryStats(ingredients: Ingredient[]): PantryStats {
  const total = ingredients.length;
  let freshCount = 0;
  let expiring48h = 0;

  const categoryMap = new Map<string, number>();
  const windowCounts = { today: 0, oneTwo: 0, threeSeven: 0, eightPlus: 0 };

  const expiringSoon: Ingredient[] = [];

  for (const item of ingredients) {
    const cat = item.category || "other";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);

    if (!item.expiration_date || isExpired(item.expiration_date)) continue;

    const days = daysUntilExpiry(item.expiration_date);
    if (days === null) continue;

    if (days > 7) {
      freshCount += 1;
      windowCounts.eightPlus += 1;
    } else {
      if (days <= 2) expiring48h += 1;
      if (isExpiringSoon(item.expiration_date)) {
        expiringSoon.push(item);
      }
      if (days === 0) windowCounts.today += 1;
      else if (days <= 2) windowCounts.oneTwo += 1;
      else if (days <= 7) windowCounts.threeSeven += 1;
    }
  }

  // Items without expiry date count as fresh
  const noDateCount = ingredients.filter((i) => !i.expiration_date).length;
  freshCount += noDateCount;

  const freshPercent = total > 0 ? Math.round((freshCount / total) * 100) : 100;

  const byCategory = [...categoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  expiringSoon.sort((a, b) => {
    const da = daysUntilExpiry(a.expiration_date) ?? 999;
    const db = daysUntilExpiry(b.expiration_date) ?? 999;
    return da - db;
  });

  return {
    total,
    freshCount,
    freshPercent,
    expiring48h,
    expiringSoon,
    byCategory,
    expiryWindows: EXPIRY_WINDOWS.map((w) => ({
      label: w.key,
      count: windowCounts[w.key],
    })),
  };
}

export interface RecipeCoverage {
  ready: number;
  oneAway: number;
  other: number;
}

export function computeRecipeCoverage(
  items: { can_prepare: boolean; missing_ingredients?: string[] }[],
): RecipeCoverage {
  let ready = 0;
  let oneAway = 0;
  let other = 0;
  for (const item of items) {
    if (item.can_prepare) ready += 1;
    else if ((item.missing_ingredients?.length ?? 0) === 1) oneAway += 1;
    else other += 1;
  }
  return { ready, oneAway, other };
}
