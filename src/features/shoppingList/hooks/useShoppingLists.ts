import { useQuery } from "@tanstack/react-query";

import { shoppingListApi } from "@/features/shoppingList/services/shoppingListApi";
import { queryKeys } from "@/lib/queryKeys";

/** Index of the user's shopping lists (ClickUp 869dpd7jd). */
export function useShoppingLists(enabled = true) {
  return useQuery({
    queryKey: queryKeys.shoppingLists.list,
    queryFn: () => shoppingListApi.list(),
    enabled,
  });
}
