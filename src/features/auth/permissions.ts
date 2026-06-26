/**
 * Frontend permission model (ClickUp 869dqfawy).
 *
 * The UI hides pages/actions a user cannot perform as a UX + defense-in-depth convenience.
 * Backend authorization stays authoritative — the server still returns 403 and the FE never
 * trusts the client. Effective permissions/roles/tier are read from the auth user (populated by
 * `/auth/me`) and, as a fallback, decoded from the JWT access-token claims so this keeps working
 * the moment the backend starts emitting them, with no further FE changes.
 */

/** Canonical permission keys. Mirror the backend `AppPermission` enum as it gets populated. */
export const PERMISSIONS = {
  /** Review user-submitted recipe imports and approve/reject them. */
  RECIPE_MODERATE: "RECIPE_MODERATE",
  /** Create/edit/delete catalog recipes. */
  RECIPE_CATALOG_MANAGE: "RECIPE_CATALOG_MANAGE",
  /** Manage roles/permissions and admin-only settings. */
  ADMIN_MANAGE: "ADMIN_MANAGE",
} as const;

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Roles that implicitly grant every permission, so a super admin is never locked out. */
const SUPERUSER_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

/** Subscription tiers that unlock premium features. */
export const PREMIUM_TIERS = new Set(["premium", "pro", "plus"]);

export interface PrincipalClaims {
  roles: string[];
  permissions: string[];
  tier: string | null;
  entitlements: string[];
}

const EMPTY_CLAIMS: PrincipalClaims = {
  roles: [],
  permissions: [],
  tier: null,
  entitlements: [],
};

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const normalized = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  if (typeof atob === "function") {
    // Handle UTF-8 payloads correctly (atob yields a binary string).
    const binary = atob(normalized);
    try {
      return decodeURIComponent(
        Array.from(binary, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
      );
    } catch {
      return binary;
    }
  }
  return "";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") {
    // Support space- or comma-delimited scope strings (common JWT convention).
    return value.split(/[\s,]+/).filter(Boolean);
  }
  return [];
}

/**
 * Best-effort decode of a JWT's payload claims. Never throws — a malformed/missing token yields
 * empty claims. Recognises a few common claim names so it tolerates whatever the backend settles on.
 */
export function decodeJwtClaims(token: string | null | undefined): PrincipalClaims {
  if (!token) return EMPTY_CLAIMS;
  const parts = token.split(".");
  if (parts.length < 2) return EMPTY_CLAIMS;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    const tierValue = payload.tier ?? payload.plan ?? payload.subscription;
    return {
      roles: toStringArray(payload.roles ?? payload.role),
      permissions: toStringArray(payload.permissions ?? payload.perms ?? payload.scope),
      tier: typeof tierValue === "string" ? tierValue.toLowerCase() : null,
      entitlements: toStringArray(payload.entitlements ?? payload.features),
    };
  } catch {
    return EMPTY_CLAIMS;
  }
}

/**
 * Merge the explicit user fields with JWT-claim fallbacks into a single principal view.
 * User fields win when present; otherwise we fall back to claims.
 */
export function resolvePrincipal(
  user: { roles?: string[]; permissions?: string[]; tier?: string; entitlements?: string[] } | null,
  token: string | null | undefined,
): PrincipalClaims {
  const claims = decodeJwtClaims(token);
  return {
    roles: user?.roles ?? claims.roles,
    permissions: user?.permissions ?? claims.permissions,
    tier: (user?.tier ?? claims.tier ?? null) || null,
    entitlements: user?.entitlements ?? claims.entitlements,
  };
}

export function principalHasPermission(principal: PrincipalClaims, permission: AppPermission): boolean {
  if (principal.roles.some((role) => SUPERUSER_ROLES.has(role.toUpperCase()))) return true;
  return principal.permissions.includes(permission);
}

export function principalIsPremium(principal: PrincipalClaims): boolean {
  if (principal.tier && PREMIUM_TIERS.has(principal.tier.toLowerCase())) return true;
  return principal.entitlements.includes("premium");
}
