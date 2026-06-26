import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminImportApi } from "@/features/admin-moderation/services/adminImportApi";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

/**
 * Approve a pending import (ClickUp 869dtx804). On success the core transfers the draft into the
 * verified catalog and emails the submitter (869dtx7yv); the FE just refreshes the queue.
 */
export function useApproveImport() {
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
    mutationFn: (id: string) => adminImportApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminImports.all });
      toast.success(t("adminModeration.toast.approved"));
    },
    onError: async (err) => {
      const message = err instanceof Error ? err.message : t("adminModeration.toast.approveFailed");
      toast.error(await translateApiError(message));
    },
  });
}
