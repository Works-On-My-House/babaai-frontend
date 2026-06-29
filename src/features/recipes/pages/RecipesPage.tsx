import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ConfigGate } from "@/features/config/components/ConfigGate";
import type { PublicConfig } from "@/features/config/services/configApi";
import { useAuth } from "@/features/auth/AuthContext";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { IngredientPicker } from "@/features/recipes/components/IngredientPicker";
import { AiProposalCard } from "@/features/recipes/components/AiProposalCard";
import { BrowseRecipeCard } from "@/features/recipes/components/BrowseRecipeCard";
import { CategoryFilterChips } from "@/features/recipes/components/CategoryFilterChips";
import { PaginationControls } from "@/features/recipes/components/PaginationControls";
import { RecipeCatalogToolbar } from "@/features/recipes/components/RecipeCatalogToolbar";
import { RecipeDetailModal } from "@/features/recipes/components/RecipeDetailModal";
import { RecipeListCard } from "@/features/recipes/components/RecipeListCard";
import { SuggestionCard } from "@/features/recipes/components/SuggestionCard";
import { useCategories } from "@/features/recipes/hooks/useCategories";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useSuggestions } from "@/features/recipes/hooks/useSuggestions";
import { guestMatch } from "@/features/recipes/lib/guestMatch";
import {
  filterRecipes,
  getRecipeRating,
  readStoredPageSize,
  readStoredViewMode,
  RECIPE_PAGE_SIZE_OPTIONS,
  sortRecipes,
  writeStoredPageSize,
  writeStoredViewMode,
  type CalorieFilter,
  type DifficultyFilter,
  type RecipeCatalogFilters,
  type RecipeSortKey,
  type RecipeViewMode,
  type TimeFilter,
} from "@/features/recipes/lib/recipeCatalog";
import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { Recipe } from "@/features/recipes/types/recipe";
import type { EntityId } from "@/types/entity";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";
import { useApiMessage } from "@/lib/translation/useApiMessage";
import { appEnv } from "@/config/env";

const SEARCH_DEBOUNCE_MS = 350;

export function RecipesPage() {
  return (
    <ConfigGate>
      {(config) => <RecipesPageContent config={config} />}
    </ConfigGate>
  );
}

