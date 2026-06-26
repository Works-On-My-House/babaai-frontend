import { Outlet } from "react-router-dom";

import { ForbiddenPage } from "@/features/auth/ForbiddenPage";
import type { AppPermission } from "@/features/auth/permissions";
import { usePermissions } from "@/features/auth/usePermissions";

interface RequirePermissionProps {
  /** Permission required to enter the nested route(s). */
  permission?: AppPermission;
  /** Any of these permissions grants access. */
  anyOf?: AppPermission[];
}

/**
 * Route guard (ClickUp 869dqfawy). Wraps a route group; renders a friendly 403 instead of the
 * nested routes when the user lacks the required permission, so direct URL navigation is blocked.
 * Sits inside <ProtectedRoute>, which already handles the unauthenticated → /login redirect.
 */
export function RequirePermission({ permission, anyOf }: RequirePermissionProps) {
  const { has, hasAny } = usePermissions();

  const allowed =
    (permission ? has(permission) : true) && (anyOf && anyOf.length > 0 ? hasAny(...anyOf) : true);

  if (!allowed) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
