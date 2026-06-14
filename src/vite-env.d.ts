/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_INGREDIENT_PAGE_SIZE: string;
  readonly VITE_RECIPE_CATALOG_PAGE_SIZE: string;
  readonly VITE_SUGGESTIONS_PAGE_SIZE: string;
  readonly VITE_HISTORY_PAGE_SIZE: string;
  readonly VITE_DEFAULT_MIN_MATCH_PERCENT: string;
  readonly VITE_LIBRETRANSLATE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
