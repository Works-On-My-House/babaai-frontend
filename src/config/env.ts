const ENV_FILE_HINT = "Copy .env.example to .env and set all required VITE_* variables.";

function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}. ${ENV_FILE_HINT}`);
  }
  return value.trim();
}

function requireNumber(name: string): number {
  const raw = requireEnv(name);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for ${name}: "${raw}". ${ENV_FILE_HINT}`);
  }
  return parsed;
}

/** Validated at module load — import this module early (e.g. from main.tsx). */
export const apiBaseUrl = requireEnv("VITE_API_BASE_URL");

export const appEnv = {
  ingredientPageSize: requireNumber("VITE_INGREDIENT_PAGE_SIZE"),
  recipeCatalogPageSize: requireNumber("VITE_RECIPE_CATALOG_PAGE_SIZE"),
  suggestionsPageSize: requireNumber("VITE_SUGGESTIONS_PAGE_SIZE"),
  historyPageSize: requireNumber("VITE_HISTORY_PAGE_SIZE"),
  defaultMinMatchPercent: requireNumber("VITE_DEFAULT_MIN_MATCH_PERCENT"),
};

export function ingredientPageSizeOptions(): number[] {
  const configured = appEnv.ingredientPageSize;
  const options = new Set([10, 20, 50, 100, configured]);
  return [...options].sort((a, b) => a - b);
}
