import { http } from "@/api/axios";
import type {
  DailyPicksResponse,
  FavoriteListResponse,
  FavoriteResponse,
  PaginatedRecipes,
  PaginatedSuggestionHistory,
  Recipe,
  RecipeListParams,
  SuggestionHistoryParams,
  SuggestionRequest,
  SuggestionResponse,
  TodaySuggestions,
} from "@/features/recipes/types/recipe";

function buildListParams(params: RecipeListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.page_size != null) query.page_size = params.page_size;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.category) query.category = params.category;
  return query;
}

function buildHistoryParams(params: SuggestionHistoryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.page_size != null) query.page_size = params.page_size;
  if (params.from_date) query.from_date = params.from_date;
  if (params.to_date) query.to_date = params.to_date;
  return query;
}

export const recipeApi = {
  list: async (params: RecipeListParams = {}): Promise<PaginatedRecipes> => {
    const { data } = await http.get<PaginatedRecipes>("/api/v1/recipes", {
      params: buildListParams(params),
    });
    return data;
  },

  categories: async (): Promise<string[]> => {
    const { data } = await http.get<{ categories: string[] }>("/api/v1/recipes/categories");
    return data.categories;
  },

  get: async (id: string): Promise<Recipe> => {
    const { data } = await http.get<Recipe>(`/api/v1/recipes/${id}`);
    return data;
  },

  featured: async (): Promise<Recipe | null> => {
    const { data } = await http.get<Recipe | null>("/api/v1/recipes/featured");
    return data;
  },

  daily: async (limit = 4): Promise<DailyPicksResponse> => {
    const { data } = await http.get<DailyPicksResponse>("/api/v1/recipes/daily", {
      params: { limit },
    });
    return data;
  },

  today: async (limit = 4): Promise<TodaySuggestions> => {
    const { data } = await http.get<TodaySuggestions>("/api/v1/recipes/today", {
      params: { limit },
    });
    return data;
  },

  recordView: async (id: string): Promise<Recipe> => {
    const { data } = await http.post<Recipe>(`/api/v1/recipes/${id}/view`);
    return data;
  },

  favorites: async (): Promise<FavoriteListResponse> => {
    const { data } = await http.get<FavoriteListResponse>("/api/v1/recipes/favorites");
    return data;
  },

  addFavorite: async (id: string): Promise<FavoriteResponse> => {
    const { data } = await http.post<FavoriteResponse>(`/api/v1/recipes/${id}/favorite`);
    return data;
  },

  removeFavorite: async (id: string): Promise<FavoriteResponse> => {
    const { data } = await http.delete<FavoriteResponse>(`/api/v1/recipes/${id}/favorite`);
    return data;
  },

  generateSuggestions: async (payload: SuggestionRequest = {}): Promise<SuggestionResponse> => {
    const { data } = await http.post<SuggestionResponse>("/api/v1/recipes/suggestions", payload);
    return data;
  },

  history: async (params: SuggestionHistoryParams = {}): Promise<PaginatedSuggestionHistory> => {
    const { data } = await http.get<PaginatedSuggestionHistory>("/api/v1/recipes/history", {
      params: buildHistoryParams(params),
    });
    return data;
  },
};
