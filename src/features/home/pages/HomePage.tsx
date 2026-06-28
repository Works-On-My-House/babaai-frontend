import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SiteHeader } from "@/components/SiteHeader";
import { SceneBackground } from "@/components/SceneBackground";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { useEntitlements } from "@/features/auth/useEntitlements";
import { HeroSection } from "@/features/home/components/HeroSection";
import { HomeSidebar } from "@/features/home/components/HomeSidebar";
import { PantryGlanceSection } from "@/features/home/components/PantryGlanceSection";
import { PriorityUseRow } from "@/features/home/components/PriorityUseRow";
import { computePantryStats, computeRecipeCoverage } from "@/features/home/lib/pantryStats";
import { pantryLastUpdated } from "@/features/home/lib/pantryLastUpdated";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { useMealPlan } from "@/features/mealPlan/hooks/useMealPlan";
import { startOfWeek } from "@/features/mealPlan/lib/week";
import { BrowseRecipeCard } from "@/features/recipes/components/BrowseRecipeCard";
import { PaginationControls } from "@/features/recipes/components/PaginationControls";
import { RecipeDetailModal } from "@/features/recipes/components/RecipeDetailModal";
import { TodayCard } from "@/features/recipes/components/TodayCard";
import { guestMatch, type GuestMatch } from "@/features/recipes/lib/guestMatch";
import { recipeApi } from "@/features/recipes/services/recipeApi";
import { useCategories } from "@/features/recipes/hooks/useCategories";
import { useFavorites } from "@/features/recipes/hooks/useFavorites";
import { useToday } from "@/features/recipes/hooks/useToday";
import type { PaginatedRecipes, Recipe, TodaySuggestions } from "@/features/recipes/types/recipe";
import { appEnv, ingredientPageSizeOptions } from "@/config/env";
import { queryKeys } from "@/lib/queryKeys";
import { useApiMessage } from "@/lib/translation/useApiMessage";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

