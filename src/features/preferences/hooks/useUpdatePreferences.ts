import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { preferencesApi } from "@/features/preferences/services/preferencesApi";
import type { Preferences } from "@/features/preferences/types/preferences";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

/**
 * Saves the taste profile, shows a toast consistent with the rest of the app, primes the
 * preferences cache with the server response and invalidates the "today" feed so it
 * re-personalizes (ClickUp 869dr0a4d).
 */
export function useUpdatePreferences() {
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
    mutationFn: (payload: Preferences) => preferencesApi.update(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.preferences.all, updated);
      // Re-personalize the daily / today suggestions with the new taste profile.
      void queryClient.invalidateQueries({ queryKey: ["recipes", "today"] });
      void queryClient.invalidateQueries({ queryKey: ["recipes", "daily"] });
      toast.success(t("preferences.toast.saved"));
    },
    onError: async (err) => {
      const message = err instanceof Error ? err.message : t("preferences.toast.saveFailed");
      toast.error(await translateApiError(message));
    },
  });
}
