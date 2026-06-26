import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@mui/icons-material";

import { TranslatedText } from "@/components/TranslatedText";
import type { ShoppingListItem } from "@/features/shoppingList/types/shoppingList";
import { useShoppingListMutations } from "@/features/shoppingList/hooks/useShoppingListMutations";

interface ShoppingListItemRowProps {
  listId: string;
  item: ShoppingListItem;
}

export function ShoppingListItemRow({ listId, item }: ShoppingListItemRowProps) {
  const { t } = useTranslation();
  const { toggleItem, updateItem, deleteItem } = useShoppingListMutations();
  const [quantity, setQuantity] = useState<string>(item.quantity != null ? String(item.quantity) : "");

  // Keep the local edit field in sync if the server value changes underneath us.
  useEffect(() => {
    setQuantity(item.quantity != null ? String(item.quantity) : "");
  }, [item.quantity]);

  function commitQuantity() {
    const trimmed = quantity.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && Number.isNaN(parsed)) {
      setQuantity(item.quantity != null ? String(item.quantity) : "");
      return;
    }
    if (parsed === item.quantity) return;
    updateItem.mutate({ listId, itemId: item.id, input: { quantity: parsed } });
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200/70 bg-white/80 px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800/60">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => toggleItem.mutate({ listId, itemId: item.id, checked: e.target.checked })}
        aria-label={t("shoppingList.toggleItem", { name: item.product_name })}
        className="h-5 w-5 shrink-0 cursor-pointer rounded border-stone-300 text-amber-600 focus:ring-amber-400/40"
      />

      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          item.checked
            ? "text-stone-400 line-through dark:text-stone-500"
            : "text-stone-800 dark:text-stone-200"
        }`}
      >
        <TranslatedText text={item.product_name} />
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={commitQuantity}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          aria-label={t("shoppingList.quantityFor", { name: item.product_name })}
          className="w-16 rounded-lg border border-stone-200 bg-white/90 px-2 py-1 text-right text-sm text-stone-700 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-200"
        />
        {item.unit && (
          <span className="w-10 text-xs text-stone-500 dark:text-stone-400">{item.unit}</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => deleteItem.mutate({ listId, itemId: item.id })}
        aria-label={t("shoppingList.deleteItem", { name: item.product_name })}
        className="shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
      >
        <DeleteOutlined sx={{ fontSize: 18 }} />
      </button>
    </div>
  );
}
