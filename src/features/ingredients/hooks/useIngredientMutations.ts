import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ingredientApi } from "@/features/ingredients/services/ingredientApi";
import type {
  Ingredient,
  IngredientCreatePayload,
  IngredientUpdatePayload,
} from "@/features/ingredients/types/ingredient";
import type { AppLanguage } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { translateText } from "@/lib/translation/translateService";

export function useIngredientMutations(onSuccess?: () => void) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Invalidate every ingredient list (Ingredients page, Home pantry snapshot, etc.) plus the
  // recipe feeds that depend on the pantry, so a change shows up immediately on navigation
  // instead of waiting out the cache staleTime or a hard refresh.
  const invalidatePantry = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.recipes.all, "today"] });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.recipes.all, "rescue"] });
  }, [queryClient]);

  const translateApiError = useCallback(
    async (message: string) => {
      if (i18n.language === "en") return message;
      return translateText(message, i18n.language as AppLanguage, "en");
    },
    [i18n.language],
  );

  const create = useCallback(
    async (payload: IngredientCreatePayload): Promise<Ingredient | null> => {
      setIsSubmitting(true);
      try {
        const ingredient = await ingredientApi.create(payload);
        toast.success(t("ingredients.toast.added", { name: ingredient.name }));
        invalidatePantry();
        onSuccess?.();
        return ingredient;
      } catch (err) {
        const message = err instanceof Error ? err.message : t("ingredients.toast.createFailed");
        toast.error(await translateApiError(message));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [invalidatePantry, onSuccess, t, translateApiError],
  );

  const update = useCallback(
    async (id: string, payload: IngredientUpdatePayload): Promise<Ingredient | null> => {
      setIsSubmitting(true);
      try {
        const ingredient = await ingredientApi.update(id, payload);
        toast.success(t("ingredients.toast.updated", { name: ingredient.name }));
        invalidatePantry();
        onSuccess?.();
        return ingredient;
      } catch (err) {
        const message = err instanceof Error ? err.message : t("ingredients.toast.updateFailed");
        toast.error(await translateApiError(message));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [invalidatePantry, onSuccess, t, translateApiError],
  );

  const remove = useCallback(
    async (id: string, name?: string): Promise<boolean> => {
      setIsDeleting(true);
      try {
        await ingredientApi.delete(id);
        toast.success(
          name ? t("ingredients.toast.removed", { name }) : t("ingredients.toast.removedGeneric"),
        );
        invalidatePantry();
        onSuccess?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : t("ingredients.toast.deleteFailed");
        toast.error(await translateApiError(message));
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [invalidatePantry, onSuccess, t, translateApiError],
  );

  const removeMany = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (ids.length === 0) return true;
      setIsDeleting(true);
      try {
        const { succeeded, failed } = await ingredientApi.deleteMany(ids);
        if (succeeded.length > 0) {
          toast.success(t("ingredients.toast.removedBulk", { count: succeeded.length }));
          invalidatePantry();
          onSuccess?.();
        }
        if (failed.length > 0) {
          toast.error(t("ingredients.toast.deleteBulkFailed", { count: failed.length }));
        }
        return failed.length === 0;
      } catch (err) {
        const message = err instanceof Error ? err.message : t("ingredients.toast.deleteFailed");
        toast.error(await translateApiError(message));
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [invalidatePantry, onSuccess, t, translateApiError],
  );

  return { create, update, remove, removeMany, isSubmitting, isDeleting };
}
