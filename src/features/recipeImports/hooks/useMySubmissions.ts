import { useQuery } from "@tanstack/react-query";

import { recipeImportApi } from "@/features/recipeImports/services/recipeImportApi";
import { queryKeys } from "@/lib/queryKeys";

export function useMySubmissions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.recipeImports.mine,
    queryFn: () => recipeImportApi.mine(),
    enabled,
  });
}