function RecipesPageContent({ config }: { config: PublicConfig }) {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const categories = useCategories();

  const [catalogPage, setCatalogPage] = useState(1);
  const [pageSize, setPageSize] = useState(readStoredPageSize);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<RecipeSortKey>("best_match");
  const [viewMode, setViewMode] = useState<RecipeViewMode>(readStoredViewMode);
  const [filters, setFilters] = useState<RecipeCatalogFilters>({
    difficulty: "",
    time: "",
    calories: "",
  });
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  // AI suggestions (secondary, collapsible)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [minMatch, setMinMatch] = useState(appEnv.defaultMinMatchPercent);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<EntityId[]>([]);

  const pantryQuery = useIngredients(
    { page: 1, page_size: 500, sort_by: "name", sort_order: "asc" },
    !!token,
  );
  const pantryIngredients = useMemo(
    () => pantryQuery.data?.items ?? [],
    [pantryQuery.data?.items],
  );

  useEffect(() => {
    setMinMatch(config.default_min_match_percent);
  }, [config.default_min_match_percent]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCatalogPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = useMemo(
    () => ({
      page: catalogPage,
      page_size: pageSize,
      search: debouncedSearch || undefined,
      category: category || undefined,
    }),
    [catalogPage, pageSize, debouncedSearch, category],
  );

  const { data: recipesData, loading: recipesLoading, error: recipesError } = useRecipes(listParams);
  const { data: suggestionsData, loading: suggestionsLoading, error: suggestionsError, generate } =
    useSuggestions();

  const translatedRecipesError = useApiMessage(recipesError);
  const translatedSuggestionsError = useApiMessage(suggestionsError);
  const translatedSuggestionMessage = useApiMessage(suggestionsData?.message ?? null);
  const translatedAiMessage = useApiMessage(suggestionsData?.ai_message ?? null);

  useEffect(() => {
    if (translatedRecipesError) toast.error(translatedRecipesError);
  }, [translatedRecipesError]);

  useEffect(() => {
    if (translatedSuggestionsError) toast.error(translatedSuggestionsError);
  }, [translatedSuggestionsError]);

  const pantryTokens = useMemo(
    () => pantryIngredients.map((item) => item.name),
    [pantryIngredients],
  );

  const matches = useMemo(() => {
    if (pantryTokens.length === 0) return null;
    const map = new Map<string, ReturnType<typeof guestMatch>>();
    for (const recipe of recipesData?.items ?? []) {
      map.set(recipe.id, guestMatch(recipe, pantryTokens));
    }
    return map;
  }, [recipesData?.items, pantryTokens]);

  const visibleRecipes = useMemo(() => {
    const items = recipesData?.items ?? [];
    const filtered = filterRecipes(items, filters);
    return sortRecipes(filtered, sort, matches);
  }, [recipesData?.items, filters, sort, matches]);

  const catalogRating = useCallback((recipe: Recipe) => getRecipeRating(recipe), []);

  const applyFavorite = useCallback(
    (recipeId: string, isFavorite: boolean, favCount: number) => {
      const patch = (recipe: Recipe) =>
        recipe.id === recipeId
          ? { ...recipe, is_favorite: isFavorite, favorite_count: favCount }
          : recipe;

      setOpenRecipe((current) =>
        current && current.id === recipeId
          ? { ...current, is_favorite: isFavorite, favorite_count: favCount }
          : current,
      );

      queryClient.setQueriesData(
        { queryKey: [...queryKeys.recipes.all, "list"] },
        (data: { items: Recipe[] } | undefined) =>
          data ? { ...data, items: data.items.map(patch) } : data,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.favorites });
    },
    [queryClient],
  );

  const handleOpen = useCallback((recipe: Recipe) => {
    setOpenRecipe(recipe);
    recipeApi.recordView(recipe.id).catch(() => {
      /* view tracking is best-effort */
    });
  }, []);

  const handleViewModeChange = useCallback((mode: RecipeViewMode) => {
    setViewMode(mode);
    writeStoredViewMode(mode);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    writeStoredPageSize(size);
    setCatalogPage(1);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof RecipeCatalogFilters>(key: K, value: RecipeCatalogFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      setCatalogPage(1);
    },
    [],
  );

  async function handleGenerate() {
    const result = await generate({
      min_match_percent: minMatch,
      limit: config.default_suggestion_limit,
      ingredient_ids: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
    });
    setSuggestionsPage(1);
    setSuggestionsOpen(true);
    if (result?.total === 0 && result.message) {
      const language = i18n.language as AppLanguage;
      const message =
        language === "en"
          ? result.message
          : await translateText(result.message, language, "en");
      toast.info(message);
    } else if (result && result.total > 0) {
      toast.success(t("recipes.foundSuggestions", { count: result.total }));
    } else if (result && (result.ai_proposals?.length ?? 0) > 0) {
      toast.success(t("recipes.foundAiProposals", { count: result.ai_proposals?.length ?? 0 }));
    }
  }

  const allSuggestions = suggestionsData?.suggestions ?? [];
  const aiProposals = suggestionsData?.ai_proposals ?? [];
  const suggestionPages = Math.max(1, Math.ceil(allSuggestions.length / appEnv.suggestionsPageSize));
  const paginatedSuggestions = allSuggestions.slice(
    (suggestionsPage - 1) * appEnv.suggestionsPageSize,
    suggestionsPage * appEnv.suggestionsPageSize,
  );

  const total = recipesData?.total ?? 0;
  const sublineKey =
    token && pantryTokens.length > 0 ? "recipes.catalog.sublinePantry" : "recipes.catalog.subline";

  return (
    <div className="space-y-8">
      <header className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/40 bg-white/55 px-6 py-8 shadow-xl shadow-stone-900/10 backdrop-blur-md dark:border-stone-700/60 dark:bg-stone-900/45 lg:flex-row lg:items-end lg:justify-between sm:px-10 sm:py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300/90">
            {t("recipes.catalog.eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold italic text-stone-900 drop-shadow-sm dark:text-white sm:text-5xl">
            {t("recipes.catalog.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-stone-600 dark:text-stone-200/90 sm:text-base">
            {t(sublineKey, { count: total })}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-lg shadow-stone-900/20 backdrop-blur dark:border-stone-700 dark:bg-stone-800/90">
            <span className="pl-3 text-stone-400" aria-hidden>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("recipes.catalog.searchPlaceholder")}
              className="w-full bg-transparent px-2 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
            />
          </div>
          <Link to="/recipes/history" className="shrink-0">
            <Button variant="secondary">{t("recipes.viewHistory")}</Button>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        {categories.length > 0 && (
          <CategoryFilterChips
            categories={categories}
            selected={category}
            onSelect={(value) => {
              setCategory(value);
              setCatalogPage(1);
            }}
          />
        )}

        <RecipeCatalogToolbar
          sort={sort}
          difficulty={filters.difficulty}
          time={filters.time}
          calories={filters.calories}
          viewMode={viewMode}
          onSortChange={(value) => {
            setSort(value);
            setCatalogPage(1);
          }}
          onDifficultyChange={(value) => updateFilter("difficulty", value as DifficultyFilter)}
          onTimeChange={(value) => updateFilter("time", value as TimeFilter)}
          onCaloriesChange={(value) => updateFilter("calories", value as CalorieFilter)}
          onViewModeChange={handleViewModeChange}
        />

        {recipesLoading && (
          <p className="text-sm text-stone-500 dark:text-stone-400">{t("recipes.loadingRecipes")}</p>
        )}

        {!recipesLoading && visibleRecipes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-12 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
            {t("recipes.noRecipes")}
          </div>
        )}

        {!recipesLoading && visibleRecipes.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  >
                    <BrowseRecipeCard
                      recipe={recipe}
                      match={matches?.get(recipe.id) ?? null}
                      rating={catalogRating(recipe)}
                      onOpen={handleOpen}
                      onFavoriteChange={applyFavorite}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleRecipes.map((recipe) => (
                  <RecipeListCard
                    key={recipe.id}
                    recipe={recipe}
                    match={matches?.get(recipe.id) ?? null}
                    rating={catalogRating(recipe)}
                    onOpen={handleOpen}
                    onFavoriteChange={applyFavorite}
                  />
                ))}
              </div>
            )}

            <PaginationControls
              page={catalogPage}
              pages={recipesData?.pages ?? 1}
              total={total}
              onPageChange={setCatalogPage}
              label={t("recipes.pagination.recipes")}
              pageSize={pageSize}
              pageSizeOptions={[...RECIPE_PAGE_SIZE_OPTIONS]}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </section>

      <details
        className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 dark:border-stone-700 dark:bg-stone-900/50"
        open={suggestionsOpen}
        onToggle={(e) => setSuggestionsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none text-lg font-semibold text-stone-900 dark:text-stone-100 [&::-webkit-details-marker]:hidden">
          {t("recipes.generateTitle")}
        </summary>
        <div className="mt-4 space-y-5">
          <p className="text-sm text-stone-600 dark:text-stone-400">{t("recipes.generateDesc")}</p>

          <IngredientPicker
            ingredients={pantryIngredients}
            selectedIds={selectedIngredientIds}
            onChange={setSelectedIngredientIds}
            loading={pantryQuery.loading}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              {t("recipes.minMatch")}
              <select
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              >
                <option value={25}>25%</option>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
              </select>
            </label>
            <Button onClick={() => void handleGenerate()} disabled={suggestionsLoading} size="lg">
              {suggestionsLoading ? t("recipes.generating") : t("recipes.generate")}
            </Button>
          </div>

          {translatedSuggestionMessage && allSuggestions.length === 0 && !suggestionsLoading && (
            <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:bg-stone-800/70 dark:text-stone-400">
              {translatedSuggestionMessage}
            </p>
          )}

          {translatedAiMessage && aiProposals.length === 0 && !suggestionsLoading && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              {translatedAiMessage}
            </p>
          )}

          {aiProposals.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {aiProposals.map((proposal) => (
                <AiProposalCard key={`${proposal.name}-${proposal.preparation.slice(0, 24)}`} proposal={proposal} />
              ))}
            </div>
          )}

          {paginatedSuggestions.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {paginatedSuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.recipe_id} suggestion={suggestion} />
                ))}
              </div>
              <PaginationControls
                page={suggestionsPage}
                pages={suggestionPages}
                total={allSuggestions.length}
                onPageChange={setSuggestionsPage}
                label={t("recipes.pagination.suggestions")}
              />
            </div>
          )}
        </div>
      </details>

      <RecipeDetailModal
        recipe={openRecipe}
        match={openRecipe ? matches?.get(openRecipe.id) ?? null : null}
        onClose={() => setOpenRecipe(null)}
        onFavoriteChange={applyFavorite}
      />
    </div>
  );
}