function splitIngredients(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const PAGE_SIZE_OPTIONS = ingredientPageSizeOptions();

function filterRecipes(list: Recipe[], search: string, category: string): Recipe[] {
  const term = search.trim().toLowerCase();
  return list.filter((recipe) => {
    const matchesCategory = !category || recipe.category === category;
    const matchesSearch =
      !term ||
      recipe.name.toLowerCase().includes(term) ||
      recipe.preparation.toLowerCase().includes(term) ||
      recipe.ingredients.some((i) => i.product_name.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });
}

export function HomePage() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { isPremium } = useEntitlements();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const categories = useCategories();
  const favorites = useFavorites(!!token);
  const favoriteRecipes = favorites.items;
  const todayQuery = useToday(!!token, 6);

  const weekStart = startOfWeek();
  const pantryQuery = useIngredients(
    {
      page: 1,
      page_size: 500,
      sort_by: "expiration_date",
      sort_order: "asc",
    },
    !!token,
  );
  const mealPlanQuery = useMealPlan(weekStart, !!token && isPremium);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(appEnv.ingredientPageSize);
  const [pages, setPages] = useState(1);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [today, setToday] = useState<TodaySuggestions | null>(null);

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(
    () => searchParams.get("favorites") === "1",
  );
  const [myIngredients, setMyIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  const browseRef = useRef<HTMLDivElement>(null);
  const cookNowRef = useRef<HTMLDivElement>(null);
  const translatedError = useApiMessage(error);

  const pantryItems = pantryQuery.data?.items ?? [];
  const pantryStats = useMemo(
    () => (token ? computePantryStats(pantryItems) : null),
    [token, pantryItems],
  );

  const recipeCoverage = useMemo(() => {
    if (!today?.items) return { ready: 0, oneAway: 0, other: 0 };
    return computeRecipeCoverage(
      today.items.map((i) => ({
        can_prepare: i.can_prepare,
        missing_ingredients: i.missing_ingredients,
      })),
    );
  }, [today]);

  const readyRecipeCount = today?.items.filter((i) => i.can_prepare).length ?? 0;

  const pantryPeakItems = useMemo(() => {
    if (!pantryStats) return [];
    return pantryStats.expiringSoon.slice(0, 3).map((i) => i.name);
  }, [pantryStats]);

  const pantryLastUpdatedAt = useMemo(
    () => (token ? pantryLastUpdated(pantryItems) : null),
    [token, pantryItems],
  );

  const usingFavorites = favoritesOnly && !!token;
  const listParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search.trim() || undefined,
      category: category || undefined,
    }),
    [page, pageSize, search, category],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.recipes.list(listParams),
    queryFn: () => recipeApi.list(listParams),
    enabled: !usingFavorites,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
    if (searchParams.get("favorites") === "1") setFavoritesOnly(true);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [search, category, favoritesOnly, pageSize]);

  useEffect(() => {
    if (usingFavorites) {
      const filtered = filterRecipes(favoriteRecipes, search, category);
      const nextPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const currentPage = Math.min(page, nextPages);
      const start = (currentPage - 1) * pageSize;
      setRecipes(filtered.slice(start, start + pageSize));
      setCatalogTotal(filtered.length);
      setPages(nextPages);
      setError(null);
      setBrowseLoading(false);
      return;
    }
    if (listQuery.isLoading) {
      setBrowseLoading(true);
      return;
    }
    if (listQuery.error) {
      setRecipes([]);
      setCatalogTotal(0);
      setPages(1);
      setError(listQuery.error instanceof Error ? listQuery.error.message : "Failed to load recipes");
      setBrowseLoading(false);
      return;
    }
    if (listQuery.data) {
      setRecipes(listQuery.data.items);
      setCatalogTotal(listQuery.data.total);
      setPages(listQuery.data.pages);
      setError(null);
      setBrowseLoading(false);
    }
  }, [
    usingFavorites,
    favoriteRecipes,
    search,
    category,
    page,
    pageSize,
    listQuery.data,
    listQuery.isLoading,
    listQuery.error,
  ]);

  useEffect(() => {
    setToday(token ? todayQuery.data ?? null : null);
  }, [token, todayQuery.data]);

  const matches = useMemo(() => {
    if (myIngredients.length === 0) return null;
    const map = new Map<string, GuestMatch>();
    recipes.forEach((recipe) => map.set(recipe.id, guestMatch(recipe, myIngredients)));
    return map;
  }, [recipes, myIngredients]);

  const visibleRecipes = useMemo(() => {
    if (!matches) return recipes;
    return [...recipes].sort((a, b) => {
      const pa = matches.get(a.id)?.percent ?? 0;
      const pb = matches.get(b.id)?.percent ?? 0;
      if (pb !== pa) return pb - pa;
      return a.name.localeCompare(b.name);
    });
  }, [recipes, matches]);

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const applyFavorite = useCallback(
    (recipeId: string, isFavorite: boolean, favCount: number) => {
      const patch = (recipe: Recipe): Recipe =>
        recipe.id === recipeId
          ? { ...recipe, is_favorite: isFavorite, favorite_count: favCount }
          : recipe;

      setRecipes((current) => current.map(patch));
      setOpenRecipe((current) => (current ? patch(current) : current));
      setToday((current) =>
        current
          ? { ...current, items: current.items.map((item) => ({ ...item, recipe: patch(item.recipe) })) }
          : current,
      );

      if (!token) return;

      // Patch the cached recipe-list pages too. `recipes` is mirrored from this cache, so without
      // this the next refetch (e.g. the favorites invalidation below) re-runs the sync effect and
      // reverts the optimistic heart back to its stale, un-favorited cached value.
      queryClient.setQueriesData<PaginatedRecipes>(
        { queryKey: [...queryKeys.recipes.all, "list"] },
        (data) => (data ? { ...data, items: data.items.map(patch) } : data),
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.favorites });
    },
    [token, queryClient],
  );

  const handleOpen = useCallback((recipe: Recipe) => {
    setOpenRecipe(recipe);
    recipeApi
      .recordView(recipe.id)
      .then((updated) => {
        const patch = (item: Recipe): Recipe =>
          item.id === updated.id ? { ...item, view_count: updated.view_count } : item;
        setRecipes((current) => current.map(patch));
        setOpenRecipe((current) => (current ? patch(current) : current));
      })
      .catch(() => {
        /* view tracking is best-effort */
      });
  }, []);

  function addIngredients(raw: string) {
    const additions = splitIngredients(raw);
    if (additions.length === 0) return;
    setMyIngredients((current) => {
      const next = [...current];
      additions.forEach((value) => {
        if (!next.some((item) => item.toLowerCase() === value.toLowerCase())) {
          next.push(value);
        }
      });
      return next;
    });
    setIngredientInput("");
  }

  function removeIngredient(value: string) {
    setMyIngredients((current) => current.filter((item) => item !== value));
  }

  function scrollToBrowse() {
    browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToCookNow() {
    cookNowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <SceneBackground scene="kitchen">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
          <HeroSection
            userName={user?.username}
            recipeCount={readyRecipeCount}
            pantryPeakItems={pantryPeakItems}
            search={search}
            onSearchChange={setSearch}
            onSearch={scrollToBrowse}
            onBrowseRecipes={scrollToCookNow}
            showPantryHealth={!!token}
            pantryStats={pantryStats}
            isAuthenticated={!!token}
          />

          {error && !browseLoading && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {translatedError}
            </p>
          )}

          {token && pantryStats && (
            <PriorityUseRow items={pantryStats.expiringSoon} />
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div ref={cookNowRef} className="scroll-mt-20">
              {token && today ? (
                <section aria-labelledby="cook-now-heading">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h2
                        id="cook-now-heading"
                        className="font-display text-2xl font-semibold italic text-stone-900 dark:text-stone-100"
                      >
                        {t("home.cookNow.title")}
                      </h2>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {t("home.cookNow.subtitle")}
                      </p>
                    </div>
                    <Link
                      to="/recipes"
                      className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                    >
                      {t("home.cookNow.seeAll")} →
                    </Link>
                  </div>
                  {today.items.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {today.items.map((item, index) => (
                        <div
                          key={item.recipe.id}
                          className="animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TodayCard
                            item={item}
                            onOpen={handleOpen}
                            onFavoriteChange={applyFavorite}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-6 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
                      <p>{t("today.empty")}</p>
                      <Link
                        to="/ingredients"
                        className="mt-1 inline-block font-medium text-amber-700 hover:underline dark:text-amber-400"
                      >
                        {t("nav.pantry")}
                      </Link>
                    </div>
                  )}
                </section>
              ) : !token ? (
                <section className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-amber-50/60 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:from-stone-900/80 dark:to-stone-800/60 sm:p-8">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl" aria-hidden>
                      🧑‍🍳
                    </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold italic text-stone-900 dark:text-stone-100">
                    {t("home.explorerTitle")}
                  </h2>
                      <p className="mt-1 max-w-2xl text-sm text-stone-600 dark:text-stone-400">
                        {t("home.explorerDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addIngredients(ingredientInput);
                        }
                      }}
                      placeholder={t("home.explorerPlaceholder")}
                      className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    />
                    <Button onClick={() => addIngredients(ingredientInput)}>{t("home.explorerAdd")}</Button>
                    {myIngredients.length > 0 && (
                      <Button variant="ghost" onClick={() => setMyIngredients([])}>
                        {t("home.explorerClear")}
                      </Button>
                    )}
                  </div>

                  {myIngredients.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {myIngredients.map((item) => (
                        <span
                          key={item}
                          className="inline-flex animate-fade-in items-center gap-1.5 rounded-full bg-amber-100/90 py-1 pl-3 pr-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeIngredient(item)}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-amber-700 transition hover:bg-amber-200/80 dark:text-amber-300 dark:hover:bg-amber-800/60"
                            aria-label={t("common.delete")}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">{t("home.explorerHint")}</p>
                  )}

                  {myIngredients.length > 0 && (
                    <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {t("home.sortBest")}
                    </p>
                  )}
                </section>
              ) : null}
            </div>

            {token && (
              <HomeSidebar
                todayEntries={mealPlanQuery.data?.entries ?? []}
                mealPlanEnabled={isPremium}
                categories={categories}
                selectedCategory={category}
                onSelectCategory={(cat) => {
                  setCategory(cat);
                  scrollToBrowse();
                }}
              />
            )}
          </div>

          {token && pantryStats && (
            <PantryGlanceSection
              stats={pantryStats}
              coverage={recipeCoverage}
              lastUpdated={pantryLastUpdatedAt}
            />
          )}

          <section ref={browseRef} className="mt-12 scroll-mt-20">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-semibold italic text-stone-900 dark:text-stone-100">
                  {t("home.seasonal.title")}
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {browseLoading
                    ? t("recipes.loadingRecipes")
                    : t("home.recipesCount", { count: catalogTotal })}
                </p>
              </div>
              <Link
                to="/recipes"
                className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
              >
                {t("home.seasonal.allRecipes")} →
              </Link>
            </div>

            {browseLoading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: Math.min(pageSize, 6) }).map((_, index) => (
                  <div
                    key={index}
                    className="h-60 animate-pulse rounded-2xl border border-white/60 bg-white/60 dark:border-stone-700 dark:bg-stone-900/50"
                  />
                ))}
              </div>
            ) : visibleRecipes.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-stone-200 bg-white/50 p-10 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
                {favoritesOnly ? t("home.noFavorites") : t("home.noResults")}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  >
                    <BrowseRecipeCard
                      recipe={recipe}
                      match={matches?.get(recipe.id) ?? null}
                      onOpen={handleOpen}
                      onFavoriteChange={applyFavorite}
                    />
                  </div>
                ))}
              </div>
            )}

            {!browseLoading && (
              <PaginationControls
                page={page}
                pages={pages}
                total={catalogTotal}
                onPageChange={setPage}
                pageSize={pageSize}
                pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
                onPageSizeChange={setPageSize}
                label={t("recipes.pagination.recipes")}
              />
            )}
          </section>

          {!token && (
            <section className="mt-14 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-stone-900 to-stone-800 px-6 py-10 text-center text-white shadow-lg sm:px-12">
              <h2 className="text-2xl font-bold sm:text-3xl">{t("home.footerCta")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-stone-300">{t("home.footerCtaDesc")}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/register">
                  <Button size="lg">{t("nav.register")}</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary">
                    {t("nav.signIn")}
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </main>
      </SceneBackground>

      <RecipeDetailModal
        recipe={openRecipe}
        match={openRecipe ? matches?.get(openRecipe.id) ?? null : null}
        onClose={() => setOpenRecipe(null)}
        onFavoriteChange={applyFavorite}
      />
    </div>
  );
}
