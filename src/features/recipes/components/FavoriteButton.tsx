import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/AuthContext";
import { recipeApi } from "@/features/recipes/services/recipeApi";

interface FavoriteButtonProps {
  recipeId: string;
  isFavorite: boolean;
  favoriteCount?: number;
  showCount?: boolean;
  variant?: "overlay" | "plain";
  onChange?: (isFavorite: boolean, favoriteCount: number) => void;
}

export function FavoriteButton({
  recipeId,
  isFavorite,
  favoriteCount,
  showCount = false,
  variant = "overlay",
  onChange,
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (!token) {
      toast.info(t("recipes.favorites.signInToSave"));
      navigate("/login");
      return;
    }

    setBusy(true);
    try {
      const result = isFavorite
        ? await recipeApi.removeFavorite(recipeId)
        : await recipeApi.addFavorite(recipeId);
      onChange?.(result.is_favorite, result.favorite_count);
      toast.success(
        result.is_favorite ? t("recipes.favorites.added") : t("recipes.favorites.removed"),
      );
    } catch {
      toast.error(t("recipes.favorites.failed"));
    } finally {
      setBusy(false);
    }
  }

  const base =
    variant === "overlay"
      ? "bg-white/85 text-stone-600 shadow-sm hover:bg-white dark:bg-stone-900/80 dark:text-stone-300"
      : "bg-transparent text-stone-500 hover:bg-stone-100/80 dark:text-stone-300 dark:hover:bg-stone-800";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t("recipes.favorites.remove") : t("recipes.favorites.add")}
      title={isFavorite ? t("recipes.favorites.remove") : t("recipes.favorites.add")}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium transition active:scale-90 disabled:opacity-60 ${base}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4.5 w-4.5 transition ${isFavorite ? "text-rose-500" : ""}`}
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        style={{ height: "1.15rem", width: "1.15rem" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {showCount && favoriteCount != null && favoriteCount > 0 && (
        <span className="text-xs tabular-nums">{favoriteCount}</span>
      )}
    </button>
  );
}
