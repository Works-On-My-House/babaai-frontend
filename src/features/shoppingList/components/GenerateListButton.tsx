import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { AddShoppingCartOutlined } from "@mui/icons-material";

import type { GenerateShoppingListInput } from "@/features/shoppingList/types/shoppingList";
import { useShoppingListMutations } from "@/features/shoppingList/hooks/useShoppingListMutations";

interface GenerateListButtonProps {
  /** What to put on the list — a recipe, a set of suggestions, and/or explicit product names. */
  input: GenerateShoppingListInput;
  /** Optional override label; defaults to "Add missing to shopping list". */
  label?: string;
  variant?: "solid" | "subtle";
  className?: string;
}

/**
 * Entry-point action that turns a recipe's / suggestion's missing ingredients into a shopping list
 * (ClickUp 869dpd7jd). Rendered inside clickable cards, so it stops click propagation. The success
 * toast comes from the generate mutation.
 */
export function GenerateListButton({
  input,
  label,
  variant = "subtle",
  className = "",
}: GenerateListButtonProps) {
  const { t } = useTranslation();
  const { generate } = useShoppingListMutations();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (generate.isPending) return;
    generate.mutate(input);
  }

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50";
  const variantClass =
    variant === "solid"
      ? "bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1.5 text-white shadow-sm hover:from-amber-500 hover:to-orange-500"
      : "px-2.5 py-1.5 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50 dark:text-amber-300 dark:ring-amber-800/60 dark:hover:bg-amber-950/40";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={generate.isPending}
      className={`${base} ${variantClass} ${className}`}
      aria-label={label ?? t("shoppingList.addMissing")}
    >
      <AddShoppingCartOutlined sx={{ fontSize: 16 }} />
      {generate.isPending ? t("shoppingList.adding") : (label ?? t("shoppingList.addMissing"))}
    </button>
  );
}
