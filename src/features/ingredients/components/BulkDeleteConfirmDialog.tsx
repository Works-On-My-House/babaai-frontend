import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface BulkDeleteConfirmDialogProps {
  count: number;
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BulkDeleteConfirmDialog({
  count,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: BulkDeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={t("ingredients.bulkDeleteTitle")} size="md">
      <p className="text-sm text-stone-600 dark:text-stone-400">
        {t("ingredients.bulkDeleteConfirm", { count })}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? t("ingredients.deleting") : t("ingredients.bulkDeleteAction", { count })}
        </Button>
      </div>
    </Modal>
  );
}
