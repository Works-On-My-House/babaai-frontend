import { http } from "@/api/axios";
import type { Preferences } from "@/features/preferences/types/preferences";

export const preferencesApi = {
  get: async (): Promise<Preferences> => {
    const { data } = await http.get<Preferences>("/api/v1/preferences");
    return data;
  },

  update: async (payload: Preferences): Promise<Preferences> => {
    const { data } = await http.put<Preferences>("/api/v1/preferences", payload);
    return data;
  },
};
