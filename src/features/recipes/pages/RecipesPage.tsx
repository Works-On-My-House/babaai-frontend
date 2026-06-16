import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { appEnv } from "@/config/env";
import { Button } from "@/components/ui/Button";
import { ConfigGate } from "@/features/config/components/ConfigGate";
import type { PublicConfig } from "@/features/config/services/configApi";
import { ingredientApi } from "@/features/ingredients/services/ingredientApi";
import type { Ingredient } from "@/features/ingredients/types/ingredient";
import { IngredientPicker } from "@/features/recipes/components/IngredientPicker";
import { PaginationControls } from "@/features/recipes/components/PaginationControls";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeFilters } from "@/features/recipes/components/RecipeFilters";
import { AiProposalCard } from "@/features/recipes/components/AiProposalCard";
import { SuggestionCard } from "@/features/recipes/components/SuggestionCard";
import { useRecipes } from "@/features/recipes/hooks/useRecipes";
import { useSuggestions } from "@/features/recipes/hooks/useSuggestions";
import { useCategories } from "@/features/recipes/hooks/useCategories";
import type { Recipe } from "@/features/recipes/types/recipe";
import type { EntityId } from "@/types/entity";
import type { AppLanguage } from "@/i18n";
import { translateText } from "@/lib/translation/translateService";
import { useApiMessage } from "@/lib/translation/useApiMessage";

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
  const [catalogPage, setCatalogPage] = useState(1);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const categories = useCategories();
  const [minMatch, setMinMatch] = useState(appEnv.defaultMinMatchPercent);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<EntityId[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<EntityId[]>([]);
  const [pantryIngredients, setPantryIngredients] = useState<Ingredient[]>([]);
  const [pantryLoading, setPantryLoading] = useState(true);

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

  useEffect(() => {
    setPantryLoading(true);
    ingredientApi
      .list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" })
      .then((result) => setPantryIngredients(result.items))
      .catch(() => setPantryIngredients([]))
      .finally(() => setPantryLoading(false));
  }, []);

  const listParams = useMemo(
    () => ({
      page: catalogPage,
      page_size: appEnv.recipeCatalogPageSize,
      search: debouncedSearch || undefined,
      category: category || undefined,
    }),
    [catalogPage, debouncedSearch, category],
  );

  const { data: recipesData, loading: recipesLoading, error: recipesError } = useRecipes(listParams);
  const { data: suggestionsData, loading: suggestionsLoading, error: suggestionsError, generate } =
    useSuggestions();

  const translatedRecipesError = useApiMessage(recipesError);
  const translatedSuggestionsError = useApiMessage(suggestionsError);
  const translatedSuggestionMessage = useApiMessage(suggestionsData?.message ?? null);

  useEffect(() => {
    if (translatedRecipesError) toast.error(translatedRecipesError);
  }, [translatedRecipesError]);

  useEffect(() => {
    if (translatedSuggestionsError) toast.error(translatedSuggestionsError);
  }, [translatedSuggestionsError]);

  async function handleGenerate() {
    const result = await generate({
      min_match_percent: minMatch,
      limit: config.default_suggestion_limit,
      ingredient_ids: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
      recipe_ids: selectedRecipeIds.length > 0 ? selectedRecipeIds : undefined,
    });
    setSuggestionsPage(1);
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
      toast.success(
        t("recipes.foundAiProposals", { count: result.ai_proposals?.length ?? 0 }),
      );
    }
  }

  function toggleRecipeSelection(recipe: Recipe) {
    setSelectedRecipeIds((current) =>
      current.includes(recipe.id)
        ? current.filter((id) => id !== recipe.id)
        : [...current, recipe.id],
    );
  }

  const allSuggestions = suggestionsData?.suggestions ?? [];
  const aiProposals = suggestionsData?.ai_proposals ?? [];
  const suggestionPages = Math.max(
    1,
    Math.ceil(allSuggestions.length / appEnv.suggestionsPageSize),
  );
  const paginatedSuggestions = allSuggestions.slice(
    (suggestionsPage - 1) * appEnv.suggestionsPageSize,
    suggestionsPage * appEnv.suggestionsPageSize,
  );
  const recipes = recipesData?.items ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {t("recipes.title")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("recipes.subtitle")}</p>
        </div>
        <Link to="/recipes/history">
          <Button variant="secondary">{t("recipes.viewHistory")}</Button>
        </Link>
      </div>

      <section className="space-y-5 rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:from-stone-900/80 dark:to-stone-800/80">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("recipes.generateTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{t("recipes.generateDesc")}</p>
        </div>

        <IngredientPicker
          ingredients={pantryIngredients}
          selectedIds={selectedIngredientIds}
          onChange={setSelectedIngredientIds}
          loading={pantryLoading}
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

        {selectedRecipeIds.length > 0 && (
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t("recipes.filteringSelected", { count: selectedRecipeIds.length })}
          </p>
        )}

        {translatedSuggestionMessage && allSuggestions.length === 0 && !suggestionsLoading && (
          <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-stone-600 dark:bg-stone-900/70 dark:text-stone-400">
            {translatedSuggestionMessage}
          </p>
        )}

        {aiProposals.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {t("recipes.aiProposal.title")}
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {t("recipes.aiProposal.desc")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aiProposals.map((proposal) => (
                <AiProposalCard key={`${proposal.name}-${proposal.preparation.slice(0, 24)}`} proposal={proposal} />
              ))}
            </div>
          </div>
        )}

        {paginatedSuggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t("recipes.catalogMatches")}
            </h3>
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
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t("recipes.catalogTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("recipes.catalogDesc")}</p>
        </div>

        <RecipeFilters
          search={searchInput}
          category={category}
          categories={categories}
          onSearchChange={setSearchInput}
          onCategoryChange={(value) => {
            setCategory(value);
            setCatalogPage(1);
          }}
        />

        {selectedRecipeIds.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <span>{t("recipes.selectedCount", { count: selectedRecipeIds.length })}</span>
            <button
              type="button"
              onClick={() => setSelectedRecipeIds([])}
              className="font-medium hover:underline"
            >
              {t("recipes.clearSelection")}
            </button>
          </div>
        )}

        {recipesLoading && (
          <p className="text-sm text-stone-500 dark:text-stone-400">{t("recipes.loadingRecipes")}</p>
        )}

        {!recipesLoading && recipes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-8 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
            {t("recipes.noRecipes")}
          </div>
        )}

        {!recipesLoading && recipes.length > 0 && (
          <>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t("recipes.showing", { shown: recipes.length, total: recipesData?.total ?? 0 })}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  selected={selectedRecipeIds.includes(recipe.id)}
                  onSelect={toggleRecipeSelection}
                />
              ))}
            </div>
            <PaginationControls
              page={catalogPage}
              pages={recipesData?.pages ?? 1}
              total={recipesData?.total ?? 0}
              onPageChange={setCatalogPage}
              label={t("recipes.pagination.recipes")}
            />
          </>
        )}
      </section>
    </div>
  );
}
