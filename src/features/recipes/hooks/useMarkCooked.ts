import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { recipeApi } from "@/features/recipes/services/recipeApi";
import type { ConsumedLine, CookedResponse } from "@/features/recipes/types/recipe";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

interface MarkCookedVariables {
  recipeId: string;
  servings?: number;
}

/** Formats a deducted line as "quantity unit product_name", omitting the quantity when null. */
function formatConsumedLine(line: ConsumedLine): string {
  const amount = line.quantity != null ? `${line.quantity} ${line.unit}`.trim() : "";
  return amount ? `${amount} ${line.product_name}`.trim() : line.product_name;
}

/**
 * Marks a recipe as cooked (ClickUp 869dtvyct): the backend deducts the recipe's ingredients from
 * the user's pantry and logs it. On success it shows a toast summarizing what was deducted (and a
 * secondary note for ingredients it couldn't auto-deduct), then invalidates the pantry/ingredients
 * query and the today/daily suggestion feeds so they reflect the smaller pantry. Server `detail`
 * (e.g. "recipe not found") is surfaced verbatim on error, translated when the UI isn't English.
 */
export function useMarkCooked() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const translateApiError = useCallback(
    async (message: string) => {
      if (i18n.language === "en") return message;
      return translateText(message, i18n.language as AppLanguage, "en");
    },
    [i18n.language],
  );

  return useMutation<CookedResponse, Error, MarkCookedVariables>({
    mutationFn: ({ recipeId, servings }) => recipeApi.markCooked(recipeId, servings),
    onSuccess: (result) => {
      // Pantry changed: refresh the ingredient list and the suggestion feeds derived from it.
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
      void queryClient.invalidateQueries({ queryKey: ["recipes", "today"] });
      void queryClient.invalidateQueries({ queryKey: ["recipes", "daily"] });

      const deducted = result.consumed.map(formatConsumedLine).join(", ");
      const message = deducted
        ? t("recipes.cooked.toast.success", { items: deducted })
        : t("recipes.cooked.toast.successNoDeduction");

      const description =
        result.unmatched_ingredients.length > 0
          ? t("recipes.cooked.toast.unmatched", {
              items: result.unmatched_ingredients.join(", "),
            })
          : undefined;

      toast.success(message, description ? { description } : undefined);
    },
    onError: async (err) => {
      const message = err instanceof Error ? err.message : t("recipes.cooked.toast.failed");
      toast.error(await translateApiError(message));
    },
  });
}
