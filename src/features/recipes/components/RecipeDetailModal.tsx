import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TranslatedText } from "@/components/TranslatedText";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { CookedItButton } from "@/features/recipes/components/CookedItButton";
import { FavoriteButton } from "@/features/recipes/components/FavoriteButton";
import { CategoryIconBadge } from "@/features/recipes/components/CategoryIcon";
import { NutritionPanel } from "@/features/recipes/components/NutritionPanel";
import { GenerateListButton } from "@/features/shoppingList/components/GenerateListButton";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";
import type { GuestMatch } from "@/features/recipes/lib/guestMatch";
import type { Recipe } from "@/features/recipes/types/recipe";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  match?: GuestMatch | null;
  onClose: () => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean, favoriteCount: number) => void;
}

export function RecipeDetailModal({ recipe, match, onClose, onFavoriteChange }: RecipeDetailModalProps) {
  const { t } = useTranslation();
  const { token } = useAuth();

  useEffect(() => {
    if (!recipe) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [recipe, onClose]);

  if (!recipe) return null;

  const visual = categoryVisual(recipe.category);
  const showMatch = match != null && match.total > 0 && match.have > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={recipe.name}
    >
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-stone-900/50 backdrop-blur-sm"
        aria-label={t("common.cancel")}
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl animate-slide-up flex-col overflow-hidden rounded-t-3xl border border-white/40 bg-white/95 shadow-2xl shadow-stone-900/20 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/95 sm:rounded-3xl">
        <div
          className={`relative flex items-center gap-4 bg-gradient-to-br ${visual.gradient} px-6 py-7 text-white`}
        >
          <CategoryIconBadge category={recipe.category} size="md" />
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
              <TranslatedText text={recipe.category} />
            </span>
            <h2 className="mt-1.5 text-2xl font-bold leading-tight drop-shadow-sm">
              <TranslatedText text={recipe.name} />
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/35"
            aria-label={t("common.cancel")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178a1 1 0 010 .644C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("recipes.meta.views", { count: recipe.view_count })}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {t("recipes.meta.favorites", { count: recipe.favorite_count })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {token && <CookedItButton recipeId={recipe.id} />}
              <FavoriteButton
                recipeId={recipe.id}
                isFavorite={recipe.is_favorite}
                favoriteCount={recipe.favorite_count}
                variant="plain"
                showCount
                onChange={(isFavorite, favoriteCount) =>
                  onFavoriteChange?.(recipe.id, isFavorite, favoriteCount)
                }
              />
            </div>
          </div>

          {showMatch && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="font-medium">{t("home.matchLabel", { percent: match!.percent })}</span>
              <span>{t("home.haveCount", { have: match!.have, total: match!.total })}</span>
            </div>
          )}

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t("recipes.requiredIngredients")}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {recipe.ingredients.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/80 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
                >
                  <span className="text-stone-700 dark:text-stone-200">
                    <TranslatedText text={item.product_name} />
                  </span>
                  <span className="shrink-0 font-medium text-stone-500 dark:text-stone-400">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
            {token && (
              <div className="mt-3 flex justify-end">
                <GenerateListButton
                  input={{ recipe_id: recipe.id }}
                  label={t("shoppingList.addMissingFromRecipe")}
                />
              </div>
            )}
          </section>

          <NutritionPanel nutrition={recipe.nutrition} />

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t("home.preparation")}
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              <TranslatedText text={recipe.preparation} />
            </p>
          </section>

          {!token && (
            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/90 p-5 text-center dark:border-amber-800/40 dark:from-amber-950/40 dark:to-orange-950/30">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                {t("home.loginToSuggest")}
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Link to="/register">
                  <Button size="sm">{t("nav.register")}</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    {t("nav.signIn")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
