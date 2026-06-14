import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TranslatedText } from "@/components/TranslatedText";
import { useAppConfig } from "@/features/config/hooks/useAppConfig";
import { useInferCategory } from "@/features/ingredients/hooks/useInferCategory";
import type { Ingredient, IngredientCreatePayload } from "@/features/ingredients/types/ingredient";

interface FormState {
  name: string;
  quantity: string;
  unit: string;
  expiration_date: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  quantity?: string;
  unit?: string;
  expiration_date?: string;
}

interface IngredientFormModalProps {
  open: boolean;
  ingredient: Ingredient | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: IngredientCreatePayload) => Promise<void>;
}

const emptyForm = (defaultUnit: string): FormState => ({
  name: "",
  quantity: "1",
  unit: defaultUnit,
  expiration_date: "",
  notes: "",
});

function ingredientToForm(ingredient: Ingredient): FormState {
  return {
    name: ingredient.name,
    quantity: String(ingredient.quantity),
    unit: ingredient.unit,
    expiration_date: ingredient.expiration_date?.slice(0, 10) ?? "",
    notes: ingredient.notes ?? "",
  };
}

export function IngredientFormModal({
  open,
  ingredient,
  isSubmitting,
  onClose,
  onSubmit,
}: IngredientFormModalProps) {
  const { t } = useTranslation();
  const isEdit = ingredient != null;
  const { config, loading: configLoading, error: configError } = useAppConfig();
  const units = config?.ingredient_units ?? [];
  const [form, setForm] = useState<FormState>(emptyForm(units[0] ?? "pcs"));
  const [errors, setErrors] = useState<FormErrors>({});
  const { category: inferredCategory, loading: inferringCategory } = useInferCategory(
    form.name,
    open,
  );

  useEffect(() => {
    if (open) {
      setForm(ingredient ? ingredientToForm(ingredient) : emptyForm(units[0] ?? "pcs"));
      setErrors({});
    }
  }, [open, ingredient, units]);

  function validate(formState: FormState): FormErrors {
    const validation: FormErrors = {};
    const name = formState.name.trim();
    if (!name) validation.name = t("ingredients.validation.nameRequired");
    else if (name.length < 2) validation.name = t("ingredients.validation.nameMin");

    const qty = Number(formState.quantity);
    if (formState.quantity.trim() === "" || Number.isNaN(qty)) {
      validation.quantity = t("ingredients.validation.quantityNumber");
    } else if (qty <= 0) {
      validation.quantity = t("ingredients.validation.quantityPositive");
    }

    if (!formState.unit) validation.unit = t("ingredients.validation.unitRequired");

    if (formState.expiration_date) {
      const parsed = new Date(formState.expiration_date);
      if (Number.isNaN(parsed.getTime())) {
        validation.expiration_date = t("ingredients.validation.invalidDate");
      }
    }

    return validation;
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const payload: IngredientCreatePayload = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      expiration_date: form.expiration_date || null,
      notes: form.notes.trim() || null,
    };

    await onSubmit(payload);
  }

  const displayCategory = isEdit ? ingredient?.category : inferredCategory;

  if (!open) {
    return null;
  }

  if (configLoading || configError || units.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title={t("ingredients.addIngredient")} size="lg">
        <p className="text-sm text-stone-600 dark:text-stone-400" role="status">
          {configLoading ? t("common.loading") : (configError ?? t("common.configLoadFailed"))}
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("ingredients.editIngredient") : t("ingredients.addIngredient")}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t("ingredients.name")}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          placeholder={t("ingredients.namePlaceholder")}
          required
        />

        <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
            {t("ingredients.autoCategory")}
          </p>
          <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
            {form.name.trim() ? (
              displayCategory ? (
                <>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    <TranslatedText text={displayCategory} />
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {isEdit ? t("ingredients.categoryOnEdit") : t("ingredients.categoryOnSave")}
                  </span>
                </>
              ) : inferringCategory ? (
                <span className="text-stone-500">{t("ingredients.detectingCategory")}</span>
              ) : (
                <span className="text-stone-500">{t("ingredients.categoryWillAssign")}</span>
              )
            ) : (
              <span className="text-stone-500">{t("ingredients.enterNameForCategory")}</span>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("ingredients.quantity")}
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            error={errors.quantity}
            required
          />
          <Select
            label={t("ingredients.unit")}
            value={form.unit}
            onChange={(e) => updateField("unit", e.target.value)}
            error={errors.unit}
            options={units.map((u) => ({ value: u, label: u }))}
          />
        </div>

        <Input
          label={t("ingredients.expirationDate")}
          type="date"
          value={form.expiration_date}
          onChange={(e) => updateField("expiration_date", e.target.value)}
          error={errors.expiration_date}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {t("ingredients.notes")} ({t("common.optional")})
          </label>
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder={t("ingredients.notesPlaceholder")}
            className="w-full resize-none rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-stone-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-4 dark:border-stone-700 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting
              ? t("ingredients.saving")
              : isEdit
                ? t("ingredients.saveChanges")
                : t("ingredients.addIngredient")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
