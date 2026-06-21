import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { recipeImportApi } from "@/features/recipeImports/services/recipeImportApi";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

/**
 * Uploads a recipe file as a PENDING import for admin moderation (ClickUp 869dtx7zk),
 * shows a toast consistent with the rest of the app, and refreshes the my-submissions list.
 * Server `detail` (e.g. file too large / unsupported) is surfaced verbatim, translated
 * when the UI is not in English.
 */
export function useSubmitRecipeImport() {
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
    mutationFn: (file: File) => recipeImportApi.submit(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipeImports.mine });
      toast.success(t("recipeImports.toast.submitted"));
    },
    onError: async (err) => {
      const message = err instanceof Error ? err.message : t("recipeImports.toast.submitFailed");
      toast.error(await translateApiError(message));
    },
  });
}
