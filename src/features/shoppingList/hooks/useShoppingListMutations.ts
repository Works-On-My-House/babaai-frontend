import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { shoppingListApi } from "@/features/shoppingList/services/shoppingListApi";
import type {
  AddShoppingListItemInput,
  GenerateShoppingListInput,
  ShoppingList,
  UpdateShoppingListItemInput,
} from "@/features/shoppingList/types/shoppingList";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

interface ToggleVars {
  listId: string;
  itemId: string;
  checked: boolean;
}

interface UpdateItemVars {
  listId: string;
  itemId: string;
  input: UpdateShoppingListItemInput;
}

interface AddItemVars {
  listId: string;
  input: AddShoppingListItemInput;
}

/**
 * All shopping-list write operations (ClickUp 869dpd7jd) with toasts and query invalidation.
 * `toggleItem` applies an optimistic check-off and rolls back on error, mirroring the
 * useFavorites / useIngredientMutations conventions.
 */
export function useShoppingListMutations() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const translateApiError = useCallback(
    async (message: string) => {
      if (i18n.language === "en") return message;
      return translateText(message, i18n.language as AppLanguage, "en");
    },
    [i18n.language],
  );

  const onError = useCallback(
    async (err: unknown, fallbackKey: string) => {
      const message = err instanceof Error ? err.message : t(fallbackKey);
      toast.error(await translateApiError(message));
    },
    [t, translateApiError],
  );

  const invalidateAll = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.all });
  }, [queryClient]);

  const generate = useMutation({
    mutationFn: (input: GenerateShoppingListInput) => shoppingListApi.generate(input),
    onSuccess: (list) => {
      queryClient.setQueryData(queryKeys.shoppingLists.detail(list.id), list);
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.list });
      toast.success(t("shoppingList.toast.generated"));
    },
    onError: (err) => onError(err, "shoppingList.toast.generateFailed"),
  });

  const addItem = useMutation({
    mutationFn: ({ listId, input }: AddItemVars) => shoppingListApi.addItem(listId, input),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.detail(listId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.list });
    },
    onError: (err) => onError(err, "shoppingList.toast.addFailed"),
  });

  const toggleItem = useMutation({
    mutationFn: ({ listId, itemId, checked }: ToggleVars) =>
      shoppingListApi.updateItem(listId, itemId, { checked }),
    onMutate: async ({ listId, itemId, checked }: ToggleVars) => {
      const key = queryKeys.shoppingLists.detail(listId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ShoppingList>(key);
      if (previous) {
        queryClient.setQueryData<ShoppingList>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === itemId ? { ...item, checked } : item,
          ),
        });
      }
      return { key, previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      void onError(err, "shoppingList.toast.updateFailed");
    },
    onSettled: (_data, _err, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.detail(listId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.list });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ listId, itemId, input }: UpdateItemVars) =>
      shoppingListApi.updateItem(listId, itemId, input),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.detail(listId) });
    },
    onError: (err) => onError(err, "shoppingList.toast.updateFailed"),
  });

  const deleteItem = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      shoppingListApi.deleteItem(listId, itemId),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.detail(listId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.list });
    },
    onError: (err) => onError(err, "shoppingList.toast.deleteFailed"),
  });

  const clearChecked = useMutation({
    mutationFn: (listId: string) => shoppingListApi.clearChecked(listId),
    onSuccess: (list) => {
      queryClient.setQueryData(queryKeys.shoppingLists.detail(list.id), list);
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.list });
      toast.success(t("shoppingList.toast.clearedChecked"));
    },
    onError: (err) => onError(err, "shoppingList.toast.updateFailed"),
  });

  const deleteList = useMutation({
    mutationFn: (listId: string) => shoppingListApi.deleteList(listId),
    onSuccess: () => {
      invalidateAll();
      toast.success(t("shoppingList.toast.listDeleted"));
    },
    onError: (err) => onError(err, "shoppingList.toast.deleteFailed"),
  });

  return {
    generate,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    clearChecked,
    deleteList,
  };
}
