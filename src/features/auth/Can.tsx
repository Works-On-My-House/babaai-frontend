import type { ReactNode } from "react";

import type { AppPermission } from "@/features/auth/permissions";
import { usePermissions } from "@/features/auth/usePermissions";

interface CanProps {
  /** Single permission required to render children. */
  permission?: AppPermission;
  /** Render when the user has ANY of these permissions. */
  anyOf?: AppPermission[];
  /** Render when the user has ALL of these permissions. */
  allOf?: AppPermission[];
  /** Rendered instead of children when the check fails (defaults to nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions (ClickUp 869dqfawy).
 * Use to hide nav entries and action buttons. Backend stays authoritative — this is UX only.
 *
 * @example <Can permission={PERMISSIONS.RECIPE_MODERATE}><AdminLink /></Can>
 */
export function Can({ permission, anyOf, allOf, fallback = null, children }: CanProps) {
  const { has, hasAny, hasAll } = usePermissions();

  const allowed =
    (permission ? has(permission) : true) &&
    (anyOf && anyOf.length > 0 ? hasAny(...anyOf) : true) &&
    (allOf && allOf.length > 0 ? hasAll(...allOf) : true);

  return <>{allowed ? children : fallback}</>;
}
