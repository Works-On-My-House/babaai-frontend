import { http } from "@/api/axios";
import type {
  AddShoppingListItemInput,
  GenerateShoppingListInput,
  ShoppingList,
  ShoppingListItem,
  ShoppingListsResponse,
  UpdateShoppingListItemInput,
} from "@/features/shoppingList/types/shoppingList";

const BASE = "/api/v1/shopping-lists";

/**
 * Shopping list API client (ClickUp 869dpd7jd). Targets the core API from 869dpd7jb; until that
 * ships these calls fail and the UI shows its empty/error states.
 */
export const shoppingListApi = {
  list: async (): Promise<ShoppingListsResponse> => {
    const { data } = await http.get<ShoppingListsResponse>(BASE);
    return data;
  },

  get: async (id: string): Promise<ShoppingList> => {
    const { data } = await http.get<ShoppingList>(`${BASE}/${id}`);
    return data;
  },

  /** Create a new list (or append to `list_id`) from a recipe / suggestions / explicit names. */
  generate: async (input: GenerateShoppingListInput): Promise<ShoppingList> => {
    const { data } = await http.post<ShoppingList>(`${BASE}/generate`, input);
    return data;
  },

  addItem: async (listId: string, input: AddShoppingListItemInput): Promise<ShoppingListItem> => {
    const { data } = await http.post<ShoppingListItem>(`${BASE}/${listId}/items`, input);
    return data;
  },

  updateItem: async (
    listId: string,
    itemId: string,
    input: UpdateShoppingListItemInput,
  ): Promise<ShoppingListItem> => {
    const { data } = await http.patch<ShoppingListItem>(`${BASE}/${listId}/items/${itemId}`, input);
    return data;
  },

  deleteItem: async (listId: string, itemId: string): Promise<void> => {
    await http.delete(`${BASE}/${listId}/items/${itemId}`);
  },

  /** Remove all checked items from a list in one call. */
  clearChecked: async (listId: string): Promise<ShoppingList> => {
    const { data } = await http.post<ShoppingList>(`${BASE}/${listId}/clear-checked`);
    return data;
  },

  deleteList: async (listId: string): Promise<void> => {
    await http.delete(`${BASE}/${listId}`);
  },
};
