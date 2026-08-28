/**
 * Direct Backend API Client
 *
 * Executes direct network calls from the browser to the backend service.
 * Base URL defaults to process.env.NEXT_PUBLIC_BACKEND_API_URL or http://localhost:8080/api.
 *
 * Integrates with authTokenManager to attach in-memory Bearer tokens
 * without persisting them to browser storage (protecting against XSS).
 */

import { authTokenManager } from "./authTokenManager";

export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";

export class ApiClientError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function directApiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, skipAuth, headers: customHeaders, ...fetchOptions } = options;

  // Build full URL
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BACKEND_API_URL}${cleanPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Build headers
  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Attach in-memory token if available and not skipped
  if (!skipAuth) {
    const token = authTokenManager.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  // Parse response
  let responseData: any = null;
  const rawText = await response.text();

  if (rawText && rawText.trim()) {
    try {
      responseData = JSON.parse(rawText);
    } catch {
      responseData = rawText;
    }
  }

  if (!response.ok) {
    let errorMsg =
      response.statusText || `Request failed with status ${response.status}`;
    if (responseData) {
      if (typeof responseData === "object") {
        if (responseData.message) {
          errorMsg = Array.isArray(responseData.message)
            ? responseData.message.join(", ")
            : responseData.message;
        } else if (responseData.error) {
          errorMsg = responseData.error;
        }
      } else if (typeof responseData === "string") {
        errorMsg = responseData;
      }
    }
    throw new ApiClientError(errorMsg, response.status, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return directApiFetch<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return directApiFetch<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return directApiFetch<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return directApiFetch<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return directApiFetch<T>(path, { ...options, method: "DELETE" });
  },
};
