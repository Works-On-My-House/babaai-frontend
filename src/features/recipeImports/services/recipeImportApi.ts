import { http } from "@/api/axios";
import type { MyRecipeImports, RecipeImport } from "@/features/recipeImports/types/recipeImport";

export const recipeImportApi = {
  /**
   * Upload a single recipe file as multipart/form-data. The field name must be `file`.
   * We pass `Content-Type: undefined` so axios lets the browser set the multipart boundary
   * instead of inheriting the instance default of application/json.
   */
  submit: async (file: File): Promise<RecipeImport> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await http.post<RecipeImport>("/api/v1/recipe-imports", formData, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  mine: async (): Promise<MyRecipeImports> => {
    const { data } = await http.get<MyRecipeImports>("/api/v1/recipe-imports/mine");
    return data;
  },
};
