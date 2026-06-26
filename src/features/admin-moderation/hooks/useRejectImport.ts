import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminImportApi } from "@/features/admin-moderation/services/adminImportApi";
import type { RejectImportPayload } from "@/features/admin-moderation/types/adminImport";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

/**
 * Reject a pending import with a required reviewer note (ClickUp 869dtx804). The core records the
 * note and emails the submitter (869dtx7yv). Refreshes the queue on success.
 */
export function useRejectImport() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const translateApiError = useCallback(
    async (message: string) => {
      if (i18n.language === "en") return message;
      return translateText(message, i18n.language as AppLanguage, "en");
    },
    [i18n.language],
  );

  return useMutation({
    mutationFn: ({ id, note }: RejectImportPayload) => adminImportApi.reject(id, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminImports.all });
      toast.success(t("adminModeration.toast.rejected"));
    },
    onError: async (err) => {
      const message = err instanceof Error ? err.message : t("adminModeration.toast.rejectFailed");
      toast.error(await translateApiError(message));
    },
  });
}
