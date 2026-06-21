import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useSubmitRecipeImport } from "@/features/recipeImports/hooks/useSubmitRecipeImport";

export function UploadCard() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { mutate: submit, isPending } = useSubmitRecipeImport();

  function clearInput() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    submit(file, { onSuccess: clearInput });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/70 sm:p-7"
    >
      <div className="space-y-2">
        <label
          htmlFor="recipe-import-file"
          className="block text-sm font-medium text-stone-800 dark:text-stone-200"
        >
          {t("recipeImports.fileLabel")}
        </label>
        <input
          ref={inputRef}
          id="recipe-import-file"
          name="file"
          type="file"
          aria-describedby="recipe-import-hint"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full cursor-pointer rounded-xl border border-stone-200 bg-white/80 text-sm text-stone-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-amber-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-amber-800 hover:file:bg-amber-200 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300 dark:file:bg-amber-950/60 dark:file:text-amber-200"
        />
        <p id="recipe-import-hint" className="text-xs text-stone-500 dark:text-stone-400">
          {t("recipeImports.acceptedTypesHint")}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-700">
        {file && (
          <Button type="button" variant="ghost" size="sm" onClick={clearInput} disabled={isPending}>
            {t("recipeImports.clear")}
          </Button>
        )}
        <Button type="submit" disabled={!file || isPending}>
          {isPending ? t("recipeImports.submitting") : t("recipeImports.submit")}
        </Button>
      </div>
    </form>
  );
}
