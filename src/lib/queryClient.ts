import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client (PERF-1.6).
 *
 * Defaults give every query stale-while-revalidate behaviour: data is served from cache for
 * `staleTime`, kept in memory for `gcTime` after the last observer unmounts, and refreshed when the
 * window regains focus. Individual queries override `staleTime` for longer-lived data
 * (categories 5m, public config 30m).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
      gcTime: 5 * 60 * 1000, // 5 min
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
