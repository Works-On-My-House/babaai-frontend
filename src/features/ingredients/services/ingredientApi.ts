import { http } from "@/api/axios";
import type {
  Ingredient,
  IngredientCreatePayload,
  IngredientListParams,
  IngredientUpdatePayload,
  PaginatedIngredients,
} from "@/features/ingredients/types/ingredient";

function buildParams(params: IngredientListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.page_size != null) query.page_size = params.page_size;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.category) query.category = params.category;
  if (params.sort_by) query.sort_by = params.sort_by;
  if (params.sort_order) query.sort_order = params.sort_order;
  return query;
}

export const ingredientApi = {
  list: async (params: IngredientListParams = {}): Promise<PaginatedIngredients> => {
    const { data } = await http.get<PaginatedIngredients>("/api/v1/ingredients", {
      params: buildParams(params),
    });
    return data;
  },

  get: async (id: string): Promise<Ingredient> => {
    const { data } = await http.get<Ingredient>(`/api/v1/ingredients/${id}`);
    return data;
  },

  create: async (payload: IngredientCreatePayload): Promise<Ingredient> => {
    const { data } = await http.post<Ingredient>("/api/v1/ingredients", payload);
    return data;
  },

  update: async (id: string, payload: IngredientUpdatePayload): Promise<Ingredient> => {
    const { data } = await http.put<Ingredient>(`/api/v1/ingredients/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`/api/v1/ingredients/${id}`);
  },

  deleteMany: async (ids: string[]): Promise<{ succeeded: string[]; failed: string[] }> => {
    const results = await Promise.allSettled(ids.map((id) => http.delete(`/api/v1/ingredients/${id}`)));
    const succeeded: string[] = [];
    const failed: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") succeeded.push(ids[index]);
      else failed.push(ids[index]);
    });
    return { succeeded, failed };
  },
};
