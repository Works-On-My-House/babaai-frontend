import { http } from "@/api/axios";

export interface PublicConfig {
  ingredient_categories: string[];
  ingredient_units: string[];
  default_min_match_percent: number;
  default_suggestion_limit: number;
  default_page_size: number;
  default_ingredient_category: string;
}

export interface InferCategoryResult {
  name: string;
  category: string;
}

export const configApi = {
  public: async (): Promise<PublicConfig> => {
    const { data } = await http.get<PublicConfig>("/api/v1/config/public");
    return data;
  },

  inferCategory: async (name: string): Promise<InferCategoryResult> => {
    const { data } = await http.get<InferCategoryResult>("/api/v1/config/infer-category", {
      params: { name },
    });
    return data;
  },
};
