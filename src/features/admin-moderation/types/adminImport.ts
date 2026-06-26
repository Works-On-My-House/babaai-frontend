import type { RecipeImportStatus } from "@/features/recipeImports/types/recipeImport";
import type { BaseEntity, EntityId } from "@/types/entity";

/** The user who submitted an import, shown in the moderation queue (ClickUp 869dtx804). */
export interface ImportSubmitter {
  id: EntityId;
  username: string;
  email: string | null;
}

/** One ingredient line of the extracted recipe draft. */
export interface RecipeDraftIngredient {
  product_name: string;
  quantity: number | null;
  unit: string | null;
}

/**
 * The parsed/improved recipe draft produced from the uploaded file (ClickUp 869dtx7wb / 869dtx7xd).
 * Shown side-by-side with the original file so an admin can verify the extraction before approving.
 */
export interface RecipeDraft {
  name: string;
  category: string | null;
  steps: string[];
  ingredients: RecipeDraftIngredient[];
}

/** A pending import as listed in the global moderation queue. */
export interface AdminRecipeImport extends BaseEntity {
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: RecipeImportStatus;
  review_note: string | null;
  decided_at: string | null;
  submitter: ImportSubmitter;
}

/** Full detail for one import, including the extracted draft and a link to the original file. */
export interface AdminRecipeImportDetail extends AdminRecipeImport {
  draft: RecipeDraft | null;
}

export interface AdminRecipeImportList {
  items: AdminRecipeImport[];
  total: number;
}

export interface RejectImportPayload {
  id: EntityId;
  note: string;
}
