import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";

import "@/i18n";

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  client?: QueryClient;
}

/** A fresh client per test: no retries / no caching bleed across tests. */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Render a component inside the same provider stack the app uses (React Query + Router + i18n),
 * mirroring main.tsx. Auth is mocked per-test via vi.mock("@/features/auth/AuthContext").
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", client = makeTestQueryClient(), ...options }: ProviderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
}
