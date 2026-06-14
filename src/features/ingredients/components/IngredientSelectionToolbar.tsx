import { useTranslation } from "react-i18next";
import { DeleteOutlined, DoneAllOutlined } from "@mui/icons-material";
import { Button as MuiButton } from "@mui/material";

import { Button } from "@/components/ui/Button";

interface IngredientSelectionToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  pageCount: number;
  allOnPageSelected: boolean;
  onToggleSelectionMode: () => void;
  onSelectAllPage: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export function IngredientSelectionToolbar({
  selectionMode,
  selectedCount,
  pageCount,
  allOnPageSelected,
  onToggleSelectionMode,
  onSelectAllPage,
  onClearSelection,
  onDeleteSelected,
}: IngredientSelectionToolbarProps) {
  const { t } = useTranslation();

  if (!selectionMode) {
    return (
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={onToggleSelectionMode}>
          {t("ingredients.selectItems")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
        {t("ingredients.selectedCount", { count: selectedCount })}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={selectedCount === 0}>
          {t("ingredients.clearSelection")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSelectAllPage}
          disabled={pageCount === 0 || allOnPageSelected}
        >
          <DoneAllOutlined sx={{ fontSize: 16 }} />
          {t("ingredients.selectAllOnPage")}
        </Button>
        <MuiButton
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteOutlined />}
          disabled={selectedCount === 0}
          onClick={onDeleteSelected}
          sx={{ borderRadius: 2 }}
        >
          {t("ingredients.deleteSelected", { count: selectedCount })}
        </MuiButton>
        <Button variant="ghost" size="sm" onClick={onToggleSelectionMode}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
