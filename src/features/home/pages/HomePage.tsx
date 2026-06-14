import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SiteHeader } from "@/components/SiteHeader";
import { SceneBackground } from "@/components/SceneBackground";
import { TranslatedText } from "@/components/TranslatedText";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { BrowseRecipeCard } from "@/features/recipes/components/BrowseRecipeCard";
import { CategoryFilterChips } from "@/features/recipes/components/CategoryFilterChips";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { DailyPickCard } from "@/features/recipes/components/DailyPickCard";
import { PaginationControls } from "@/features/recipes/components/PaginationControls";
import { RecipeDetailModal } from "@/features/recipes/components/RecipeDetailModal";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import { guestMatch, type GuestMatch } from "@/features/recipes/lib/guestMatch";
import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { DailyPicksResponse, Recipe } from "@/features/recipes/types/recipe";
import { appEnv, ingredientPageSizeOptions } from "@/config/env";
import { useApiMessage } from "@/lib/translation/useApiMessage";

function splitIngredients(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const PAGE_SIZE_OPTIONS = ingredientPageSizeOptions();

function filterRecipes(
  list: Recipe[],
  search: string,
  category: string,
): Recipe[] {
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
  const { token } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(appEnv.ingredientPageSize);
  const [pages, setPages] = useState(1);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  const [featured, setFeatured] = useState<Recipe | null>(null);
  const [daily, setDaily] = useState<DailyPicksResponse | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [myIngredients, setMyIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  const browseRef = useRef<HTMLDivElement>(null);
  const translatedError = useApiMessage(error);
  const translatedDailyMessage = useApiMessage(daily?.message ?? null);

  useEffect(() => {
    let cancelled = false;
    recipeApi
      .categories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setFavoriteCount(0);
      setFavoriteRecipes([]);
      return;
    }
    let cancelled = false;
    recipeApi
      .favorites()
      .then((result) => {
        if (!cancelled) {
          setFavoriteCount(result.total);
          setFavoriteRecipes(result.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteCount(0);
          setFavoriteRecipes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [search, category, favoritesOnly, pageSize]);

  useEffect(() => {
    let cancelled = false;
    setBrowseLoading(true);

    if (favoritesOnly && token) {
      const filtered = filterRecipes(favoriteRecipes, search, category);
      const nextPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const currentPage = Math.min(page, nextPages);
      const start = (currentPage - 1) * pageSize;
      if (!cancelled) {
        setRecipes(filtered.slice(start, start + pageSize));
        setCatalogTotal(filtered.length);
        setPages(nextPages);
        setBrowseLoading(false);
        setError(null);
      }
      return () => {
        cancelled = true;
      };
    }

    recipeApi
      .list({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        category: category || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        setRecipes(result.items);
        setCatalogTotal(result.total);
        setPages(result.pages);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRecipes([]);
        setCatalogTotal(0);
        setPages(1);
        setError(err instanceof Error ? err.message : "Failed to load recipes");
      })
      .finally(() => {
        if (!cancelled) setBrowseLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, category, favoritesOnly, token, favoriteRecipes]);

  useEffect(() => {
    let cancelled = false;
    recipeApi
      .featured()
      .then((recipe) => {
        if (!cancelled) setFeatured(recipe);
      })
      .catch(() => {
        if (!cancelled) setFeatured(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setDaily(null);
      return;
    }
    let cancelled = false;
    recipeApi
      .daily(4)
      .then((result) => {
        if (!cancelled) setDaily(result);
      })
      .catch(() => {
        if (!cancelled) setDaily(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const matches = useMemo(() => {
    if (myIngredients.length === 0) return null;
    const map = new Map<string, GuestMatch>();
    recipes.forEach((recipe) => map.set(recipe.id, guestMatch(recipe, myIngredients)));
    return map;
  }, [recipes, myIngredients]);

  const recipeOfDay = featured;

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
      setFeatured((current) => (current ? patch(current) : current));
      setOpenRecipe((current) => (current ? patch(current) : current));
      setDaily((current) =>
        current
          ? { ...current, items: current.items.map((item) => ({ ...item, recipe: patch(item.recipe) })) }
          : current,
      );

      if (!token) return;
      void recipeApi.favorites().then((result) => {
        setFavoriteCount(result.total);
        setFavoriteRecipes(result.items);
      });
    },
    [token],
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
        setFeatured((current) => (current ? patch(current) : current));
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <SceneBackground scene="kitchen">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-rose-500/95 px-6 py-12 text-white shadow-xl shadow-orange-500/25 backdrop-blur-sm sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              ✨ {t("home.heroBadge")}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight drop-shadow-sm sm:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lg shadow-orange-900/10 backdrop-blur">
              <span className="pl-3 text-stone-400" aria-hidden>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") scrollToBrowse();
                }}
                placeholder={t("home.searchPlaceholder")}
                className="w-full bg-transparent px-2 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
              />
              <Button size="md" variant="primary" onClick={scrollToBrowse}>
                {t("common.search")}
              </Button>
            </div>

            {!token && (
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" variant="secondary">
                    {t("home.unlockAi")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {error && !browseLoading && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {translatedError}
          </p>
        )}

        {/* Personalised daily picks (logged in) */}
        {token && daily && (
          <section className="mt-10">
            <div className="mb-3">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {t("home.dailyTitle")}
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {translatedDailyMessage || t("home.dailyDesc")}
              </p>
            </div>
            {daily.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {daily.items.map((pick, index) => (
                  <div
                    key={pick.recipe.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DailyPickCard pick={pick} onOpen={handleOpen} onFavoriteChange={applyFavorite} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-6 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
                {t("home.dailyEmpty")}{" "}
                <Link to="/ingredients" className="font-medium text-amber-700 hover:underline dark:text-amber-400">
                  {t("nav.ingredients")}
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Recipe of the day */}
        {recipeOfDay && (
          <section className="mt-10">
            <div className="mb-3">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {t("home.recipeOfDay")}
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {t("home.recipeOfDayDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpen(recipeOfDay)}
              className="group flex w-full flex-col items-stretch overflow-hidden rounded-3xl border border-white/60 bg-white/70 text-left shadow-sm backdrop-blur-md transition hover:shadow-lg dark:border-stone-700 dark:bg-stone-900/70 sm:flex-row"
            >
              <div
                className={`relative flex items-center justify-center bg-gradient-to-br ${
                  categoryVisual(recipeOfDay.category).gradient
                } px-10 py-10 sm:w-64`}
              >
                <CategoryIconBadge
                  category={recipeOfDay.category}
                  size="xl"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-6">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-fit rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    <TranslatedText text={recipeOfDay.category} />
                  </span>
                  {recipeOfDay.favorite_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-500">
                      ♥ {recipeOfDay.favorite_count}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                  <TranslatedText text={recipeOfDay.name} />
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
                  <TranslatedText text={recipeOfDay.preparation} />
                </p>
                <span className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("home.viewRecipe")} →
                </span>
              </div>
            </button>
          </section>
        )}

        {/* Guest kitchen explorer */}
        {!token && (
          <section className="mt-10 rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-amber-50/60 p-6 shadow-sm backdrop-blur-md dark:border-stone-700 dark:from-stone-900/80 dark:to-stone-800/60 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden>
                🧑‍🍳
              </span>
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
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

            <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl bg-white/70 p-4 dark:bg-stone-900/60 sm:flex-row sm:items-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">{t("home.explorerCta")}</p>
              <Link to="/register" className="shrink-0">
                <Button>{t("home.explorerCtaButton")}</Button>
              </Link>
            </div>
          </section>
        )}

        {/* Browse catalog */}
        <section ref={browseRef} className="mt-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {t("home.browseTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {browseLoading
              ? t("recipes.loadingRecipes")
              : t("home.recipesCount", { count: catalogTotal })}
          </p>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="mt-5">
              <CategoryFilterChips
                categories={categories}
                selected={category}
                onSelect={setCategory}
                trailing={
                  token ? (
                    <button
                      type="button"
                      onClick={() => setFavoritesOnly((value) => !value)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                        favoritesOnly
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                          : "border border-stone-200 bg-white/70 text-stone-600 hover:border-rose-300 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300"
                      }`}
                    >
                      <span aria-hidden>♥</span>
                      {t("home.favoritesOnly", { count: favoriteCount })}
                    </button>
                  ) : undefined
                }
              />
            </div>
          )}

          {/* Grid */}
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

        {/* Footer CTA */}
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
