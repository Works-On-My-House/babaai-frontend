import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import { deriveRecipeMeta, type Difficulty } from "@/features/recipes/lib/recipeMeta";
import type { Recipe } from "@/features/recipes/types/recipe";

export const RECIPE_PAGE_SIZE_OPTIONS = [10, 12, 20, 50, 100] as const;
export const RECIPE_VIEW_STORAGE_KEY = "babaai.recipes.viewMode";
export const RECIPE_PAGE_SIZE_STORAGE_KEY = "babaai.recipes.pageSize";

export type RecipeViewMode = "grid" | "list";

export type RecipeSortKey =
  | "best_match"
  | "name_asc"
  | "name_desc"
  | "category"
  | "calories_asc"
  | "calories_desc"
  | "time_asc"
  | "time_desc"
  | "difficulty";

export type DifficultyFilter = "" | Difficulty;
export type TimeFilter = "" | "quick" | "medium" | "long";
export type CalorieFilter = "" | "light" | "medium" | "heavy";

export interface RecipeCatalogFilters {
  difficulty: DifficultyFilter;
  time: TimeFilter;
  calories: CalorieFilter;
}

/** Rating is backend-owned; return 0.0 until the API exposes a real value. */
export function getRecipeRating(recipe: Recipe): number {
  void recipe;
  return 0;
}

export function readStoredViewMode(): RecipeViewMode {
  try {
    const value = localStorage.getItem(RECIPE_VIEW_STORAGE_KEY);
    return value === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function writeStoredViewMode(mode: RecipeViewMode): void {
  try {
    localStorage.setItem(RECIPE_VIEW_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readStoredPageSize(): number {
  try {
    const raw = localStorage.getItem(RECIPE_PAGE_SIZE_STORAGE_KEY);
    const parsed = Number(raw);
    if (RECIPE_PAGE_SIZE_OPTIONS.includes(parsed as (typeof RECIPE_PAGE_SIZE_OPTIONS)[number])) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return 12;
}

export function writeStoredPageSize(size: number): void {
  try {
    localStorage.setItem(RECIPE_PAGE_SIZE_STORAGE_KEY, String(size));
  } catch {
    /* ignore */
  }
}

/** Split preparation text into ordered steps when possible. */
export function parsePreparationSteps(preparation: string): string[] {
  const trimmed = preparation.trim();
  if (!trimmed) return [];

  const numbered = trimmed
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[).:-]\s*/, "").trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  const inline = trimmed
    .split(/(?=\d+[).:-]\s+)/)
    .map((part) => part.replace(/^\s*\d+[).:-]\s*/, "").trim())
    .filter(Boolean);

  return inline.length > 1 ? inline : [trimmed];
}

function matchesTimeFilter(minutes: number, filter: TimeFilter): boolean {
  if (!filter) return true;
  if (filter === "quick") return minutes < 30;
  if (filter === "medium") return minutes >= 30 && minutes <= 60;
  return minutes > 60;
}

function matchesCalorieFilter(calories: number | null, filter: CalorieFilter): boolean {
  if (!filter) return true;
  if (calories == null) return true;
  if (filter === "light") return calories < 400;
  if (filter === "medium") return calories >= 400 && calories <= 600;
  return calories > 600;
}

function difficultyRank(difficulty: Difficulty): number {
  if (difficulty === "easy") return 1;
  if (difficulty === "intermediate") return 2;
  return 3;
}

export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeCatalogFilters,
): Recipe[] {
  return recipes.filter((recipe) => {
    const meta = deriveRecipeMeta(recipe);
    if (filters.difficulty && meta.difficulty !== filters.difficulty) return false;
    if (!matchesTimeFilter(meta.timeMinutes, filters.time)) return false;
    if (!matchesCalorieFilter(meta.calories, filters.calories)) return false;
    return true;
  });
}

export function sortRecipes(
  recipes: Recipe[],
  sortKey: RecipeSortKey,
  matches: Map<string, GuestMatch> | null,
): Recipe[] {
  const sorted = [...recipes];
  sorted.sort((a, b) => {
    const metaA = deriveRecipeMeta(a);
    const metaB = deriveRecipeMeta(b);

    switch (sortKey) {
      case "best_match": {
        const pa = matches?.get(a.id)?.percent ?? 0;
        const pb = matches?.get(b.id)?.percent ?? 0;
        if (pb !== pa) return pb - pa;
        return a.name.localeCompare(b.name);
      }
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "category": {
        const cat = a.category.localeCompare(b.category);
        return cat !== 0 ? cat : a.name.localeCompare(b.name);
      }
      case "calories_asc": {
        const ca = metaA.calories ?? Number.MAX_SAFE_INTEGER;
        const cb = metaB.calories ?? Number.MAX_SAFE_INTEGER;
        return ca - cb || a.name.localeCompare(b.name);
      }
      case "calories_desc": {
        const ca = metaA.calories ?? -1;
        const cb = metaB.calories ?? -1;
        return cb - ca || a.name.localeCompare(b.name);
      }
      case "time_asc":
        return metaA.timeMinutes - metaB.timeMinutes || a.name.localeCompare(b.name);
      case "time_desc":
        return metaB.timeMinutes - metaA.timeMinutes || a.name.localeCompare(b.name);
      case "difficulty": {
        const da = difficultyRank(metaA.difficulty);
        const db = difficultyRank(metaB.difficulty);
        return da - db || a.name.localeCompare(b.name);
      }
      case "name_asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });
  return sorted;
}
