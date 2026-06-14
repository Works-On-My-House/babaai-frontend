import { useTranslation } from "react-i18next";
import { ShoppingBasketOutlined } from "@mui/icons-material";
import { Button as MuiButton } from "@mui/material";

interface EmptyStateProps {
  onAdd: () => void;
  hasFilters: boolean;
}

export function EmptyState({ onAdd, hasFilters }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-6 py-16 text-center backdrop-blur-sm dark:border-amber-800/40 dark:bg-stone-900/60">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
        <ShoppingBasketOutlined sx={{ fontSize: 36, color: "warning.main" }} />
      </div>
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
        {hasFilters ? t("ingredients.emptyFilteredTitle") : t("ingredients.emptyTitle")}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        {hasFilters ? t("ingredients.emptyFilteredDesc") : t("ingredients.emptyDesc")}
      </p>
      {!hasFilters && (
        <MuiButton
          variant="contained"
          startIcon={<ShoppingBasketOutlined />}
          onClick={onAdd}
          sx={{ mt: 3, borderRadius: 2 }}
        >
          {t("ingredients.add")}
        </MuiButton>
      )}
    </div>
  );
}
