import { useMemo } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import {
  principalHasPermission,
  resolvePrincipal,
  type AppPermission,
} from "@/features/auth/permissions";

export interface PermissionsApi {
  /** Effective permission keys for the current user. */
  permissions: string[];
  /** Effective role names for the current user. */
  roles: string[];
  /** True if the user has the given permission (super-admin roles short-circuit to true). */
  has: (permission: AppPermission) => boolean;
  /** True if the user has at least one of the given permissions. */
  hasAny: (...permissions: AppPermission[]) => boolean;
  /** True if the user has every one of the given permissions. */
  hasAll: (...permissions: AppPermission[]) => boolean;
}

/**
 * Reads the current user's effective permissions from the auth context (ClickUp 869dqfawy).
 * Source of truth is the backend (`/auth/me` / JWT claims); this is convenience-only UI hiding.
 */
export function usePermissions(): PermissionsApi {
  const { user, token } = useAuth();

  return useMemo(() => {
    const principal = resolvePrincipal(user, token);
    const has = (permission: AppPermission) => principalHasPermission(principal, permission);
    return {
      permissions: principal.permissions,
      roles: principal.roles,
      has,
      hasAny: (...permissions: AppPermission[]) => permissions.some(has),
      hasAll: (...permissions: AppPermission[]) => permissions.every(has),
    };
  }, [user, token]);
}
