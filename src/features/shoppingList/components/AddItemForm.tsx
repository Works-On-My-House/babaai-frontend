import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useShoppingListMutations } from "@/features/shoppingList/hooks/useShoppingListMutations";

/** Manual "add item" row for a shopping list (ClickUp 869dpd7jd). */
export function AddItemForm({ listId }: { listId: string }) {
  const { t } = useTranslation();
  const { addItem } = useShoppingListMutations();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const product_name = name.trim();
    if (!product_name) return;
    const parsedQty = quantity.trim() === "" ? null : Number(quantity);
    addItem.mutate(
      {
        listId,
        input: {
          product_name,
          quantity: parsedQty != null && Number.isNaN(parsedQty) ? null : parsedQty,
          unit: unit.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setName("");
          setQuantity("");
          setUnit("");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-white/60 bg-white/60 p-3 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/60"
    >
      <div className="min-w-[10rem] flex-1">
        <Input
          label={t("shoppingList.itemName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("shoppingList.itemNamePlaceholder")}
        />
      </div>
      <div className="w-20">
        <Input
          label={t("shoppingList.quantity")}
          type="number"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="w-24">
        <Input
          label={t("shoppingList.unit")}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder={t("shoppingList.unitPlaceholder")}
        />
      </div>
      <Button type="submit" disabled={addItem.isPending || !name.trim()}>
        {addItem.isPending ? t("shoppingList.adding") : t("shoppingList.addItem")}
      </Button>
    </form>
  );
}
