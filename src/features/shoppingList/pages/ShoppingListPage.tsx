import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { AddItemForm } from "@/features/shoppingList/components/AddItemForm";
import { ShoppingListItemRow } from "@/features/shoppingList/components/ShoppingListItemRow";
import { useShoppingList } from "@/features/shoppingList/hooks/useShoppingList";
import { useShoppingLists } from "@/features/shoppingList/hooks/useShoppingLists";
import { useShoppingListMutations } from "@/features/shoppingList/hooks/useShoppingListMutations";
import type { ShoppingListItem } from "@/features/shoppingList/types/shoppingList";

const OTHER_GROUP = "__other__";

function groupByCategory(items: ShoppingListItem[]): [string, ShoppingListItem[]][] {
  const groups = new Map<string, ShoppingListItem[]>();
  for (const item of items) {
    const key = item.category?.trim() || OTHER_GROUP;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups.entries());
}

export function ShoppingListPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { data: lists, isLoading: listsLoading } = useShoppingLists(!!token);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { clearChecked, deleteList } = useShoppingListMutations();

  const summaries = useMemo(() => lists?.items ?? [], [lists]);

  // Default to the first list once data arrives; keep selection valid if lists change.
  useEffect(() => {
    if (summaries.length === 0) {
      setActiveId(null);
      return;
    }
    setActiveId((current) =>
      current && summaries.some((s) => s.id === current) ? current : summaries[0].id,
    );
  }, [summaries]);

  const { data: activeList, isLoading: detailLoading } = useShoppingList(activeId);

  const grouped = useMemo(
    () => (activeList ? groupByCategory(activeList.items) : []),
    [activeList],
  );
  const checkedCount = activeList?.items.filter((i) => i.checked).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 drop-shadow-sm dark:text-stone-50 sm:text-3xl">
          {t("shoppingList.title")}
        </h1>
        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
          {t("shoppingList.subtitle")}
        </p>
      </div>

      {listsLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl border border-white/60 bg-white/60 dark:border-stone-700 dark:bg-stone-900/50"
            />
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-6 py-12 text-center backdrop-blur-sm dark:border-amber-800/40 dark:bg-stone-900/60">
          <span className="text-4xl" aria-hidden>
            🛒
          </span>
          <h3 className="mt-3 text-base font-semibold text-stone-800 dark:text-stone-200">
            {t("shoppingList.emptyTitle")}
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("shoppingList.emptyDesc")}
          </p>
        </div>
      ) : (
        <>
          {summaries.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("shoppingList.title")}>
              {summaries.map((summary) => (
                <button
                  key={summary.id}
                  type="button"
                  role="tab"
                  aria-selected={summary.id === activeId}
                  onClick={() => setActiveId(summary.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    summary.id === activeId
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm"
                      : "bg-white/70 text-stone-600 ring-1 ring-stone-200 hover:bg-white dark:bg-stone-800/70 dark:text-stone-300 dark:ring-stone-700"
                  }`}
                >
                  {summary.name}
                  <span className="ml-1.5 text-xs opacity-80">
                    {summary.checked_count}/{summary.item_count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {detailLoading || !activeList ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl border border-white/60 bg-white/60 dark:border-stone-700 dark:bg-stone-900/50"
                />
              ))}
            </div>
          ) : (
            <section className="space-y-5 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/60 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {activeList.name}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {t("shoppingList.itemCount", {
                      checked: checkedCount,
                      total: activeList.items.length,
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => clearChecked.mutate(activeList.id)}
                    disabled={checkedCount === 0 || clearChecked.isPending}
                  >
                    {t("shoppingList.clearChecked")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      deleteList.mutate(activeList.id);
                      setActiveId(null);
                    }}
                    disabled={deleteList.isPending}
                  >
                    {t("shoppingList.deleteList")}
                  </Button>
                </div>
              </div>

              {activeList.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-300/70 bg-stone-50/60 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
                  {t("shoppingList.listEmpty")}
                </p>
              ) : (
                <div className="space-y-5">
                  {grouped.map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                        {category === OTHER_GROUP ? t("shoppingList.otherGroup") : category}
                      </h3>
                      {items.map((item) => (
                        <ShoppingListItemRow key={item.id} listId={activeList.id} item={item} />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <AddItemForm listId={activeList.id} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
