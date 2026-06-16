import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { apiBaseUrl } from "@/config/env";
export const TOKEN_KEY = "babaai_access_token";
export const AUTH_LOGOUT_EVENT = "auth:logout";
export const AUTH_REFRESHED_EVENT = "auth:refreshed";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function parseErrorDetail(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const obj = data as { detail?: string | { msg: string }[] };
  if (typeof obj.detail === "string") return obj.detail;
  if (Array.isArray(obj.detail)) {
    return obj.detail.map((d) => d.msg).join(", ");
  }
  return "Request failed";
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  // Send/receive the httpOnly refresh-token cookie cross-origin (gateway has allowCredentials).
  withCredentials: true,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh: concurrent 401s (and AuthContext on load) share one /auth/refresh call.
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access_token: string }>(`${apiBaseUrl}/api/v1/auth/refresh`, null, { withCredentials: true })
      .then((response) => {
        const token = response.data.access_token;
        localStorage.setItem(TOKEN_KEY, token);
        window.dispatchEvent(new CustomEvent(AUTH_REFRESHED_EVENT, { detail: token }));
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function forceLogout() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes("/auth/") ?? false;

    // On 401, try a refresh once, then retry the original request. Never loop on /auth/* calls.
    // This also handles the gateway's instant permission-revocation 401 (header
    // X-Auth-Error: token_stale, ClickUp 869dqmbfp): refresh mints a token with the updated
    // permissions/pv and the retry succeeds (or 403s if the permission is genuinely gone).
    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch {
        forceLogout();
      }
    }

    const message = error.response?.data
      ? parseErrorDetail(error.response.data)
      : error.message || "Network error";
    return Promise.reject(new ApiError(message, status));
  },
);
