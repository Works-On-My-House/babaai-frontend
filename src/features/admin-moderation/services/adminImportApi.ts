import { http } from "@/api/axios";
import type {
  AdminRecipeImport,
  AdminRecipeImportDetail,
  AdminRecipeImportList,
} from "@/features/admin-moderation/types/adminImport";

const BASE = "/api/v1/admin/recipe-imports";

/**
 * Admin moderation API client (ClickUp 869dtx804). Targets the gateway's protected /api/v1/admin/**
 * routes (869dtx7z3); the core endpoints land in 869dtx7yv. Until then these 404/403 and the UI
 * shows its error/empty states.
 */
export const adminImportApi = {
  /** Global PENDING queue. `status` defaults to pending server-side; pass to view decided items. */
  listPending: async (): Promise<AdminRecipeImportList> => {
    const { data } = await http.get<AdminRecipeImportList>(BASE, {
      params: { status: "pending" },
    });
    return data;
  },

  detail: async (id: string): Promise<AdminRecipeImportDetail> => {
    const { data } = await http.get<AdminRecipeImportDetail>(`${BASE}/${id}`);
    return data;
  },

  /** Fetch the original uploaded file as a blob for preview/download (auth via http interceptor). */
  file: async (id: string): Promise<Blob> => {
    const { data } = await http.get<Blob>(`${BASE}/${id}/file`, { responseType: "blob" });
    return data;
  },

  approve: async (id: string): Promise<AdminRecipeImport> => {
    const { data } = await http.post<AdminRecipeImport>(`${BASE}/${id}/approve`);
    return data;
  },

  reject: async (id: string, note: string): Promise<AdminRecipeImport> => {
    const { data } = await http.post<AdminRecipeImport>(`${BASE}/${id}/reject`, { note });
    return data;
  },
};
