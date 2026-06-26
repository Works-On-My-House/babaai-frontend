import { useQuery } from "@tanstack/react-query";

import { adminImportApi } from "@/features/admin-moderation/services/adminImportApi";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Global PENDING import queue for admins (ClickUp 869dtx804). Only enabled when the caller
 * confirms permission, to avoid firing a 403 for non-moderators.
 */
export function usePendingImports(enabled = true) {
  return useQuery({
    queryKey: queryKeys.adminImports.pending,
    queryFn: () => adminImportApi.listPending(),
    enabled,
  });
}
