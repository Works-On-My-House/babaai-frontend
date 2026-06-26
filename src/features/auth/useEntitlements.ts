import { useMemo } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { principalIsPremium, resolvePrincipal } from "@/features/auth/permissions";

export interface EntitlementsApi {
  /** Subscription tier (lowercased), or null when unknown. */
  tier: string | null;
  /** True when the user has a premium subscription / entitlement. */
  isPremium: boolean;
}

/**
 * Reads the current user's subscription entitlement (ClickUp 869dpd7ju premium gating).
 * Authoritative server-side; the UI gate is UX only and free users see an upsell, never a bypass.
 */
export function useEntitlements(): EntitlementsApi {
  const { user, token } = useAuth();

  return useMemo(() => {
    const principal = resolvePrincipal(user, token);
    return {
      tier: principal.tier,
      isPremium: principalIsPremium(principal),
    };
  }, [user, token]);
}
