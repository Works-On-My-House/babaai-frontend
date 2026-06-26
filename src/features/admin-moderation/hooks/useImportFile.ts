import { useQuery } from "@tanstack/react-query";

import { adminImportApi } from "@/features/admin-moderation/services/adminImportApi";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Fetches the original uploaded file as a blob (auth header added by the http interceptor), so the
 * admin can preview/download it. A plain <img>/<a href> can't carry the bearer token, hence the
 * blob fetch + object URL approach in {@link OriginalFilePreview}.
 */
export function useImportFile(id: string | null, enabled = true) {
  return useQuery({
    queryKey: id ? queryKeys.adminImports.file(id) : queryKeys.adminImports.file("none"),
    queryFn: () => adminImportApi.file(id as string),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}
