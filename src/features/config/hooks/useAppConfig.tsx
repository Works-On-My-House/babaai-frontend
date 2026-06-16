import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { configApi, type PublicConfig } from "@/features/config/services/configApi";
import { queryKeys } from "@/lib/queryKeys";

interface AppConfigContextValue {
  config: PublicConfig | null;
  loading: boolean;
  error: string | null;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  // Public config is semi-static — cache it for 30m so navigations don't refetch (PERF-1.6).
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.config.public,
    queryFn: configApi.public,
    staleTime: 30 * 60 * 1000,
  });

  const value: AppConfigContextValue = {
    config: data ?? null,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load application configuration"
      : null,
  };

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfigContextValue {
  const value = useContext(AppConfigContext);
  if (!value) {
    throw new Error("useAppConfig must be used within AppConfigProvider");
  }
  return value;
}
