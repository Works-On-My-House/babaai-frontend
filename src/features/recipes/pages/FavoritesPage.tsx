import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { BrowseRecipeCard } from "@/features/recipes/components/BrowseRecipeCard";
import { CategoryFilterChips } from "@/features/recipes/components/CategoryFilterChips";
import { RecipeDetailModal } from "@/features/recipes/components/RecipeDetailModal";
import { useCategories } from "@/features/recipes/hooks/useCategories";
import { useFavorites } from "@/features/recipes/hooks/useFavorites";
import { recipeApi } from "@/features/recipes/services/recipeApi";
import { useAuth } from "@/features/auth/AuthContext";
import type { Recipe } from "@/features/recipes/types/recipe";
import { queryKeys } from "@/lib/queryKeys";

function matchesSearch(recipe: Recipe, term: string): boolean {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    recipe.name.toLowerCase().includes(needle) ||
    recipe.preparation.toLowerCase().includes(needle) ||
    recipe.ingredients.some((i) => i.product_name.toLowerCase().includes(needle))
  );
}

export function FavoritesPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const categories = useCategories();
  const favorites = useFavorites(!!token);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  const visible = useMemo(() => {
    return favorites.items.filter(
      (recipe) =>
        (!category || recipe.category === category) && matchesSearch(recipe, search),
    );
  }, [favorites.items, category, search]);

  const applyFavorite = useCallback(
    (recipeId: string, isFavorite: boolean, favCount: number) => {
      setOpenRecipe((current) =>
        current && current.id === recipeId
          ? { ...current, is_favorite: isFavorite, favorite_count: favCount }
          : current,
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

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold italic text-stone-900 dark:text-stone-100">
          {t("favorites.pageTitle")}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {favorites.total > 0
            ? t("favorites.pageCount", { count: favorites.total })
            : t("favorites.pageSubtitle")}
        </p>
      </header>

      {favorites.total > 0 && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex max-w-md items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-sm dark:border-stone-700 dark:bg-stone-800/80">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              className="w-full bg-transparent px-2 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
            />
          </div>

          {categories.length > 0 && (
            <CategoryFilterChips
              categories={categories}
              selected={category}
              onSelect={setCategory}
            />
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 p-12 text-center text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-400">
          {favorites.total === 0 ? t("home.noFavorites") : t("home.noResults")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <BrowseRecipeCard
                recipe={recipe}
                onOpen={handleOpen}
                onFavoriteChange={applyFavorite}
              />
            </div>
          ))}
        </div>
      )}

      <RecipeDetailModal
        recipe={openRecipe}
        onClose={() => setOpenRecipe(null)}
        onFavoriteChange={applyFavorite}
      />
    </div>
  );
}
