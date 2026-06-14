import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { apiBaseUrl } from "@/config/env";
export const TOKEN_KEY = "babaai_access_token";

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
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data
      ? parseErrorDetail(error.response.data)
      : error.message || "Network error";
    return Promise.reject(new ApiError(message, status));
  },
);
