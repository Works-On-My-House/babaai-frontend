import { useTranslation } from "react-i18next";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Checkbox, IconButton, Tooltip } from "@mui/material";

import { Button } from "@/components/ui/Button";
import { TranslatedText } from "@/components/TranslatedText";
import { ingredientCategoryVisual } from "@/features/ingredients/lib/ingredientCategoryVisual";
import type { Ingredient } from "@/features/ingredients/types/ingredient";

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (ingredient: Ingredient) => void;
}

function formatDate(iso: string | null, noExpiryLabel: string): string {
  if (!iso) return noExpiryLabel;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpiringSoon(iso: string | null): boolean {
  if (!iso) return false;
  const diff = new Date(iso).getTime() - Date.now();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date(new Date().toDateString());
}

export function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: IngredientCardProps) {
  const { t } = useTranslation();
  const expired = isExpired(ingredient.expiration_date);
  const expiringSoon = isExpiringSoon(ingredient.expiration_date);
  const visual = ingredientCategoryVisual(ingredient.category);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white/80 shadow-sm shadow-stone-900/5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-stone-900/80 ${
        selected
          ? "border-amber-400 ring-2 ring-amber-400/50 dark:border-amber-500 dark:ring-amber-500/40"
          : expired
            ? "border-red-300/90 ring-1 ring-red-400/30 dark:border-red-800/60 dark:ring-red-900/40"
            : "border-white/60 hover:border-amber-200/80 hover:shadow-amber-500/10 dark:border-stone-700 dark:hover:border-amber-700/50"
      }`}
    >
      <div
        className={`flex items-center gap-3 bg-gradient-to-r px-4 py-3 ${visual.gradient}`}
      >
        {selectionMode && (
          <Checkbox
            checked={selected}
            onChange={() => onToggleSelect?.(ingredient)}
            size="small"
            sx={{
              p: 0.5,
              color: "rgba(255,255,255,0.85)",
              "&.Mui-checked": { color: "#fff" },
            }}
            slotProps={{
              input: {
                "aria-label": t("ingredients.selectItem", { name: ingredient.name }),
              },
            }}
          />
        )}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 text-2xl shadow-inner backdrop-blur-sm">
          {visual.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white drop-shadow-sm">
            <TranslatedText text={ingredient.name} />
          </h3>
          <span className="text-xs font-medium text-white/90">
            <TranslatedText text={ingredient.category} />
          </span>
        </div>
        {expired && (
          <span className="shrink-0 rounded-full border border-red-900/20 bg-red-700 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white shadow-md shadow-red-950/30">
            {t("ingredients.expiredBadge")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <dl className="mb-4 flex-1 space-y-1.5 text-sm text-stone-600 dark:text-stone-400">
          <div className="flex justify-between">
            <dt>{t("ingredients.quantity")}</dt>
            <dd className="font-medium text-stone-800 dark:text-stone-200">
              {ingredient.quantity} {ingredient.unit}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("ingredients.expires")}</dt>
            <dd
              className={`font-medium ${
                expired
                  ? "text-red-600 dark:text-red-400"
                  : expiringSoon
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-stone-800 dark:text-stone-200"
              }`}
            >
              {formatDate(ingredient.expiration_date, t("ingredients.noExpiry"))}
            </dd>
          </div>
        </dl>

        {ingredient.notes && (
          <p className="mb-4 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
            <TranslatedText text={ingredient.notes} />
          </p>
        )}

        <div className="flex items-center gap-1 border-t border-stone-100 pt-3 dark:border-stone-700">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(ingredient)}
          >
            <EditOutlined sx={{ fontSize: 16 }} />
            {t("common.edit")}
          </Button>
          <Tooltip title={t("common.delete")}>
            <IconButton
              size="small"
              color="error"
              aria-label={t("common.delete")}
              onClick={() => onDelete(ingredient)}
              sx={{ ml: 0.5 }}
              disabled={selectionMode}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
