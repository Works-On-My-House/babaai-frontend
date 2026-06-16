import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { configApi } from "@/features/config/services/configApi";
import { queryKeys } from "@/lib/queryKeys";

const DEBOUNCE_MS = 300;

export function useInferCategory(name: string, enabled = true) {
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const trimmed = name.trim();
    const timer = window.setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [name]);

  const active = enabled && debounced.length >= 2;

  // Cache inferences for 5m so re-typing the same name is instant and doesn't refetch.
  const { data, isFetching } = useQuery({
    queryKey: queryKeys.config.inferCategory(debounced),
    queryFn: () => configApi.inferCategory(debounced),
    enabled: active,
    staleTime: 5 * 60 * 1000,
  });

  return {
    category: active ? data?.category ?? null : null,
    loading: active && isFetching,
  };
}
