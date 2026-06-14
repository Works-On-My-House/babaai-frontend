import { Trans } from "react-i18next";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Ingredient } from "@/features/ingredients/types/ingredient";

interface DeleteConfirmDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  ingredient,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={t("ingredients.deleteIngredient")} size="md">
      <p className="text-sm text-stone-600 dark:text-stone-400">
        <Trans
          i18nKey="ingredients.deleteConfirm"
          values={{ name: ingredient?.name }}
          components={{ strong: <strong className="text-stone-900 dark:text-stone-100" /> }}
        />
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? t("ingredients.deleting") : t("common.delete")}
        </Button>
      </div>
    </Modal>
  );
}
