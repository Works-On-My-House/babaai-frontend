import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useMarkCooked } from "@/features/recipes/hooks/useMarkCooked";

interface CookedItButtonProps {
  recipeId: string;
  className?: string;
}

/**
 * "Cooked it" action (ClickUp 869dtvyct). Marks a recipe as cooked so the backend deducts its
 * ingredients from the user's pantry; the result is surfaced via a toast by {@link useMarkCooked}.
 * MVP sends no servings. The button is disabled (and aria-busy) while pending so it can't double-fire.
 */
export function CookedItButton({ recipeId, className = "" }: CookedItButtonProps) {
  const { t } = useTranslation();
  const { mutate, isPending } = useMarkCooked();

  return (
    <Button
      variant="secondary"
      onClick={() => mutate({ recipeId })}
      disabled={isPending}
      aria-busy={isPending}
      className={className}
    >
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        style={{ height: "1.1rem", width: "1.1rem" }}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      {isPending ? t("recipes.cooked.pending") : t("recipes.cooked.button")}
    </Button>
  );
}
