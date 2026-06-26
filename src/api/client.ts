import { apiBaseUrl } from "@/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const data = (await response.json()) as { detail?: string | { msg: string }[] };
      if (typeof data.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data.detail)) {
        detail = data.detail.map((d) => d.msg).join(", ");
      }
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  version: number;
  /**
   * Effective permission keys (e.g. "RECIPE_MODERATE"). Exposed by the backend via /auth/me
   * once roles/permissions are populated (ClickUp 869dqfawy). Optional until that ships — the
   * frontend also falls back to the JWT `permissions` claim, so an absent field means "none".
   */
  roles?: string[];
  permissions?: string[];
  /** Subscription tier driving premium gating (e.g. "free" | "premium"). */
  tier?: string;
  /** Fine-grained entitlement keys, when the backend models premium features individually. */
  entitlements?: string[];
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export const api = {
  health: () => request<{ status: string }>("/api/v1/health"),

  register: (payload: RegisterPayload) =>
    request<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (username: string, password: string) => {
    const body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);

    return fetch(`${apiBaseUrl}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).then(async (response) => {
      if (!response.ok) {
        let detail = "Login failed";
        try {
          const data = (await response.json()) as { detail?: string };
          if (data.detail) detail = data.detail;
        } catch {
          /* ignore */
        }
        throw new ApiError(detail, response.status);
      }
      return response.json() as Promise<TokenResponse>;
    });
  },

  me: (token: string) =>
    request<User>("/api/v1/auth/me", {
      token,
    }),

  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),
};
