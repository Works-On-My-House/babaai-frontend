import { useQuery } from "@tanstack/react-query";

import { shoppingListApi } from "@/features/shoppingList/services/shoppingListApi";
import { queryKeys } from "@/lib/queryKeys";

/** Full detail (items) for a single shopping list. */
export function useShoppingList(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.shoppingLists.detail(id) : queryKeys.shoppingLists.detail("none"),
    queryFn: () => shoppingListApi.get(id as string),
    enabled: !!id,
  });
}
