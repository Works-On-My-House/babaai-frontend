import { useQuery } from "@tanstack/react-query";

import { adminImportApi } from "@/features/admin-moderation/services/adminImportApi";
import { queryKeys } from "@/lib/queryKeys";

/** Detail (draft + metadata) for a single import, fetched when a queue row is opened. */
export function useImportDetail(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.adminImports.detail(id) : queryKeys.adminImports.detail("none"),
    queryFn: () => adminImportApi.detail(id as string),
    enabled: !!id,
  });
}
