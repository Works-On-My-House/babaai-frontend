import type { BaseEntity } from "@/types/entity";

export type RecipeImportStatus = "pending" | "approved" | "rejected";

/**
 * A user-submitted recipe file awaiting admin moderation (ClickUp 869dtx7zk).
 * Shape mirrors the backend snake_case payload from /api/v1/recipe-imports.
 */
export interface RecipeImport extends BaseEntity {
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: RecipeImportStatus;
  /** Populated when an admin approves/rejects with a note; otherwise null. */
  review_note: string | null;
  /** Null until an admin decides. */
  decided_at: string | null;
}

export interface MyRecipeImports {
  items: RecipeImport[];
  total: number;
}
